import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/Login.jsx';
import Layout from './pages/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import DashboardShowcase from './pages/DashboardShowcase.jsx';
import Analytics from './pages/Analytics.jsx';
import HeroManager from './pages/HeroManager.jsx';
import LogoManager from './pages/LogoManager.jsx';
import CourseManager from './pages/CourseManager.jsx';
import CourseForm from './pages/CourseForm.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import LessonManager from './pages/LessonManager.jsx';
import LessonFormPage from './pages/LessonFormPage.jsx';
import ForumPostManager from './pages/ForumPostManager.jsx';
import UserManager from './pages/UserManager.jsx';
import UserDetail from './pages/UserDetail.jsx';
import NotificationContainer from './components/notification/NotificationContainer.jsx';

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
          <Route path="analytics" element={<Analytics />} />
          <Route path="heroes" element={<HeroManager />} />
          <Route path="logo" element={<LogoManager />} />
          <Route path="courses" element={<CourseManager />} />
          <Route path="courses/new" element={<CourseForm />} />
          <Route path="courses/:courseId/edit" element={<CourseForm />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route path="courses/:courseId/lessons" element={<LessonManager />} />
          <Route
            path="courses/:courseId/lessons/new"
            element={<LessonFormPage />}
          />
          <Route
            path="courses/:courseId/lessons/:lessonId/edit"
            element={<LessonFormPage />}
          />
          <Route path="forum-posts" element={<ForumPostManager />} />
          <Route path="users" element={<UserManager />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <NotificationContainer />
    </BrowserRouter>
  );
}
