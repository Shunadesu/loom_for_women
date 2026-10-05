import TopBar from './header/TopBar.jsx';
import BrandBar from './header/BrandBar.jsx';
import NavBar from './header/NavBar.jsx';

export default function Header() {
  return (
    <header className="sticky top-0 z-30 shadow-sm shadow-primary-100/40">
      <TopBar />
      <div className="border-b border-slate-200 bg-white shadow-xs">
        <div className="mx-auto max-w-6xl px-4 py-3">
          <BrandBar />
          <NavBar />
        </div>
      </div>
    </header>
  );
}