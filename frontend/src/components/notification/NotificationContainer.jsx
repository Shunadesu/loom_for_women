import NotifyModal from './NotifyModal.jsx';
import ToastStack from './ToastStack.jsx';

/**
 * Mount một lần trong App.jsx — render modal + toast stack.
 */
export default function NotificationContainer() {
  return (
    <>
      <NotifyModal />
      <ToastStack />
    </>
  );
}
