import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Calendar, Utensils, Share2 } from 'lucide-react';
import Orders from './pages/Orders';
import Reservations from './pages/Reservations';
import MenuManagement from './pages/MenuManagement';
import SocialFeed from './pages/SocialFeed';

const Sidebar = () => {
  const location = useLocation();
  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Orders', icon: <ShoppingCart size={20} />, path: '/orders' },
    { name: 'Reservations', icon: <Calendar size={20} />, path: '/reservations' },
    { name: 'Menu', icon: <Utensils size={20} />, path: '/menu' },
    { name: 'Social Feed', icon: <Share2 size={20} />, path: '/social' },
  ];

  return (
    <div className="w-64 h-screen bg-black border-r border-gold/10 flex flex-col">
      <div className="p-8 border-b border-gold/10">
        <h1 className="text-gold font-serif font-bold text-xl tracking-widest uppercase">Hiran's Admin</h1>
      </div>
      <nav className="flex-grow py-8">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.icon}
            <span className="font-semibold">{item.name}</span>
          </Link>
        ))}
      </nav>
      <div className="p-8 text-xs text-gray-600 border-t border-gold/10">
        &copy; 2024 Hiru Kitchen v1.0
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <div className="flex bg-black min-h-screen text-white">
        <Sidebar />
        <main className="flex-grow p-10 overflow-y-auto">
          <Routes>
            <Route path="/" element={<div className="text-4xl font-serif">Welcome back, Chef Hiran.</div>} />
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
