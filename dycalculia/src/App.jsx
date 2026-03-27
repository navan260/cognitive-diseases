import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "./LanguageContext";
import Home from "./pages/Home";
import SmartTest from "./features/smartTest/tests/SmartTest"

export default function App() {
  return (
    <LanguageProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/test/:testType" element={<SmartTest />} />
        </Routes>
      </Router>
    </LanguageProvider>
  );
}
