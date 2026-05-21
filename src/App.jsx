import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FoundItemsPage from "./pages/FoundItemsPage";
import ReportFoundItemPage from "./pages/ReportFoundItemPage";
import LostItemsPage from "./pages/LostItemsPage";
import ItemDetailPage from "./pages/ItemDetailPage";

function App() {
  return (
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/report-found" element={<ReportFoundItemPage />} />
      </Routes>
  );
}
export default App;