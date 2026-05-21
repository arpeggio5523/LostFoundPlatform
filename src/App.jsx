import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// import LoginPage from "./pages/LoginPage";
// import SignupPage from "./pages/SignupPage";
// import FoundItemsPage from "./pages/FoundItemsPage/FoundItemsPage";
import ReportLost from "./pages/Reporting/ReportLost";

function App() {
  return (
      <Routes>
        {/* <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} /> */}
        <Route path="/report-lost" element={<ReportLost />} />
      </Routes>
  );
}

export default App;