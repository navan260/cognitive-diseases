import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Live from "./pages/Live";
import Upload from "./pages/Upload";
import PdfUpload from "./pages/PdfUpload";
import PixelSnow from "./components/PixelSnow";

function App() {
  return (
    <>
      <div className="snow-background">
        <PixelSnow
          color="#a8d0ff"
          flakeSize={0.01}
          minFlakeSize={1.25}
          pixelResolution={200}
          speed={1.25}
          density={0.3}
          direction={125}
          brightness={1}
          depthFade={8}
          farPlane={20}
          gamma={0.4545}
          variant="square"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="app-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/live" element={<Live />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/pdf-upload" element={<PdfUpload />} />
        </Routes>
      </div>
    </>
  );
}

export default App;