import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig"; // ✅ use axios so interceptor attaches token

/* ─── CSS (converted from brainbyte_mcq_quiz.html) ─── */
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0B0F; --surface: #111318; --surface2: #181B23;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
    --accent: #7C5CFC; --accent2: #00E5C0; --accent3: #FF6B6B;
    --amber: #FFB347; --text: #F0EFF8; --muted: #7B7A8C; --muted2: #3A394A;
  }
  .qz-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  /* NAV */
  .qz-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; border-bottom: 1px solid var(--border); background: rgba(10,11,15,0.97); position: sticky; top: 0; z-index: 100; }
  .qz-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; display: flex; align-items: center; gap: 8px; }
  .qz-logo-icon { width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .qz-logo span { color: var(--accent2); }
  .qz-nav-meta { display: flex; align-items: center; gap: 16px; }
  .qz-nav-tag { font-size: 12px; font-weight: 600; padding: 4px 12px; border-radius: 20px; }
  .tag-easy   { background: rgba(0,229,192,0.15);  color: var(--accent2); border: 1px solid rgba(0,229,192,0.25); }
  .tag-medium { background: rgba(255,179,71,0.15); color: var(--amber);   border: 1px solid rgba(255,179,71,0.25); }
  .tag-hard   { background: rgba(255,107,107,0.15);color: var(--accent3); border: 1px solid rgba(255,107,107,0.25); }
  .qz-nav-subjects { font-size: 12px; color: var(--muted); max-width: 320px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .qz-nav-right { display: flex; align-items: center; gap: 12px; }
  .qz-quit-btn { font-size: 13px; color: var(--muted); background: none; border: 1px solid var(--muted2); border-radius: 8px; padding: 5px 14px; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .qz-quit-btn:hover { border-color: var(--accent3); color: var(--accent3); }

  /* PROGRESS BAR */
  .qz-progress-wrap { height: 3px; background: var(--muted2); width: 100%; }
  .qz-progress-fill { height: 100%; background: linear-gradient(90deg, var(--accent), var(--accent2)); transition: width .4s ease; }

  /* MAIN */
  .qz-main { max-width: 780px; margin: 0 auto; padding: 1.5rem 1.5rem 3rem; }

  /* LOADING / ERROR */
  .qz-center { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60vh; gap: 16px; text-align: center; }
  .qz-spinner { width: 44px; height: 44px; border: 3px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: qz-spin 0.8s linear infinite; }
  @keyframes qz-spin { to { transform: rotate(360deg); } }
  .qz-loading-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; }
  .qz-loading-sub { font-size: 13px; color: var(--muted); }

  /* STATS ROW */
  .qz-stats-row { display: flex; gap: 10px; margin-bottom: 1.25rem; }
  .qz-stat-chip { flex: 1; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 10px; text-align: center; }
  .qz-stat-chip .sv { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; margin-bottom: 2px; }
  .qz-stat-chip .sk { font-size: 11px; color: var(--muted); }
  .sv-green  { color: var(--accent2); }
  .sv-red    { color: var(--accent3); }
  .sv-amber  { color: var(--amber); }
  .sv-purple { color: var(--accent); }

  /* TOP ROW */
  .qz-top-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; gap: 16px; }
  .qz-q-counter { display: flex; align-items: center; gap: 8px; }
  .qz-q-num { font-family: 'Syne', sans-serif; font-size: 28px; font-weight: 800; line-height: 1; }
  .qz-q-total { font-size: 14px; color: var(--muted); align-self: flex-end; padding-bottom: 3px; }
  .qz-subject-pill { font-size: 11px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; padding: 4px 12px; border-radius: 20px; background: rgba(124,92,252,0.12); color: var(--accent); border: 1px solid rgba(124,92,252,0.2); }

  /* TIMER RING */
  .qz-timer-wrap { position: relative; width: 64px; height: 64px; flex-shrink: 0; }
  .qz-timer-wrap svg { transform: rotate(-90deg); }
  .qz-timer-num { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; }
  .qz-timer-num .tnum { font-family: 'Syne', sans-serif; font-size: 17px; font-weight: 800; line-height: 1; }
  .qz-timer-num .tlabel { font-size: 9px; color: var(--muted); margin-top: 1px; }

  /* MAP TOGGLE */
  .qz-map-toggle { display: flex; align-items: center; gap: 6px; background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 6px 14px; cursor: pointer; font-size: 13px; color: var(--muted); font-weight: 500; transition: all .2s; }
  .qz-map-toggle:hover { border-color: var(--border2); color: var(--text); }

  /* QUESTION MAP */
  .qz-map { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .qz-map-title { font-size: 12px; color: var(--muted); font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
  .qz-map-grid { display: flex; flex-wrap: wrap; gap: 6px; }
  .qz-map-dot { width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; cursor: pointer; transition: all .15s; border: 1px solid var(--border2); background: var(--surface2); color: var(--muted); }
  .qz-map-dot.answered { background: rgba(124,92,252,0.18); border-color: rgba(124,92,252,0.4); color: var(--accent); }
  .qz-map-dot.current  { background: var(--accent); border-color: var(--accent); color: #fff; }
  .qz-map-dot.skipped  { background: rgba(255,179,71,0.12); border-color: rgba(255,179,71,0.3); color: var(--amber); }

  /* QUESTION CARD */
  .qz-q-card { background: var(--surface); border: 1px solid var(--border2); border-radius: 18px; padding: 2rem; margin-bottom: 1.25rem; }
  .qz-q-text { font-size: 17px; font-weight: 500; line-height: 1.65; color: var(--text); }

  /* OPTIONS */
  .qz-options { display: flex; flex-direction: column; gap: 10px; margin-bottom: 1.5rem; }
  .qz-option { display: flex; align-items: center; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem 1.25rem; cursor: pointer; transition: all .22s; }
  .qz-option:hover:not(.locked) { border-color: var(--border2); background: var(--surface2); }
  .qz-option.selected { border-color: var(--accent);  background: rgba(124,92,252,0.09); }
  .qz-option.correct  { border-color: var(--accent2); background: rgba(0,229,192,0.08); }
  .qz-option.wrong    { border-color: var(--accent3); background: rgba(255,107,107,0.08); }
  .qz-option.locked   { cursor: default; }
  .qz-opt-letter { width: 34px; height: 34px; border-radius: 10px; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 700; flex-shrink: 0; transition: all .2s; color: var(--muted); }
  .qz-option.selected .qz-opt-letter { background: var(--accent);  border-color: var(--accent);  color: #fff; }
  .qz-option.correct  .qz-opt-letter { background: var(--accent2); border-color: var(--accent2); color: #0A0B0F; }
  .qz-option.wrong    .qz-opt-letter { background: var(--accent3); border-color: var(--accent3); color: #fff; }
  .qz-opt-text { font-size: 15px; font-weight: 400; flex: 1; line-height: 1.4; }

  /* FEEDBACK */
  .qz-feedback { border-radius: 12px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; align-items: flex-start; gap: 10px; }
  .qz-feedback.correct-fb { background: rgba(0,229,192,0.08);  border: 1px solid rgba(0,229,192,0.2); }
  .qz-feedback.wrong-fb   { background: rgba(255,107,107,0.08); border: 1px solid rgba(255,107,107,0.2); }
  .qz-fb-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
  .qz-fb-title { font-size: 14px; font-weight: 700; margin-bottom: 3px; }
  .correct-fb .qz-fb-title { color: var(--accent2); }
  .wrong-fb   .qz-fb-title { color: var(--accent3); }
  .qz-fb-explain { font-size: 13px; color: var(--muted); line-height: 1.5; }

  /* BOTTOM ROW */
  .qz-bottom-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .qz-skip-btn { background: none; border: 1px solid var(--muted2); border-radius: 12px; padding: 12px 20px; color: var(--muted); font-size: 14px; font-weight: 500; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .qz-skip-btn:hover:not(:disabled) { border-color: var(--border2); color: var(--text); }
  .qz-skip-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .qz-next-btn { background: var(--accent); border: none; border-radius: 12px; padding: 12px 32px; color: #fff; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; display: flex; align-items: center; gap: 8px; }
  .qz-next-btn:hover:not(:disabled) { background: #9074fd; transform: translateY(-1px); }
  .qz-next-btn:disabled { background: var(--muted2); color: var(--muted); cursor: not-allowed; transform: none; }
  .qz-finish-btn { background: linear-gradient(135deg, var(--accent), var(--accent2)); border: none; border-radius: 12px; padding: 12px 32px; color: #0A0B0F; font-size: 14px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all .2s; }
  .qz-finish-btn:hover { opacity: .9; transform: translateY(-1px); }
  .qz-bookmark-btn { background: none; border: 1px solid var(--muted2); border-radius: 12px; padding: 12px 14px; color: var(--muted); font-size: 16px; cursor: pointer; transition: all .2s; }
  .qz-bookmark-btn:hover { border-color: var(--amber); color: var(--amber); }
  .qz-bookmark-btn.saved { border-color: var(--amber); color: var(--amber); background: rgba(255,179,71,0.08); }

  /* SUBMITTING OVERLAY */
  .qz-overlay { position: fixed; inset: 0; background: rgba(10,11,15,0.85); z-index: 200; display: flex; align-items: center; justify-content: center; flex-direction: column; gap: 16px; }
  .qz-overlay-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .qz-overlay-sub { font-size: 14px; color: var(--muted); }
`;

const LETTERS = ["A", "B", "C", "D"];
const CIRCUMFERENCE = 2 * Math.PI * 26;

/* ════════════════════════════════════════════════════════
   HELPER — safely read token from localStorage
   Handles cases where token was accidentally stored as
   JSON string e.g. '"eyJ..."' (with extra quotes)
════════════════════════════════════════════════════════ */
const getToken = () => {
  const raw = localStorage.getItem("token");
  if (!raw) return null;
  // If someone accidentally stored it JSON-encoded, unwrap it
  try {
    const parsed = JSON.parse(raw);
    // parsed will be a plain string if it was double-encoded
    if (typeof parsed === "string") return parsed;
    // or an object with a token field
    if (parsed?.token) return parsed.token;
    if (parsed?.accessToken) return parsed.accessToken;
  } catch {
    // raw is already a plain JWT string — this is the happy path
  }
  return raw;
};

/* ════════════════════════════════════════════════════════
   QUIZ COMPONENT
════════════════════════════════════════════════════════ */
export default function Quiz() {
  const navigate = useNavigate();
  const location = useLocation();

  const config = location.state || {};
  const {
    subject,
    difficulty = "Medium",
    questions: questionCount = 10,
    timePerQ: timePerQuestion = 30,
    options: quizOptions = {},
  } = config;

  const [loadingState, setLoadingState] = useState("loading");
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answered, setAnswered] = useState({});
  const [skipped, setSkipped] = useState({});
  const [bookmarked, setBookmarked] = useState({});
  const [showMap, setShowMap] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [timeLeft, setTimeLeft] = useState(timePerQuestion);
  const [submitting, setSubmitting] = useState(false);

  const timerRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const totalStartRef = useRef(Date.now());

  const totalQ = questions.length;
  const correctCount = Object.values(answered).filter((a) => a.correct).length;
  const wrongCount = Object.values(answered).filter((a) => !a.correct).length;
  const skippedCount = Object.keys(skipped).length;
  const remaining = totalQ - Object.keys(answered).length - skippedCount;
  const progressPct =
    totalQ > 0
      ? Math.round(
          ((Object.keys(answered).length + skippedCount) / totalQ) * 100,
        )
      : 0;

  const currentQ = questions[currentIdx];

  /* ════════════ FETCH QUESTIONS ════════════
     ✅ Use axiosInstance — the request interceptor automatically
        reads token from localStorage and sets Authorization header.
        No manual token handling needed here.
  ═══════════════════════════════════════════ */
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // ✅ Guard: verify token exists and looks like a JWT before requesting
        const token = getToken();
        if (!token || token === "undefined" || token === "null") {
          console.error("No valid token found, redirecting to login");
          navigate("/");
          return;
        }

        const subjects = Array.isArray(subject) ? subject : [subject];

        // ✅ axiosInstance already has baseURL + Authorization interceptor
        const res = await axiosInstance.post("/api/quiz/generate-questions", {
          subjects,
          difficulty,
          count: questionCount,
        });

        const data = res.data;

        if (!data.success || !data.questions?.length) {
          throw new Error(data.message || "No questions returned");
        }

        let qs = data.questions;
        if (quizOptions.shuffle) {
          qs = [...qs].sort(() => Math.random() - 0.5);
        }

        setQuestions(qs);
        setLoadingState("ready");
        totalStartRef.current = Date.now();
      } catch (err) {
        console.error("fetchQuestions error:", err);

        // ✅ If 401, token is bad — clear storage and redirect to login
        if (err.response?.status === 401) {
          console.error("Token rejected by server — clearing and redirecting");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/");
          return;
        }

        setLoadingState("error");
      }
    };

    fetchQuestions();
  }, []);

  /* ════════════ TIMER ════════════ */
  const stopTimer = useCallback(() => {
    clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    stopTimer();
    setTimeLeft(timePerQuestion);
    startTimeRef.current = Date.now();

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          setSkipped((s) => {
            if (!s[currentIdx]) {
              return { ...s, [currentIdx]: true };
            }
            return s;
          });
          setTimeout(() => {
            setCurrentIdx((idx) => {
              if (idx < questions.length - 1) return idx + 1;
              return idx;
            });
            setFeedback(null);
          }, 700);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [currentIdx, questions.length, stopTimer, timePerQuestion]);

  useEffect(() => {
    if (loadingState !== "ready" || !currentQ) return;
    if (answered[currentIdx] || skipped[currentIdx]) {
      stopTimer();
      return;
    }
    startTimer();
    return () => stopTimer();
  }, [currentIdx, loadingState]);

  useEffect(() => () => stopTimer(), []);

  /* ════════════ ANSWER SELECTION ════════════ */
  const selectOption = (optionIdx) => {
    if (answered[currentIdx] || skipped[currentIdx]) return;
    stopTimer();

    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const correct = optionIdx === currentQ.answer;

    setAnswered((prev) => ({
      ...prev,
      [currentIdx]: {
        chosen: optionIdx,
        correct,
        timeTaken,
        questionText: currentQ.question,
        options: currentQ.options,
        correctAnswer: currentQ.options[currentQ.answer],
        userAnswer: currentQ.options[optionIdx],
        topic: currentQ.topic,
        subject: currentQ.subject,
        isBookmarked: !!bookmarked[currentIdx],
      },
    }));

    if (quizOptions.instantFeedback !== false) {
      setFeedback({ correct, explanation: currentQ.explanation });
    } else if (correct) {
      setFeedback({ correct: true, explanation: currentQ.explanation });
    } else {
      setFeedback({ correct: false, explanation: currentQ.explanation });
    }
  };

  /* ════════════ NAVIGATION ════════════ */
  const handleSkip = () => {
    if (answered[currentIdx]) return;
    stopTimer();
    setSkipped((prev) => ({ ...prev, [currentIdx]: true }));
    setFeedback(null);
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIdx < totalQ - 1) {
      setCurrentIdx((i) => i + 1);
    }
  };

  const jumpTo = (idx) => {
    stopTimer();
    setFeedback(null);
    setCurrentIdx(idx);
    setShowMap(false);
  };

  const handleBookmark = () => {
    setBookmarked((prev) => ({ ...prev, [currentIdx]: !prev[currentIdx] }));
  };

  /* ════════════ SUBMIT QUIZ ════════════ */
  const handleFinish = async () => {
    stopTimer();
    setSubmitting(true);

    try {
      const totalTimeTaken = Math.round(
        (Date.now() - totalStartRef.current) / 1000,
      );

      const questionResults = questions.map((q, i) => ({
        questionText: q.question,
        options: q.options,
        correctAnswer: q.options[q.answer],
        userAnswer: answered[i]?.userAnswer || null,
        isCorrect: answered[i]?.correct || false,
        timeTaken: answered[i]?.timeTaken || 0,
        topic: q.topic,
        isBookmarked: !!bookmarked[i],
      }));

      // ✅ Use axiosInstance here too — consistent token handling
      const res = await axiosInstance.post("/api/quiz/submit", {
        subject: Array.isArray(subject) ? subject.join(", ") : subject,
        difficulty,
        totalQuestions: totalQ,
        timePerQuestion,
        options: quizOptions,
        questions: questionResults,
        timeTakenTotal: totalTimeTaken,
      });

      const data = res.data;

      navigate("/results", {
        state: {
          result: data.result,
          questions: questionResults,
          config: { subject, difficulty, totalQ, timePerQuestion },
        },
      });
    } catch (err) {
      console.error("Submit error:", err);
      setSubmitting(false);
      alert("Failed to submit quiz. Please try again.");
    }
  };

  /* ════════════ TIMER UI ════════════ */
  const timerPercent = timeLeft / timePerQuestion;
  const dashOffset = CIRCUMFERENCE * (1 - timerPercent);
  const timerColor =
    timeLeft > timePerQuestion * 0.5
      ? "#7C5CFC"
      : timeLeft > timePerQuestion * 0.25
        ? "#FFB347"
        : "#FF6B6B";

  const getOptionClass = (optIdx) => {
    const ans = answered[currentIdx];
    if (!ans) return "";
    if (optIdx === currentQ.answer) return "correct";
    if (optIdx === ans.chosen) return "wrong";
    return "";
  };

  const diffTag = difficulty?.toLowerCase();

  /* ════════════ RENDER: LOADING ════════════ */
  if (loadingState === "loading") {
    return (
      <>
        <style>{css}</style>
        <div className="qz-root">
          <div className="qz-center">
            <div className="qz-spinner" />
            <div className="qz-loading-title">Generating your quiz...</div>
            <div className="qz-loading-sub">
              Brain-byte is crafting {questionCount} {difficulty} questions on-
              {Array.isArray(subject) ? subject.join(", ") : subject}, it can
              take some time
            </div>
          </div>
        </div>
      </>
    );
  }

  /* ════════════ RENDER: ERROR ════════════ */
  if (loadingState === "error") {
    return (
      <>
        <style>{css}</style>
        <div className="qz-root">
          <div className="qz-center">
            <div style={{ fontSize: 36 }}>⚠️</div>
            <div className="qz-loading-title">Failed to generate questions</div>
            <div className="qz-loading-sub">
              Check your internet connection or try a different subject.
            </div>
            <button
              className="qz-next-btn"
              style={{ marginTop: 8 }}
              onClick={() => navigate("/QuizSetup")}
            >
              ← Back to Setup
            </button>
          </div>
        </div>
      </>
    );
  }

  /* ════════════ RENDER: QUIZ ════════════ */
  const isLastQuestion = currentIdx === totalQ - 1;
  const allDone = remaining === 0;
  const currentAnswered = !!answered[currentIdx];
  const currentSkipped = !!skipped[currentIdx];

  return (
    <>
      <style>{css}</style>

      {submitting && (
        <div className="qz-overlay">
          <div className="qz-spinner" />
          <div className="qz-overlay-title">Submitting your quiz...</div>
          <div className="qz-overlay-sub">Calculating your score and XP</div>
        </div>
      )}

      <div className="qz-root">
        {/* ── NAV ── */}
        <nav className="qz-nav">
          <div className="qz-logo">
            <div className="qz-logo-icon">🧠</div>
            Brain<span>Byte</span>
          </div>
          <div className="qz-nav-meta">
            <span className={`qz-nav-tag tag-${diffTag}`}>{difficulty}</span>
            <span className="qz-nav-subjects">
              {Array.isArray(subject) ? subject.join(" · ") : subject}
            </span>
          </div>
          <div className="qz-nav-right">
            <button
              className="qz-quit-btn"
              onClick={() => {
                if (window.confirm("Quit quiz? Your progress will be lost.")) {
                  navigate("/dashboard");
                }
              }}
            >
              ● Quit
            </button>
          </div>
        </nav>

        {/* PROGRESS BAR */}
        <div className="qz-progress-wrap">
          <div
            className="qz-progress-fill"
            style={{ width: `${Math.max(progressPct, 2)}%` }}
          />
        </div>

        <main className="qz-main">
          {/* STATS ROW */}
          <div className="qz-stats-row">
            <div className="qz-stat-chip">
              <div className="sv sv-green">{correctCount}</div>
              <div className="sk">Correct</div>
            </div>
            <div className="qz-stat-chip">
              <div className="sv sv-red">{wrongCount}</div>
              <div className="sk">Wrong</div>
            </div>
            <div className="qz-stat-chip">
              <div className="sv sv-amber">{skippedCount}</div>
              <div className="sk">Skipped</div>
            </div>
            <div className="qz-stat-chip">
              <div className="sv sv-purple">{remaining}</div>
              <div className="sk">Remaining</div>
            </div>
          </div>

          {/* TOP ROW */}
          <div className="qz-top-row">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="qz-q-counter">
                <div className="qz-q-num">Q{currentIdx + 1}</div>
                <div className="qz-q-total">/ {totalQ}</div>
              </div>
              <div className="qz-subject-pill">{currentQ?.subject}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                className="qz-map-toggle"
                onClick={() => setShowMap((p) => !p)}
              >
                ⊞ Question map
              </div>
              {/* TIMER RING */}
              <div className="qz-timer-wrap">
                <svg width="64" height="64" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke="#3A394A"
                    strokeWidth="5"
                  />
                  <circle
                    cx="32"
                    cy="32"
                    r="26"
                    fill="none"
                    stroke={timerColor}
                    strokeWidth="5"
                    strokeDasharray={CIRCUMFERENCE}
                    strokeDashoffset={
                      currentAnswered || currentSkipped ? 0 : dashOffset
                    }
                    strokeLinecap="round"
                    style={{
                      transition: "stroke-dashoffset 1s linear, stroke 0.3s",
                    }}
                  />
                </svg>
                <div className="qz-timer-num">
                  <div
                    className="tnum"
                    style={{
                      color:
                        currentAnswered || currentSkipped
                          ? "#7C5CFC"
                          : timerColor,
                    }}
                  >
                    {currentAnswered || currentSkipped ? "✓" : timeLeft}
                  </div>
                  <div className="tlabel">
                    {currentAnswered || currentSkipped ? "" : "sec"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* QUESTION MAP */}
          {showMap && (
            <div className="qz-map">
              <div className="qz-map-title">
                Question map &nbsp;
                <span style={{ color: "#7C5CFC" }}>■ answered</span>&nbsp;
                <span style={{ color: "#7C5CFC", opacity: 0.5 }}>
                  ■ current
                </span>
                &nbsp;
                <span style={{ color: "#FFB347" }}>■ skipped</span>
              </div>
              <div className="qz-map-grid">
                {questions.map((_, i) => {
                  let cls = "qz-map-dot";
                  if (i === currentIdx) cls += " current";
                  else if (answered[i]) cls += " answered";
                  else if (skipped[i]) cls += " skipped";
                  return (
                    <div key={i} className={cls} onClick={() => jumpTo(i)}>
                      {i + 1}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* QUESTION CARD */}
          <div className="qz-q-card">
            <div className="qz-q-text">{currentQ?.question}</div>
          </div>

          {/* OPTIONS */}
          <div className="qz-options">
            {currentQ?.options.map((opt, i) => {
              const stateCls = getOptionClass(i);
              const locked = currentAnswered || currentSkipped;
              return (
                <div
                  key={i}
                  className={`qz-option${stateCls ? " " + stateCls : ""}${locked ? " locked" : ""}`}
                  onClick={() => !locked && selectOption(i)}
                >
                  <div className="qz-opt-letter">{LETTERS[i]}</div>
                  <div className="qz-opt-text">{opt}</div>
                  {stateCls === "correct" && (
                    <span style={{ marginLeft: "auto", fontSize: 16 }}>✓</span>
                  )}
                  {stateCls === "wrong" && (
                    <span style={{ marginLeft: "auto", fontSize: 16 }}>✗</span>
                  )}
                </div>
              );
            })}
          </div>

          {/* FEEDBACK BOX */}
          {feedback && (
            <div
              className={`qz-feedback ${feedback.correct ? "correct-fb" : "wrong-fb"}`}
            >
              <div className="qz-fb-icon">{feedback.correct ? "✓" : "✗"}</div>
              <div>
                <div className="qz-fb-title">
                  {feedback.correct ? "Correct! Well done." : "Incorrect!"}
                </div>
                <div className="qz-fb-explain">{feedback.explanation}</div>
              </div>
            </div>
          )}

          {/* BOTTOM ROW */}
          <div className="qz-bottom-row">
            <div style={{ display: "flex", gap: 8 }}>
              <button
                className={`qz-bookmark-btn${bookmarked[currentIdx] ? " saved" : ""}`}
                onClick={handleBookmark}
                title="Bookmark this question"
              >
                🔖
              </button>
              <button
                className="qz-skip-btn"
                disabled={currentAnswered || currentSkipped}
                onClick={handleSkip}
              >
                Skip →
              </button>
            </div>

            {isLastQuestion || allDone ? (
              <button className="qz-finish-btn" onClick={handleFinish}>
                ⚡ Finish Quiz
              </button>
            ) : (
              <button
                className="qz-next-btn"
                disabled={!currentAnswered && !currentSkipped}
                onClick={handleNext}
              >
                Next →
              </button>
            )}
          </div>
        </main>
      </div>
    </>
  );
}
