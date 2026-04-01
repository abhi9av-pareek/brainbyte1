import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginModern from "./components/LoginModern";
import Signup from "./components/Signup";
import Dashboard from "./components/Dashboard";
import QuizSetup from "./components/QuizSetup";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginModern />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/QuizSetup" element={<QuizSetup />} />;
      </Routes>
    </BrowserRouter>
  );
}

export default App;
