import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import MenuManagement from './pages/MenuManagement';
import GalleryManagement from './pages/GalleryManagement';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-gold">
        <i className="fa-solid fa-spinner fa-spin text-3xl" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const Sidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const { email, logout } = useAuth();

  const menuItems = [
    { name: 'Dashboard', icon: 'fa-solid fa-gauge-high', path: '/' },
    { name: 'Orders', icon: 'fa-solid fa-cart-shopping', path: '/orders' },
    { name: 'Reservations', icon: 'fa-solid fa-calendar-days', path: '/reservations' },
    { name: 'Menu', icon: 'fa-solid fa-utensils', path: '/menu' },
    { name: 'Gallery', icon: 'fa-solid fa-images', path: '/gallery' },
    { name: 'Settings', icon: 'fa-solid fa-gear', path: '/settings' },
  ];

  const navContent = (
    <>
      <div className="border-b border-border p-5">
        <h1 className="text-lg font-bold text-ink">Hiran&apos;s Admin</h1>
        <p className="mt-1 truncate text-xs text-muted">{email}</p>
      </div>
      <nav className="flex-grow py-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={`flex items-center gap-3 border-l-4 px-5 py-3 no-underline transition ${
              location.pathname === item.path
                ? 'border-gold bg-gold/10 text-gold'
                : 'border-transparent text-muted hover:bg-surface hover:text-ink'
            }`}
          >
            <i className={`${item.icon} w-5 text-center`} />
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="border-t border-border p-4">
        <button
          type="button"
          onClick={logout}
          className="btn-secondary w-full gap-2"
        >
          <i className="fa-solid fa-right-from-bracket" />
          Sign out
        </button>
        <p className="mt-3 text-center text-xs text-muted">&copy; {new Date().getFullYear()} Hiru Kitchen</p>
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink/30 lg:hidden"
          aria-label="Close menu"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col border-r border-border bg-white transition-transform lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {navContent}
      </aside>
    </>
  );
};

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-surface">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center gap-4 border-b border-border bg-white px-4 py-3 lg:hidden">
          <button
            type="button"
            className="rounded-lg p-2 text-ink hover:bg-surface"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <i className="fa-solid fa-bars text-xl" />
          </button>
          <span className="font-bold text-ink">Hiran&apos;s Admin</span>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/gallery" element={<GalleryManagement />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/*"
            element={(
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
