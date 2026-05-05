import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosConfig";
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0A0B0F; --surface: #111318; --surface2: #181B23;
    --border: rgba(255,255,255,0.07); --border2: rgba(255,255,255,0.13);
    --accent: #7C5CFC; --accent2: #00E5C0; --accent3: #FF6B6B;
    --amber: #FFB347; --text: #F0EFF8; --muted: #7B7A8C; --muted2: #3A394A;
  }
  .rh-root { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--text); min-height: 100vh; }

  /* NAV */
  .rh-nav { display: flex; align-items: center; justify-content: space-between; padding: 0 2rem; height: 56px; border-bottom: 1px solid var(--border); background: rgba(10,11,15,0.97); position: sticky; top: 0; z-index: 100; }
  .rh-logo { font-family: 'Syne', sans-serif; font-weight: 800; font-size: 19px; display: flex; align-items: center; gap: 8px; cursor: pointer; }
  .rh-logo-icon { width: 28px; height: 28px; background: linear-gradient(135deg, var(--accent), var(--accent2)); border-radius: 7px; display: flex; align-items: center; justify-content: center; font-size: 14px; }
  .rh-logo span { color: var(--accent2); }
  .rh-nav-links { display: flex; gap: 2rem; list-style: none; }
  .rh-nav-links a { font-size: 14px; color: var(--muted); text-decoration: none; font-weight: 500; cursor: pointer; transition: color .2s; }
  .rh-nav-links a:hover { color: var(--text); }
  .rh-nav-links a.active { color: var(--accent2); }
  .rh-nav-right { display: flex; gap: 10px; }

  /* BUTTONS */
  .rh-btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 22px; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all .2s; border: none; font-family: 'DM Sans', sans-serif; }
  .rh-btn-primary { background: var(--accent); color: #fff; }
  .rh-btn-primary:hover { background: #9074fd; transform: translateY(-1px); }
  .rh-btn-ghost { background: rgba(255,255,255,0.06); color: var(--text); border: 1px solid var(--border2); }
  .rh-btn-ghost:hover { background: rgba(255,255,255,0.1); }

  /* MAIN */
  .rh-main { max-width: 860px; margin: 0 auto; padding: 2rem 1.5rem 5rem; }

  /* HEADER */
  .rh-page-header { margin-bottom: 2rem; }
  .rh-page-title { font-family: 'Syne', sans-serif; font-size: 26px; font-weight: 800; margin-bottom: 6px; }
  .rh-page-sub { font-size: 14px; color: var(--muted); }

  /* SUMMARY CARDS */
  .rh-summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 2rem; }
  .rh-sum-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 1rem; text-align: center; }
  .rh-sum-val { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; margin-bottom: 4px; }
  .rh-sum-key { font-size: 11px; color: var(--muted); text-transform: uppercase; letter-spacing: 1px; }

  /* FILTERS */
  .rh-filters { display: flex; gap: 8px; margin-bottom: 1.5rem; flex-wrap: wrap; }
  .rh-filter-btn { padding: 6px 16px; border-radius: 20px; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .2s; border: 1px solid var(--border2); background: var(--surface); color: var(--muted); font-family: 'DM Sans', sans-serif; }
  .rh-filter-btn:hover { border-color: var(--accent); color: var(--accent); }
  .rh-filter-btn.active { background: rgba(124,92,252,0.15); border-color: var(--accent); color: var(--accent); }

  /* QUIZ CARDS */
  .rh-quiz-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 1.25rem 1.5rem; margin-bottom: 12px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all .2s; }
  .rh-quiz-card:hover { border-color: var(--border2); background: var(--surface2); transform: translateY(-2px); }
  .rh-quiz-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 18px; flex-shrink: 0; }
  .rh-quiz-info { flex: 1; }
  .rh-quiz-subject { font-family: 'Syne', sans-serif; font-size: 15px; font-weight: 700; margin-bottom: 3px; }
  .rh-quiz-meta { font-size: 12px; color: var(--muted); display: flex; gap: 12px; flex-wrap: wrap; }
  .rh-quiz-score { text-align: right; flex-shrink: 0; }
  .rh-score-pct { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 800; line-height: 1; }
  .rh-score-label { font-size: 11px; color: var(--muted); margin-top: 2px; }
  .rh-diff-tag { font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; padding: 3px 10px; border-radius: 20px; }
  .tag-easy   { background: rgba(0,229,192,0.15);  color: var(--accent2); }
  .tag-medium { background: rgba(255,179,71,0.15);  color: var(--amber); }
  .tag-hard   { background: rgba(255,107,107,0.15); color: var(--accent3); }
  .rh-xp-chip { background: rgba(255,179,71,0.1); border: 1px solid rgba(255,179,71,0.2); border-radius: 20px; padding: 2px 10px; font-size: 11px; font-weight: 600; color: var(--amber); }

  /* EMPTY */
  .rh-empty { text-align: center; padding: 4rem 2rem; color: var(--muted); }
  .rh-empty-icon { font-size: 48px; margin-bottom: 1rem; }
  .rh-empty-title { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: var(--text); margin-bottom: 8px; }
  .rh-empty-sub { font-size: 14px; margin-bottom: 1.5rem; }

  /* LOADING */
  .rh-loading { display: flex; align-items: center; justify-content: center; min-height: 40vh; gap: 12px; color: var(--muted); }
  .rh-spinner { width: 20px; height: 20px; border: 2px solid var(--border2); border-top-color: var(--accent); border-radius: 50%; animation: rh-spin .7s linear infinite; }
  @keyframes rh-spin { to { transform: rotate(360deg); } }

  @keyframes rh-fadein { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  .rh-fadein { animation: rh-fadein .4s ease forwards; }
`;

const SUBJECT_CONFIG = {
  Mathematics: { icon: "✦", bg: "rgba(124,92,252,0.15)" },
  Physics: { icon: "⚛", bg: "rgba(0,229,192,0.12)" },
  Chemistry: { icon: "⚗", bg: "rgba(255,107,107,0.13)" },
  Biology: { icon: "🌿", bg: "rgba(255,179,71,0.13)" },
  "Comp. Science": { icon: "💻", bg: "rgba(56,149,255,0.13)" },
  English: { icon: "✍", bg: "rgba(255,100,180,0.13)" },
};
const DEFAULT_CONFIG = { icon: "📚", bg: "rgba(124,92,252,0.15)" };

const getScoreColor = (pct) => {
  if (pct >= 90) return "var(--accent2)";
  if (pct >= 75) return "var(--accent)";
  if (pct >= 50) return "var(--amber)";
  return "var(--accent3)";
};

const getScoreLabel = (pct) => {
  if (pct >= 90) return "Excellent";
  if (pct >= 75) return "Good";
  if (pct >= 60) return "Average";
  if (pct >= 40) return "Below Avg";
  return "Needs Work";
};

const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  const diff = Math.floor((Date.now() - d) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hrs ago`;
  if (diff < 172800) return "Yesterday";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export default function ResultsHistory() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");

  const SUBJECTS = [
    "All",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Comp. Science",
    "English",
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const res = await fetch("/api/quiz/history?limit=50", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setHistory(data.history);
      } catch (err) {
        console.error("History fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [navigate]);

  const filtered =
    activeFilter === "All"
      ? history
      : history.filter(
          (q) =>
            q.subject === activeFilter || q.subject?.includes(activeFilter),
        );

  /* summary stats */
  const totalQuizzes = history.length;
  const totalXP = history.reduce((s, q) => s + (q.xpEarned || 0), 0);
  const avgScore = history.length
    ? Math.round(
        history.reduce((s, q) => s + q.scorePercent, 0) / history.length,
      )
    : 0;
  const bestScore = history.length
    ? Math.max(...history.map((q) => q.scorePercent))
    : 0;

  return (
    <>
      <style>{css}</style>
      <div className="rh-root">
        {/* NAV */}
        <nav className="rh-nav">
          <div className="rh-logo" onClick={() => navigate("/dashboard")}>
            <div className="rh-logo-icon">🧠</div>
            Brain<span>Byte</span>
          </div>
          <ul className="rh-nav-links">
            <li>
              <a onClick={() => navigate("/dashboard")}>Dashboard</a>
            </li>
            <li>
              <a onClick={() => navigate("/QuizSetup")}>Practice</a>
            </li>
            <li>
              <a className="active">Results</a>
            </li>
          </ul>
          <div className="rh-nav-right">
            <button
              className="rh-btn rh-btn-primary"
              onClick={() => navigate("/QuizSetup")}
            >
              ⚡ New Quiz
            </button>
          </div>
        </nav>

        <main className="rh-main rh-fadein">
          {/* PAGE HEADER */}
          <div className="rh-page-header">
            <div className="rh-page-title">My Results</div>
            <div className="rh-page-sub">
              {totalQuizzes > 0
                ? `${totalQuizzes} quiz${totalQuizzes > 1 ? "zes" : ""} completed — keep going!`
                : "No quizzes yet — start your first one!"}
            </div>
          </div>

          {/* SUMMARY STATS */}
          {totalQuizzes > 0 && (
            <div className="rh-summary-grid">
              <div className="rh-sum-card">
                <div className="rh-sum-val" style={{ color: "var(--accent)" }}>
                  {totalQuizzes}
                </div>
                <div className="rh-sum-key">Total Quizzes</div>
              </div>
              <div className="rh-sum-card">
                <div className="rh-sum-val" style={{ color: "var(--accent2)" }}>
                  {avgScore}%
                </div>
                <div className="rh-sum-key">Avg Score</div>
              </div>
              <div className="rh-sum-card">
                <div className="rh-sum-val" style={{ color: "var(--amber)" }}>
                  🏆 {bestScore}%
                </div>
                <div className="rh-sum-key">Best Score</div>
              </div>
              <div className="rh-sum-card">
                <div className="rh-sum-val" style={{ color: "var(--amber)" }}>
                  {totalXP}
                </div>
                <div className="rh-sum-key">Total XP</div>
              </div>
            </div>
          )}

          {/* FILTERS */}
          {totalQuizzes > 0 && (
            <div className="rh-filters">
              {SUBJECTS.map((s) => (
                <button
                  key={s}
                  className={`rh-filter-btn${activeFilter === s ? " active" : ""}`}
                  onClick={() => setActiveFilter(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* CONTENT */}
          {loading ? (
            <div className="rh-loading">
              <div className="rh-spinner" />
              Loading your results...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rh-empty">
              <div className="rh-empty-icon">📋</div>
              <div className="rh-empty-title">
                {totalQuizzes === 0
                  ? "No quizzes yet"
                  : "No results for this subject"}
              </div>
              <div className="rh-empty-sub">
                {totalQuizzes === 0
                  ? "Complete your first quiz to see your results here."
                  : "Try a different filter or take a quiz in this subject."}
              </div>
              <button
                className="rh-btn rh-btn-primary"
                onClick={() => navigate("/QuizSetup")}
              >
                ⚡ Start a Quiz
              </button>
            </div>
          ) : (
            filtered.map((q, i) => {
              const cfg = SUBJECT_CONFIG[q.subject] || DEFAULT_CONFIG;
              const color = getScoreColor(q.scorePercent);
              return (
                <div
                  key={q._id || i}
                  className="rh-quiz-card"
                  onClick={() =>
                    navigate("/results", {
                      state: {
                        result: {
                          scorePercent: q.scorePercent,
                          totalCorrect: q.totalCorrect,
                          totalWrong:
                            q.totalQuestions -
                            q.totalCorrect -
                            (q.totalSkipped || 0),
                          totalSkipped: q.totalSkipped || 0,
                          xpEarned: q.xpEarned,
                          totalXpEarned: q.xpEarned,
                          streakBonus: 0,
                          newStreak: 0,
                        },
                        questions: [],
                        config: {
                          subject: q.subject,
                          difficulty: q.difficulty,
                          totalQ: q.totalQuestions,
                        },
                      },
                    })
                  }
                >
                  <div className="rh-quiz-icon" style={{ background: cfg.bg }}>
                    {cfg.icon}
                  </div>
                  <div className="rh-quiz-info">
                    <div className="rh-quiz-subject">{q.subject}</div>
                    <div className="rh-quiz-meta">
                      <span
                        className={`rh-diff-tag tag-${q.difficulty?.toLowerCase()}`}
                      >
                        {q.difficulty}
                      </span>
                      <span>{q.totalQuestions} questions</span>
                      <span>{formatDate(q.completedAt)}</span>
                      <span className="rh-xp-chip">+{q.xpEarned} XP</span>
                    </div>
                  </div>
                  <div className="rh-quiz-score">
                    <div className="rh-score-pct" style={{ color }}>
                      {q.scorePercent}%
                    </div>
                    <div className="rh-score-label">
                      {getScoreLabel(q.scorePercent)}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </main>
      </div>
    </>
  );
}
