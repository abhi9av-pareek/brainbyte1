import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Eye, EyeOff } from "lucide-react";

function LoginModern() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);

  useEffect(() => {
    // Load Three.js then Vanta Globe dynamically
    const loadScript = (src) =>
      new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
      });

    const initVanta = async () => {
      try {
        await loadScript(
          "https://cdnjs.cloudflare.com/ajax/libs/three.js/r121/three.min.js",
        );
        await loadScript(
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.globe.min.js",
        );

        if (window.VANTA && vantaRef.current) {
          vantaEffect.current = window.VANTA.GLOBE({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 1.0,
            color: 0x9b5de5, // purple — matches --accent-purple
            color2: 0x00f5d4, // cyan — matches --accent-cyan
            backgroundColor: 0x1a1030, // deep dark purple background
            size: 1.2,
            points: 10.0,
            maxDistance: 22.0,
            spacing: 18.0,
          });
        }
      } catch (err) {
        console.warn("Vanta.js failed to load:", err);
      }
    };

    initVanta();

    return () => {
      if (vantaEffect.current) vantaEffect.current.destroy();
    };
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      const res = await axios.post("/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data));
      navigate("/dashboard");
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        :root {
          --bg-deep:      #0d0a1a;
          --bg-card:      rgba(26, 20, 50, 0.75);
          --bg-input:     rgba(45, 27, 78, 0.45);
          --accent-purple: #9b5de5;
          --accent-cyan:   #00f5d4;
          --accent-pink:   #f72585;
          --border-glass:  rgba(155, 93, 229, 0.25);
          --text-muted:    #8892a4;
          --text-dim:      #5a6275;
          --glow-purple:   rgba(155, 93, 229, 0.35);
          --glow-cyan:     rgba(0, 245, 212, 0.25);
        }

        .bb-login-root {
          font-family: 'DM Sans', sans-serif;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-deep);
          overflow: hidden;
          position: relative;
          padding: 1.5rem;
        }

        /* ── Vanta canvas wrapper ── */
        .bb-vanta-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
        }

        /* subtle overlay so text stays readable */
        .bb-vanta-overlay {
          position: fixed;
          inset: 0;
          z-index: 1;
          background: radial-gradient(ellipse at 60% 50%,
            rgba(13,10,26,0.55) 0%,
            rgba(13,10,26,0.82) 70%,
            rgba(13,10,26,0.95) 100%);
          pointer-events: none;
        }

        /* ── Card ── */
        .bb-card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 460px;
          background: var(--bg-card);
          border: 1px solid var(--border-glass);
          border-radius: 24px;
          padding: 2.75rem 2.5rem 2.5rem;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(155,93,229,0.1),
            0 32px 80px rgba(0,0,0,0.6),
            0 0 60px rgba(155,93,229,0.1) inset;
          animation: cardReveal 0.7s cubic-bezier(.22,1,.36,1) both;
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(28px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        /* top glow bar */
        .bb-card::before {
          content: '';
          position: absolute;
          top: -1px; left: 10%; right: 10%;
          height: 2px;
          background: linear-gradient(90deg,
            transparent,
            var(--accent-purple),
            var(--accent-cyan),
            transparent);
          border-radius: 999px;
        }

        /* ── Logo row ── */
        .bb-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 2rem;
        }
        .bb-logo-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-purple), var(--accent-cyan));
          display: flex; align-items: center; justify-content: center;
          font-size: 20px;
          box-shadow: 0 0 18px var(--glow-purple);
        }
        .bb-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800;
          font-size: 1.3rem;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .bb-logo-text span {
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Heading ── */
        .bb-heading {
          font-family: 'Syne', sans-serif;
          font-size: 2.1rem;
          font-weight: 800;
          line-height: 1.1;
          color: #fff;
          margin-bottom: 0.4rem;
          animation: fadeUp 0.6s 0.15s both;
        }
        .bb-heading span {
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .bb-subheading {
          color: var(--text-muted);
          font-size: 0.9rem;
          margin-bottom: 2rem;
          animation: fadeUp 0.6s 0.22s both;
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* ── Input group ── */
        .bb-field {
          position: relative;
          margin-bottom: 1rem;
          animation: fadeUp 0.6s 0.3s both;
        }
        .bb-field + .bb-field { animation-delay: 0.37s; }

        .bb-input {
          width: 100%;
          box-sizing: border-box;
          background: var(--bg-input);
          border: 1px solid var(--border-glass);
          border-radius: 14px;
          padding: 0.95rem 3rem 0.95rem 1.1rem;
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          font-size: 0.93rem;
          transition: border-color 0.25s, box-shadow 0.25s, background 0.25s;
          outline: none;
        }
        .bb-input::placeholder { color: var(--text-dim); }
        .bb-input:focus {
          border-color: var(--accent-purple);
          background: rgba(155, 93, 229, 0.08);
          box-shadow: 0 0 0 3px rgba(155,93,229,0.18), 0 0 20px rgba(155,93,229,0.12);
        }
        .bb-input:hover:not(:focus) {
          border-color: rgba(155, 93, 229, 0.45);
        }

        .bb-input-icon {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(155,93,229,0.55);
          pointer-events: none;
          display: flex;
        }
        .bb-eye-btn {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: var(--text-muted);
          display: flex;
          padding: 0;
          transition: color 0.2s;
        }
        .bb-eye-btn:hover { color: var(--accent-purple); }

        /* ── Options row ── */
        .bb-options {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.6rem;
          font-size: 0.83rem;
          animation: fadeUp 0.6s 0.44s both;
        }
        .bb-remember {
          display: flex; align-items: center; gap: 8px;
          cursor: pointer; color: var(--text-muted);
        }
        .bb-remember input[type="checkbox"] {
          accent-color: var(--accent-purple);
          width: 15px; height: 15px;
          border-radius: 4px;
        }
        .bb-forgot {
          color: var(--accent-purple);
          text-decoration: none;
          transition: color 0.2s;
        }
        .bb-forgot:hover { color: var(--accent-cyan); }

        /* ── CTA button ── */
        .bb-btn-login {
          width: 100%;
          padding: 1rem;
          border: none;
          border-radius: 14px;
          background: linear-gradient(135deg, var(--accent-purple) 0%, #5e0ace 50%, var(--accent-cyan) 120%);
          background-size: 200% 200%;
          color: #fff;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          font-size: 1rem;
          letter-spacing: 0.3px;
          cursor: pointer;
          transition: transform 0.18s, box-shadow 0.25s, background-position 0.4s;
          box-shadow: 0 6px 30px rgba(155,93,229,0.45);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          animation: fadeUp 0.6s 0.5s both;
        }
        .bb-btn-login:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.01);
          box-shadow: 0 12px 40px rgba(155,93,229,0.6), 0 0 40px rgba(0,245,212,0.18);
          background-position: right center;
        }
        .bb-btn-login:active:not(:disabled) {
          transform: scale(0.975);
        }
        .bb-btn-login:disabled {
          opacity: 0.55; cursor: not-allowed;
        }

        .bb-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.25);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Sign-up nudge ── */
        .bb-signup-nudge {
          text-align: center;
          font-size: 0.85rem;
          color: var(--text-muted);
          margin-top: 1.4rem;
          animation: fadeUp 0.6s 0.56s both;
        }
        .bb-signup-nudge a {
          background: linear-gradient(90deg, var(--accent-purple), var(--accent-cyan));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          font-weight: 600;
          text-decoration: none;
          transition: opacity 0.2s;
        }
        .bb-signup-nudge a:hover { opacity: 0.8; }

        /* ── Divider ── */
        .bb-divider {
          display: flex; align-items: center; gap: 14px;
          margin: 1.5rem 0 1.1rem;
          animation: fadeUp 0.6s 0.62s both;
        }
        .bb-divider-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(155,93,229,0.35), transparent);
        }
        .bb-divider span {
          color: var(--text-dim); font-size: 0.77rem; white-space: nowrap;
        }

        /* ── Social buttons ── */
        .bb-socials {
          display: flex; gap: 12px;
          animation: fadeUp 0.6s 0.68s both;
        }
        .bb-social-btn {
          flex: 1;
          border: 1px solid var(--border-glass);
          border-radius: 12px;
          padding: 0.7rem;
          background: rgba(255,255,255,0.03);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          gap: 8px;
          color: var(--text-muted);
          font-size: 0.8rem;
          font-family: 'DM Sans', sans-serif;
          transition: border-color 0.2s, background 0.2s, color 0.2s;
        }
        .bb-social-btn:hover {
          border-color: rgba(155,93,229,0.5);
          background: rgba(155,93,229,0.07);
          color: #fff;
        }
        .bb-social-btn svg { width: 18px; height: 18px; flex-shrink: 0; }

        /* ── Floating particles (pure CSS) ── */
        .bb-particles {
          position: fixed; inset: 0; pointer-events: none; z-index: 2;
          overflow: hidden;
        }
        .bb-particle {
          position: absolute;
          border-radius: 50%;
          animation: floatUp linear infinite;
          opacity: 0;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0)   scale(1);   opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-110vh) scale(0.4); opacity: 0; }
        }
      `}</style>

      {/* Vanta canvas */}
      <div className="bb-vanta-bg" ref={vantaRef} />
      <div className="bb-vanta-overlay" />

      {/* Floating CSS particles */}
      <div className="bb-particles" aria-hidden="true">
        {[
          {
            left: "8%",
            bottom: "5%",
            size: 5,
            dur: "18s",
            delay: "0s",
            color: "#9b5de5",
          },
          {
            left: "20%",
            bottom: "10%",
            size: 3,
            dur: "24s",
            delay: "4s",
            color: "#00f5d4",
          },
          {
            left: "35%",
            bottom: "2%",
            size: 6,
            dur: "20s",
            delay: "1.5s",
            color: "#9b5de5",
          },
          {
            left: "52%",
            bottom: "8%",
            size: 4,
            dur: "16s",
            delay: "6s",
            color: "#00f5d4",
          },
          {
            left: "68%",
            bottom: "3%",
            size: 3,
            dur: "22s",
            delay: "2s",
            color: "#f72585",
          },
          {
            left: "80%",
            bottom: "12%",
            size: 5,
            dur: "19s",
            delay: "8s",
            color: "#9b5de5",
          },
          {
            left: "92%",
            bottom: "6%",
            size: 4,
            dur: "25s",
            delay: "3s",
            color: "#00f5d4",
          },
          {
            left: "14%",
            bottom: "0%",
            size: 3,
            dur: "21s",
            delay: "10s",
            color: "#f72585",
          },
          {
            left: "45%",
            bottom: "15%",
            size: 6,
            dur: "17s",
            delay: "5s",
            color: "#9b5de5",
          },
          {
            left: "75%",
            bottom: "0%",
            size: 4,
            dur: "23s",
            delay: "7s",
            color: "#00f5d4",
          },
        ].map((p, i) => (
          <div
            key={i}
            className="bb-particle"
            style={{
              left: p.left,
              bottom: p.bottom,
              width: p.size,
              height: p.size,
              background: p.color,
              boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
              animationDuration: p.dur,
              animationDelay: p.delay,
            }}
          />
        ))}
      </div>

      {/* Login card */}
      <div className="bb-login-root">
        <div className="bb-card">
          {/* Logo */}
          <div className="bb-logo">
            <div className="bb-logo-icon">🧠</div>
            <div className="bb-logo-text">
              Brain <span>Byte</span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="bb-heading">
            Welcome <span>Back!</span>
          </h1>
          <p className="bb-subheading">Login and compete with minds.</p>

          {/* Email */}
          <div className="bb-field">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="bb-input"
              autoComplete="email"
            />
            <span className="bb-input-icon">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </span>
          </div>

          {/* Password */}
          <div className="bb-field">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="bb-input"
              autoComplete="current-password"
            />
            <button
              type="button"
              className="bb-eye-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label="Toggle password visibility"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Remember / Forgot */}
          <div className="bb-options">
            <label className="bb-remember">
              <input type="checkbox" />
              <span>Remember me</span>
            </label>
            <Link to="#" className="bb-forgot">
              Forgot Password?
            </Link>
          </div>

          {/* Login button */}
          <button
            className="bb-btn-login"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="bb-spinner" />
                Logging in...
              </>
            ) : (
              <>
                <svg
                  width="16"
                  height="16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Log In
              </>
            )}
          </button>

          {/* Sign up nudge */}
          <p className="bb-signup-nudge">
            New here? <Link to="/signup">Create an Account</Link>
          </p>

          {/* Divider */}
          <div className="bb-divider">
            <div className="bb-divider-line" />
            <span>or continue with</span>
            <div className="bb-divider-line" />
          </div>

          {/* Social */}
          <div className="bb-socials">
            <button className="bb-social-btn" aria-label="Continue with Google">
              {/* Google icon */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </button>
            <button className="bb-social-btn" aria-label="Continue with GitHub">
              {/* GitHub icon */}
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default LoginModern;
