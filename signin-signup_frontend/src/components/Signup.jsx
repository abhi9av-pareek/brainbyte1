import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../utils/axiosConfig";
import {
  Mail,
  Lock,
  User,
  Phone,
  GraduationCap,
  Eye,
  EyeOff,
  ArrowRight,
} from "lucide-react";

function Signup() {
  const navigate = useNavigate();
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    educationLevel: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!vantaEffect) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js";
      document.body.appendChild(script);

      script.onload = () => {
        const vantaScript = document.createElement("script");
        vantaScript.src =
          "https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js";
        document.body.appendChild(vantaScript);

        vantaScript.onload = () => {
          if (window.VANTA && vantaRef.current) {
            const effect = window.VANTA.NET({
              el: vantaRef.current,
              mouseControls: true,
              touchControls: true,
              gyroControls: false,
              minHeight: 200.0,
              minWidth: 200.0,
              scale: 1.0,
              scaleMobile: 1.0,
              color: 0xa78bfa,
              backgroundColor: 0x0f172a,
              points: 12.0,
              maxDistance: 20.0,
              spacing: 15.0,
            });
            setVantaEffect(effect);
          }
        };
      };
    }

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    // Clear error for this field
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Invalid email format";
    if (!formData.contactNumber.trim())
      newErrors.contactNumber = "Contact number is required";
    if (!formData.educationLevel)
      newErrors.educationLevel = "Please select education level";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6)
      newErrors.password = "Password must be at least 6 characters";

    return newErrors;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:8000/api/auth/signup",
        formData,
      );

      console.log("Signup success:", res.data);

      const token =
        res.data?.token ||
        res.data?.data?.token ||
        res.data?.accessToken ||
        res.data?.data?.accessToken;

      const user =
        res.data?.user || res.data?.data?.user || res.data?.data || res.data;

      // Guard: if no token found, don't navigate — show error instead
      if (!token) {
        console.error("No token in signup response:", res.data);
        setErrors({
          submit: "Account created but login failed. Please log in manually.",
        });
        setLoading(false);
        return;
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      navigate("/dashboard");
    } catch (error) {
      console.log("Signup error:", error.response?.data);
      const errorMessage =
        error.response?.data?.message || "Signup failed. Please try again.";
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-hidden relative flex items-center justify-center p-4">
      {/* Vanta.js background */}
      <div
        ref={vantaRef}
        className="absolute inset-0 z-0"
        style={{ width: "100%", height: "100%" }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-950 to-slate-950 z-1" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl z-0" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl z-0" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-950/80 backdrop-blur-xl border border-purple-500/20 rounded-3xl shadow-2xl p-8 lg:p-10 animate-fadeInUp">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl mb-4 animate-float">
              <GraduationCap size={28} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
              Create Account
            </h1>
            <p className="text-slate-400 text-sm">
              Join the BrainByte community and master your exams
            </p>
          </div>

          {/* Error message */}
          {errors.submit && (
            <div className="mb-6 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm animate-slideDown">
              {errors.submit}
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Name */}
            <div className="group">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 tracking-wider">
                Full Name
              </label>
              <div className="relative">
                <User
                  className="absolute left-3 top-3.5 text-purple-400 transition-colors group-hover:text-purple-300"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Enter your full name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border ${
                    errors.name
                      ? "border-red-500/50"
                      : "border-purple-500/30 hover:border-purple-500/50"
                  } rounded-xl outline-none text-white placeholder-slate-500 transition-all duration-300 focus:border-purple-500 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500/30`}
                />
                {errors.name && (
                  <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="group">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-3 top-3.5 text-purple-400 transition-colors group-hover:text-purple-300"
                  size={18}
                />
                <input
                  type="email"
                  placeholder="your.email@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border ${
                    errors.email
                      ? "border-red-500/50"
                      : "border-purple-500/30 hover:border-purple-500/50"
                  } rounded-xl outline-none text-white placeholder-slate-500 transition-all duration-300 focus:border-purple-500 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500/30`}
                />
                {errors.email && (
                  <p className="text-red-400 text-xs mt-1">{errors.email}</p>
                )}
              </div>
            </div>

            {/* Contact */}
            <div className="group">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 tracking-wider">
                Contact Number
              </label>
              <div className="relative">
                <Phone
                  className="absolute left-3 top-3.5 text-purple-400 transition-colors group-hover:text-purple-300"
                  size={18}
                />
                <input
                  type="tel"
                  placeholder="+91 XXXXXXXXXX"
                  name="contactNumber"
                  value={formData.contactNumber}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border ${
                    errors.contactNumber
                      ? "border-red-500/50"
                      : "border-purple-500/30 hover:border-purple-500/50"
                  } rounded-xl outline-none text-white placeholder-slate-500 transition-all duration-300 focus:border-purple-500 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500/30`}
                />
                {errors.contactNumber && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.contactNumber}
                  </p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="group">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 tracking-wider">
                Education Level
              </label>
              <div className="relative">
                <GraduationCap
                  className="absolute left-3 top-3.5 text-purple-400 pointer-events-none"
                  size={18}
                />
                <select
                  name="educationLevel"
                  value={formData.educationLevel}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 bg-slate-800/50 border ${
                    errors.educationLevel
                      ? "border-red-500/50"
                      : "border-purple-500/30 hover:border-purple-500/50"
                  } rounded-xl outline-none text-white placeholder-slate-500 transition-all duration-300 focus:border-purple-500 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500/30 appearance-none cursor-pointer`}
                >
                  <option value="" className="bg-slate-900">
                    Select your education level
                  </option>
                  <option value="Dropout" className="bg-slate-900">
                    Dropout
                  </option>
                  <option value="High School" className="bg-slate-900">
                    High School
                  </option>
                  <option value="Undergraduate" className="bg-slate-900">
                    Undergraduate
                  </option>
                  <option value="Postgraduate" className="bg-slate-900">
                    Postgraduate
                  </option>
                  <option value="Professional" className="bg-slate-900">
                    Professional
                  </option>
                </select>
                {errors.educationLevel && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.educationLevel}
                  </p>
                )}
              </div>
            </div>

            {/* Password */}
            <div className="group">
              <label className="block text-xs font-semibold text-slate-300 uppercase mb-2 tracking-wider">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-3 top-3.5 text-purple-400 transition-colors group-hover:text-purple-300"
                  size={18}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-11 py-3 bg-slate-800/50 border ${
                    errors.password
                      ? "border-red-500/50"
                      : "border-purple-500/30 hover:border-purple-500/50"
                  } rounded-xl outline-none text-white placeholder-slate-500 transition-all duration-300 focus:border-purple-500 focus:bg-slate-800 focus:ring-1 focus:ring-purple-500/30`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-purple-400 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-xs mt-1">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:from-purple-700 disabled:to-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50 disabled:shadow-none animate-slideUp"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Sign Up
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-purple-500/20">
            <p className="text-center text-slate-400 text-sm">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
              >
                Log In
              </Link>
            </p>
          </div>

          {/* Animated gradient border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-purple-500/0 to-blue-500/0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>

        {/* Bottom gradient glow */}
        <div className="mt-6 h-1 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 rounded-full blur-lg opacity-50" />
      </div>

      {/* Styles */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out;
        }

        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.3s both;
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

export default Signup;
