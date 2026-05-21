import { Routes, Route, Navigate } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FoundItemsPage from "./pages/FoundItemsPage";
import ReportFoundItemPage from "./pages/ReportFoundItemPage";
import LostItemsPage from "./pages/LostItemsPage";
import ReportLostItemPage from "./pages/Reporting/ReportLost";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/found-items" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/report-found" element={<ReportFoundItemPage />} />
        <Route path="/report-lost" element={<ReportLostItemPage/>}/>

      </Routes>
  );
}
export default App;