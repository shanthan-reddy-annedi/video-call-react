import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { VideoCall } from "./pages/videocall";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<VideoCall />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
