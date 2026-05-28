import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import MenuManagement from './pages/MenuManagement';
import SocialFeed from './pages/SocialFeed';
import Dashboard from './pages/Dashboard';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', icon: 'fa-solid fa-gauge-high', path: '/' },
    { name: 'Orders', icon: 'fa-solid fa-cart-shopping', path: '/orders' },
    { name: 'Reservations', icon: 'fa-solid fa-calendar-days', path: '/reservations' },
    { name: 'Menu', icon: 'fa-solid fa-utensils', path: '/menu' },
    { name: 'Social Feed', icon: 'fa-solid fa-share-nodes', path: '/social' },
  ];

  return (
    <div className="admin-sidebar d-flex flex-column">
      <div className="p-4 border-bottom border-gold">
        <h1 className="text-gold fw-bold fs-4 mb-0 text-uppercase" style={{ letterSpacing: '0.1em' }}>Hiran's Admin</h1>
      </div>
      <nav className="flex-grow-1 py-3">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={item.icon}></i>
            <span className="fw-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-4 small text-secondary border-top border-gold">
        &copy; 2024 Hiru Kitchen v1.0
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="d-flex bg-black min-vh-100 text-white">
        <Sidebar />
        <main className="flex-grow-1 p-4 p-lg-5 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/reservations" element={<Reservations />} />
            <Route path="/menu" element={<MenuManagement />} />
            <Route path="/social" element={<SocialFeed />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
