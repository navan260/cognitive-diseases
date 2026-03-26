import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Live from "./pages/Live";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/live" element={<Live />} />
    </Routes>
  );
}

export default App;