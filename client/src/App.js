import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage/LandingPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import DashboardPage from "./pages/DashboardPage/DashboardPage";
import RetailerPage from "./pages/RetailerPage/RetailerPage";
import ProductListPage from "./pages/ProductListPage/ProductListPage";
import AccountSettingsPage from "./pages/AccountSettingsPage/AccountSettingsPage";
import "./App.scss";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/dashboard/:userId" element={<DashboardPage />} />
        <Route
          path="/dashboard/:userId/settings"
          element={<AccountSettingsPage />}
        />
        <Route path="/retailer/:userId" element={<RetailerPage />} />
        <Route path="/product-list/:userId" element={<ProductListPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;