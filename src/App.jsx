import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import FoundItemsPage from "./pages/FoundItemsPage";
import ReportFoundItemPage from "./pages/ReportFoundItemPage";
import LostItemsPage from "./pages/LostItemsPage";
<<<<<<< HEAD
import ReportLostItemPage from "./pages/Reporting/ReportLost";
=======
import ItemDetailPage from "./pages/ItemDetailPage";
>>>>>>> 9bfd43712227d544e2c05ef6028209d7cf1f4811

function App() {
  return (
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
        <Route path="/lost-items" element={<LostItemsPage />} />
        <Route path="/item/:id" element={<ItemDetailPage />} />
        <Route path="/report-found" element={<ReportFoundItemPage />} />
<<<<<<< HEAD
        <Route path="/report-lost" element={<ReportLostItemPage/>}/>

=======
>>>>>>> 9bfd43712227d544e2c05ef6028209d7cf1f4811
      </Routes>
  );
}
export default App;