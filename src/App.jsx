import {Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FoundItemsPage from "./pages/FoundItemsPage/FoundItemsPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/signup" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
      </Routes>
  );
}

export default App;