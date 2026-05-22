import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FoundItemsPage from "./pages/FoundItemsPage";
import ReportFoundItemPage from "./pages/ReportFoundItemPage";
import LostItemsPage from "./pages/LostItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";
import ProfilePage from "./pages/ProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ReportLostItemPage from "./pages/Reporting/ReportLost";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/settings" element={<SettingsPage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/report-found" element={<ReportFoundItemPage />} />
        <Route path="/report-lost" element={<ReportLostItemPage />} />
      </Routes>
  );
}
export default App;