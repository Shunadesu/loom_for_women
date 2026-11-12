import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import LoginDrawer from './components/auth/LoginDrawer.jsx';
import CartDrawer from './components/cart/CartDrawer.jsx';
import ExpertQAModal from './components/expert/ExpertQAModal.jsx';
import SupportModal from './components/support/SupportModal.jsx';
import WorkshopModal from './components/workshop/WorkshopModal.jsx';
import ForumModal from './components/forum/ForumModal.jsx';
import Footer from './components/layout/Footer.jsx';
import BottomNav from './components/layout/BottomNav.jsx';
import ScrollToTop from './components/layout/ScrollToTop.jsx';
import VisitTracker from './components/analytics/VisitTracker.jsx';
import PageTransition from './components/layout/PageTransition.jsx';
import NotificationContainer from './components/notification/NotificationContainer.jsx';
import Home from './pages/Home.jsx';
import CourseList from './pages/CourseList.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import MyFavorites from './pages/MyFavorites.jsx';
import MyCertificates from './pages/MyCertificates.jsx';
import MyPoints from './pages/MyPoints.jsx';
import Marketplace from './pages/Marketplace.jsx';
import Library from './pages/Library.jsx';
import SafetyPassport from './pages/SafetyPassport.jsx';
import NewsDetail from './pages/NewsDetail.jsx';
import PrivacyPolicy from './pages/PrivacyPolicy.jsx';
import TermsOfUse from './pages/TermsOfUse.jsx';
import EsgCommitment from './pages/EsgCommitment.jsx';
import UserProtectedRoute from './components/auth/UserProtectedRoute.jsx';
import { useForumStore } from './store/forumStore.js';
import { useCartStore } from './store/cartStore.js';
import { useAuthStore } from './store/authStore.js';
import { useConfigStore } from './store/configStore.js';
import { useProgressStore } from './store/progressStore.js';
import { usePointsStore } from './store/pointsStore.js';
import { resolveImageUrl } from './utils/imageUrl.js';

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

/**
 * AppRoutes — dùng location.pathname làm key để PageTransition biết khi nào
 * trang thay đổi (cần thiết cho AnimatePresence của framer-motion).
 */
function AppRoutes() {
  const location = useLocation();
  return (
    <PageTransition>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/khoa-hoc" element={<CourseList />} />
        <Route path="/khoa-hoc/:slug" element={<CourseDetail />} />
        <Route
          path="/yeu-thich"
          element={
            <UserProtectedRoute>
              <MyFavorites />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/chung-chi"
          element={
            <UserProtectedRoute>
              <MyCertificates />
            </UserProtectedRoute>
          }
        />
        <Route
          path="/diem"
          element={
            <UserProtectedRoute>
              <MyPoints />
            </UserProtectedRoute>
          }
        />
        <Route path="/cua-hang" element={<Marketplace />} />
        <Route path="/thu-vien" element={<Library />} />
        <Route
          path="/he-chieu"
          element={
            <UserProtectedRoute>
              <SafetyPassport />
            </UserProtectedRoute>
          }
        />
        <Route path="/workshop" element={<ComingSoon title="Workshop" />} />
        <Route path="/tin-tuc" element={<ComingSoon title="Tin tức & Cập nhật" />} />
        <Route path="/tin-tuc/:slug" element={<NewsDetail />} />
        <Route path="/chinh-sach-bao-mat" element={<PrivacyPolicy />} />
        <Route path="/dieu-khoan-su-dung" element={<TermsOfUse />} />
        <Route path="/cam-ket-esg-2026" element={<EsgCommitment />} />

        <Route
          path="*"
          element={<ComingSoon title="404 — Không tìm thấy trang" />}
        />
      </Routes>
    </PageTransition>
  );
}

export default function App() {
  const isForumOpen = useForumStore((s) => s.isOpen);
  const closeForum = useForumStore((s) => s.closeForum);
  const isCartOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const initCart = useCartStore((s) => s.init);
  const token = useAuthStore((s) => s.token);
  const fetchConfig = useConfigStore((s) => s.fetchConfig);
  const logoUrl = useConfigStore((s) => s.config?.logoUrl);
  const fetchProgress = useProgressStore((s) => s.fetch);
  // Tải config (logo, text popup) sớm để header/footer có logo ngay
  useEffect(() => {
    fetchConfig();
  }, [fetchConfig]);

  // Cập nhật favicon theo logo đang cấu hình
  useEffect(() => {
    const link = document.querySelector('link[rel="icon"]');
    if (!link) return;
    link.setAttribute('href', logoUrl ? resolveImageUrl(logoUrl) : '/logo.png');
  }, [logoUrl]);

  // Khi user đăng nhập (token xuất hiện) → tải cart từ server
  useEffect(() => {
    if (token) {
      initCart();
    }
  }, [token, initCart]);

  // Khi user đăng nhập → nạp tiến trình học tập để các badge "đã học" hiển thị
  // đúng ở mọi trang (khóa học nổi bật, danh sách khóa học, yêu thích...)
  // + nạp tổng điểm để header (BrandBar đọc authStore.points) không kẹt ở 0
  // sau khi reload (persist lưu điểm cũ).
  useEffect(() => {
    if (token) {
      fetchProgress().catch(() => {});
      try {
        usePointsStore.getState().fetch().catch(() => {});
      } catch (_) {}
    } else {
      // Đăng xuất → xoá tiến trình + điểm cũ để không lọn vào tài khoản khác.
      useProgressStore.setState({ byCourse: {}, favoriteIds: new Set() });
      try {
        usePointsStore.setState({ total: 0, transactions: [] });
      } catch (_) {}
    }
  }, [token, fetchProgress]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <VisitTracker />
      <div className="flex min-h-screen flex-col bg-primary-50">
        <AppRoutes />
        <LoginDrawer />
        <CartDrawer isOpen={isCartOpen} onClose={closeCart} />
        <ExpertQAModal />
        <SupportModal />
        <WorkshopModal />
        <ForumModal isOpen={isForumOpen} onClose={closeForum} />
        <NotificationContainer />
        <BottomNav />
        <Footer />
      </div>
    </BrowserRouter>
  );
}