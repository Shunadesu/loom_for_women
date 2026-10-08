import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Layout from './pages/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardShowcase from './pages/DashboardShowcase.jsx';
import HeroManager from './pages/HeroManager.jsx';
import CategoryManager from './pages/CategoryManager.jsx';
import CourseManager from './pages/CourseManager.jsx';
import LessonManager from './pages/LessonManager.jsx';
import ProductCategoryManager from './pages/ProductCategoryManager.jsx';
import ProductManager from './pages/ProductManager.jsx';
import ForumPostManager from './pages/ForumPostManager.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="showcase" element={<DashboardShowcase />} />
          <Route path="heroes" element={<HeroManager />} />
          <Route path="categories" element={<CategoryManager />} />
          <Route path="courses" element={<CourseManager />} />
          <Route path="courses/:courseId/lessons" element={<LessonManager />} />
          <Route path="product-categories" element={<ProductCategoryManager />} />
          <Route path="products" element={<ProductManager />} />
          <Route path="forum-posts" element={<ForumPostManager />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
