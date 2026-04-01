import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [openProfile, setOpenProfile] = useState(false);
  const navigate = useNavigate();

  // FIX: move user state here (TOP LEVEL)
  const [user, setUser] = useState({
    name: "User",
    streak: 0,
    email: "",
  });

  // FIX: move useEffect here (TOP LEVEL)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      navigate("/login");
      return;
    }

    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);

      setUser({
        name: parsedUser.name || "User",
        email: parsedUser.email || "",
        streak: parsedUser.streak || 0,
      });
    }
  }, [navigate]);

  // const sendPrompt = (msg) => {
  //   console.log(msg);
  // };

  // logout logic
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#0A0B0F] text-[#F0EFF8] font-sans">
      {/* NAVBAR */}
      <nav className="flex items-center justify-between px-8 py-4 border-b border-white/10 bg-[#0A0B0F]/90 sticky top-0">
        {/* LOGO */}
        <div className="flex items-center gap-2 font-bold text-lg">
          <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-teal-400">
            🧠
          </div>
          Brain<span className="text-teal-400">Byte</span>
        </div>

        {/* LINKS */}
        <ul className="flex gap-8 text-sm text-gray-400">
          <li className="text-teal-400 cursor-pointer">Dashboard</li>
          <li className="cursor-pointer hover:text-white">Practice</li>
          <li className="cursor-pointer hover:text-white">Results</li>
          <li className="cursor-pointer hover:text-white">Analytics</li>
        </ul>

        {/* RIGHT streak section */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1 rounded-full text-sm bg-yellow-400/10 border border-yellow-400/30 text-yellow-400">
            🔥 {user.streak} day streak
          </div>

          <div
            onClick={() => setOpenProfile(true)}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-red-400 flex items-center justify-center font-bold cursor-pointer"
          >
            {user.name[0]}
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <main className="max-w-6xl mx-auto px-8 py-8">
        {/* HERO */}
        <div className="bg-[#111318] border border-white/10 rounded-2xl p-8 flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, <span className="text-teal-400">{user.name}</span>{" "}
              🫡
            </h1>

            <p className="text-gray-400 mb-4">
              You're on a roll — keep pushing your limits!
            </p>

            {/* BUTTONS */}
            <div className="flex gap-3">
              <button
                onClick={() => navigate("/QuizSetup")}
                className="px-5 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition"
              >
                Start Quiz
              </button>

              <button className="px-5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10">
                My Results
              </button>
            </div>
          </div>

          {/* VISUAL */}
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-purple-500 via-teal-400 to-red-400 flex items-center justify-center text-5xl">
            🧠
          </div>
        </div>
      </main>

      {/* BACKDROP */}
      {openProfile && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setOpenProfile(false)}
        ></div>
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-[#111318] border-l border-white/10 z-50 transform transition-transform duration-300 ${
          openProfile ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* HEADER */}
        <div className="p-5 border-b border-white/10 flex justify-between items-center">
          <h2 className="text-lg font-semibold">Profile</h2>
          <button onClick={() => setOpenProfile(false)}>✖</button>
        </div>

        {/* USER INFO */}
        <div className="p-5 border-b border-white/10">
          <p className="font-semibold">{user.name}</p>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>

        {/* MENU */}
        <div className="p-5 space-y-4 text-sm">
          <div className="cursor-pointer hover:text-teal-400">My Profile</div>
          <div className="cursor-pointer hover:text-teal-400">My Progress</div>
          <div className="cursor-pointer hover:text-teal-400">Settings</div>

          <div
            onClick={handleLogout}
            className="cursor-pointer hover:text-red-400"
          >
            Logout
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
