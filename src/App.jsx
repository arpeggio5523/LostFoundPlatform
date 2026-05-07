import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import FoundItemsPage from "./pages/FoundItemsPage/FoundItemsPage";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/found-items" replace />} />
        <Route path="/found-items" element={<FoundItemsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;