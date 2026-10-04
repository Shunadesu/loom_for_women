import { useEffect } from 'react';
import PopupContainer from './components/popups/PopupContainer.jsx';
import Home from './pages/Home.jsx';
import { usePopupStore } from './store/popupStore.js';

export default function App() {
  const init = usePopupStore((s) => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div className="min-h-screen bg-primary-50">
      <Home />
      <PopupContainer />
    </div>
  );
}