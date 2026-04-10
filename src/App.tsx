import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import SwipePage from "./pages/SwipePage";
import LikedRecipesPage from "./pages/LikedRecipesPage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import CookPage from "./pages/CookPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<SwipePage />} />
        <Route path="/cook" element={<CookPage />} />
        <Route path="/liked" element={<LikedRecipesPage />} />
        <Route path="/recipe/:id" element={<RecipeDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </Layout>
  );
}
