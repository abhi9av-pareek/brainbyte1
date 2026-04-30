import fetch from "node-fetch";
const NVIDIA_API_URL = "https://integrate.api.nvidia.com/v1/chat/completions";
const NVIDIA_MODEL = "deepseek-ai/deepseek-v4-flash";

const buildPrompt = (subjects, difficulty, count, timePerQuestion) => {
  const subjectList = Array.isArray(subjects) ? subjects.join(", ") : subjects;
  const difficultyGuide = {
    Easy: "basic recall, definitions, simple concepts for beginners",
    Medium: "applied thinking, multi-step reasoning, conceptual understanding",
    Hard: "advanced analysis, edge cases, exam-level problem solving",
  };

  return `You are a strict JSON generator.

  You MUST follow all instructions exactly.
  You MUST return ONLY valid JSON.
  You MUST NOT include any text outside JSON.

  TASK:
  Generate a quiz with the following:

  Subject: ${subjectList}
  Difficulty: ${difficulty} — ${difficultyGuide[difficulty] || difficultyGuide.Medium}
  Number of Questions: ${count}
  Time Per Question: ${timePerQuestion} seconds

  STRICT RULES:
  - EXACTLY ${count} questions
  - EACH question has EXACTLY 4 options
  - correctAnswer MUST be one of: "A", "B", "C", "D"
  - Include subject and topic for every question
  - Include explanation
  - NO markdown
  - NO backticks
  - NO text before or after JSON

  OUTPUT FORMAT:
  {
    "quiz": [
      {
        "subject": "subject name",
        "topic": "specific sub-topic",
        "question": "question text",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": "A",
        "explanation": "..."
      }
    ]
  }

  FINAL WARNING:
  If you output anything outside JSON, the system will FAIL.
  IMPORTANT:
    - Output MUST start with { and end with }
    - Do NOT write "Here is your quiz"
    - Do NOT add any explanation before or after JSON
    - Do NOT use markdown or backticks
    - Return strictly valid JSON only
  Return JSON now.`;
};

const letterToIndex = (letter) => {
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(letter).toUpperCase().trim()] ?? 0;
};

const callDeepSeek = async (prompt) => {
  const MAX_RETRIES = 3;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    let response;

    try {
      response = await fetch(NVIDIA_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.NVIDIA_API_KEY}`,
        },
        body: JSON.stringify({
          model: NVIDIA_MODEL,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.3, // 🔥 lower = more stable JSON
          max_tokens: 2000,
        }),
      });
    } catch (err) {
      if (attempt === MAX_RETRIES) {
        throw new Error("Cannot connect to NVIDIA API");
      }
      continue;
    }

    if (!response.ok) {
      const errText = await response.text();
      if (attempt === MAX_RETRIES) {
        throw new Error(`NVIDIA API error ${response.status}: ${errText}`);
      }
      continue;
    }

    const data = await response.json();
    const rawText = data?.choices?.[0]?.message?.content;

    if (!rawText) {
      if (attempt === MAX_RETRIES) {
        throw new Error("DeepSeek returned empty response");
      }
      continue;
    }

    console.log(
      `Attempt ${attempt} - Raw response (first 200 chars):`,
      rawText.slice(0, 200),
    );

    try {
      // 🔥 CLEANING PHASE
      let cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .replace(/\u0000/g, "") // remove null chars
        .trim();

      // cut from first {
      const firstBrace = cleaned.indexOf("{");
      if (firstBrace !== -1) {
        cleaned = cleaned.slice(firstBrace);
      }

      // cut till last }
      const lastBrace = cleaned.lastIndexOf("}");
      if (lastBrace !== -1) {
        cleaned = cleaned.slice(0, lastBrace + 1);
      }

      // 🔥 FIX common JSON issues
      cleaned = cleaned
        .replace(/,\s*}/g, "}") // trailing commas
        .replace(/,\s*]/g, "]");

      const parsed = JSON.parse(cleaned);

      const questions = Array.isArray(parsed) ? parsed : parsed?.quiz;

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("No questions found");
      }

      return questions;
    } catch (parseError) {
      console.warn(`Attempt ${attempt} failed to parse JSON`);

      if (attempt === MAX_RETRIES) {
        console.error("Final raw response:", rawText);
        throw new Error("Could not parse DeepSeek response as JSON");
      }
    }
  }
};
const sanitizeQuestion = (q, index) => {
  if (
    typeof q.question !== "string" ||
    !Array.isArray(q.options) ||
    q.options.length !== 4
  ) {
    throw new Error(`Question at index ${index} has invalid structure`);
  }

  return {
    subject: q.subject || "General",
    topic: q.topic || "General",
    question: q.question.trim(),
    options: q.options.map((o) => String(o).trim()),
    answer: letterToIndex(q.correctAnswer ?? "A"),
    explanation: q.explanation || "No explanation provided.",
  };
};

export const generateQuestions = async (req, res) => {
  try {
    const {
      subjects,
      difficulty = "Medium",
      count = 10,
      timePerQuestion = 30,
    } = req.body;

    if (!subjects || (Array.isArray(subjects) && subjects.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one subject is required",
      });
    }

    const safeCount = Math.min(Math.max(Number(count), 5), 20);
    const safeDifficulty = ["Easy", "Medium", "Hard"].includes(difficulty)
      ? difficulty
      : "Medium";

    console.log(
      `Generating ${safeCount} ${safeDifficulty} questions on:`,
      subjects,
    );

    const prompt = buildPrompt(
      subjects,
      safeDifficulty,
      safeCount,
      timePerQuestion,
    );

    const rawQuestions = await callDeepSeek(prompt);

    const questions = rawQuestions
      .slice(0, safeCount)
      .map((q, i) => sanitizeQuestion(q, i));

    console.log(`Successfully generated ${questions.length} questions`);

    res.status(200).json({
      success: true,
      questions,
      meta: {
        subjects: Array.isArray(subjects) ? subjects : [subjects],
        difficulty: safeDifficulty,
        count: questions.length,
        model: NVIDIA_MODEL,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("generateQuestions error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message.includes("Cannot connect")
        ? "NVIDIA API is not reachable"
        : "Failed to generate questions",
      error: error.message,
    });
  }
};
