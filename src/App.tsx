import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SwipePage from "./pages/SwipePage";
import LikedRecipesPage from "./pages/LikedRecipesPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CookPage from "./pages/CookPage";
import PlanPage from "./pages/PlanPage";
import ShoppingPage from "./pages/ShoppingPage";
import ProfilePage from "./pages/ProfilePage";
import HouseholdPage from "./pages/HouseholdPage";
import JoinPage from "./pages/JoinPage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SwipePage />} />
        <Route path="/cook" element={<CookPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/shopping" element={<ShoppingPage />} />
        <Route path="/liked" element={<LikedRecipesPage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/household" element={<HouseholdPage />} />
        <Route path="/join/:code" element={<JoinPage />} />
      </Routes>
    </Layout>
  );
}
