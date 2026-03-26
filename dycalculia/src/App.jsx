import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SmartTest from "./features/smartTest/tests/SmartTest";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test/:testType" element={<SmartTest />} />
      </Routes>
    </Router>
  );
}
