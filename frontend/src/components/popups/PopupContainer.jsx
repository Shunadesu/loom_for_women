import { AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { usePopupStore } from '../../store/popupStore.js';
import WelcomePopup from './WelcomePopup.jsx';
import RegisterPopup from './RegisterPopup.jsx';

export default function PopupContainer() {
  const step = usePopupStore((s) => s.step);
  const { pathname } = useLocation();
  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) return null;

  return (
    <AnimatePresence mode="wait">
      {step === 'welcome' && <WelcomePopup key="welcome" />}
      {step === 'register' && <RegisterPopup key="register" />}
    </AnimatePresence>
  );
}