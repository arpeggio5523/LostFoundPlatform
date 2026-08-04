import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard"
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import FoundItemsPage from "./pages/FoundItemsPage";
import ReportFoundItemPage from "./pages/ReportFoundItemPage";
import LostItemsPage from "./pages/LostItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ReportLostItemPage from "./pages/ReportLostItemPage";
import MessagesPage from "./pages/MessagesPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<SettingsPage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/report-found" element={<ReportFoundItemPage />} />
        <Route path="/report-lost" element={<ReportLostItemPage />} />
        <Route path="/messages" element={<MessagesPage />} />
      </Routes>
  );
}
export default App;
