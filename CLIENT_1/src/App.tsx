import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import RegisterPage from "./components/Register";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<RegisterPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
