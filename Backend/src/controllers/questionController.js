const OLLAMA_URL = "http://localhost:11434/api/generate";
const OLLAMA_MODEL = "llama3";

const buildPrompt = (subjects, difficulty, count, timePerQuestion) => {
  const subjectList = Array.isArray(subjects) ? subjects.join(", ") : subjects;
  const difficultyGuide = {
    Easy: "basic recall, definitions, simple concepts for beginners",
    Medium: "applied thinking, multi-step reasoning, conceptual understanding",
    Hard: "advanced analysis, edge cases, exam-level problem solving",
  };

  return `You are an AI quiz generator.
  Generate a high-quality quiz based on these requirements:

  Subject: ${subjectList}
  Difficulty: ${difficulty} — ${difficultyGuide[difficulty] || difficultyGuide.Medium}
  Number of Questions: ${count}
  Time Per Question: ${timePerQuestion} seconds

  RULES:
  1. Generate EXACTLY ${count} questions
  2. Distribute questions evenly across all subjects if multiple
  3. Each question must have exactly 4 options
  4. correctAnswer must be exactly "A", "B", "C", or "D"
  5. Include a specific topic and brief explanation for each question
  6. Match difficulty strictly

  Return ONLY this JSON, no extra text, no markdown:
  {
    "quiz": [
      {
        "subject": "subject name",
        "topic": "specific sub-topic",
        "question": "question text",
        "options": ["option A text", "option B text", "option C text", "option D text"],
        "correctAnswer": "A",
        "explanation": "why this answer is correct"
      }
    ]
  }

  IMPORTANT:
  - Output MUST start with { and end with }
  - Do NOT write "Here is your quiz"
  - Do NOT add any explanation before or after JSON
  - Do NOT use markdown or backticks
  - Return strictly valid JSON only`;
};

const letterToIndex = (letter) => {
  const map = { A: 0, B: 1, C: 2, D: 3 };
  return map[String(letter).toUpperCase().trim()] ?? 0;
};

const callOllama = async (prompt) => {
  let response;
  try {
    response = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: { temperature: 0.7, num_predict: 8192 },
      }),
    });
  } catch (err) {
    throw new Error("Cannot connect to Ollama. Run: ollama serve");
  }

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Ollama error ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.response;
  if (!rawText) throw new Error("Ollama returned empty response");

  console.log("Raw Ollama response (first 300 chars):", rawText.slice(0, 300));

  let cleaned = rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  //remove anything before first {
  const firstBrace = cleaned.indexOf("{");
  if (firstBrace !== -1) {
    cleaned = cleaned.slice(firstBrace);
  }

  //remove anything after last }
  const lastBrace = cleaned.lastIndexOf("}");
  if (lastBrace !== -1) {
    cleaned = cleaned.slice(0, lastBrace + 1);
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      parsed = JSON.parse(match[0]);
    } else {
      console.error("Full raw response:", rawText);
      throw new Error("Could not parse Ollama response as JSON");
    }
  }

  const questions = Array.isArray(parsed) ? parsed : parsed?.quiz;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error("No questions found in Ollama response");
  }

  return questions;
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

    const safeCount = Math.min(Math.max(Number(count), 5), 50);
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
    const rawQuestions = await callOllama(prompt);
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
        model: OLLAMA_MODEL,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("generateQuestions error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message.includes("Cannot connect to Ollama")
        ? "Ollama is not running. Start it with: ollama serve"
        : "Failed to generate questions",
      error: error.message,
    });
  }
};
