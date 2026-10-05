import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import PopupContainer from './components/popups/PopupContainer.jsx';
import Footer from './components/layout/Footer.jsx';
import Home from './pages/Home.jsx';
import CourseList from './pages/CourseList.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import MyFavorites from './pages/MyFavorites.jsx';
import MyCertificates from './pages/MyCertificates.jsx';
import MyPoints from './pages/MyPoints.jsx';
import AdminLogin from './pages/admin/AdminLogin.jsx';
import AdminLayout from './pages/admin/AdminLayout.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import HeroManager from './pages/admin/HeroManager.jsx';
import CategoryManager from './pages/admin/CategoryManager.jsx';
import CourseManager from './pages/admin/CourseManager.jsx';
import ProtectedRoute from './components/admin/ProtectedRoute.jsx';
import { usePopupStore } from './store/popupStore.js';

function ComingSoon({ title }) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-6xl flex-col items-center justify-center px-4 text-center">
      <div className="rounded-2xl bg-white p-10 shadow-sm ring-1 ring-primary-100">
        <h2 className="text-2xl font-extrabold text-primary-600">{title}</h2>
        <p className="mt-3 text-sm text-gray-500">
          Trang này đang được phát triển. Vui lòng quay lại sau.
        </p>
      </div>
    </div>
  );
}

export default function App() {
  const init = usePopupStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-primary-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/khoa-hoc" element={<CourseList />} />
          <Route path="/khoa-hoc/:slug" element={<CourseDetail />} />
          <Route path="/yeu-thich" element={<MyFavorites />} />
          <Route path="/chung-chi" element={<MyCertificates />} />
          <Route path="/diem" element={<MyPoints />} />
          <Route
            path="/cua-hang"
            element={<ComingSoon title="Cửa hàng sinh kế" />}
          />
          <Route
            path="/thu-vien"
            element={<ComingSoon title="Thư viện tài liệu" />}
          />
          <Route
            path="/he-chieu"
            element={<ComingSoon title="Hộ Chiếu An Toàn" />}
          />
          <Route path="/workshop" element={<ComingSoon title="Workshop" />} />
          <Route
            path="/hoi-chuyen-gia"
            element={<ComingSoon title="Hỏi chuyên gia" />}
          />
          <Route path="/dien-dan" element={<ComingSoon title="Diễn đàn" />} />
          <Route path="/ho-tro" element={<ComingSoon title="Hỗ trợ 24/7" />} />

          {/* Admin — tách biệt khỏi public layout */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="heroes" element={<HeroManager />} />
            <Route path="categories" element={<CategoryManager />} />
            <Route path="courses" element={<CourseManager />} />
          </Route>

          <Route
            path="*"
            element={<ComingSoon title="404 — Không tìm thấy trang" />}
          />
        </Routes>
        <PopupContainer />
        <Footer />
      </div>
    </BrowserRouter>
  );
}