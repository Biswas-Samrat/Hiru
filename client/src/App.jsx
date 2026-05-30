import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import OrderTracking from './pages/OrderTracking';
import OrderTrackingHub from './pages/OrderTrackingHub';
import MenuPage from './pages/MenuPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import OrderOnlinePage from './pages/OrderOnlinePage';
import BookTablePage from './pages/BookTablePage';
import CartPage from './pages/CartPage';
import NotFound from './pages/NotFound';
import Footer from './components/Footer';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-cream">
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/menu" element={<MenuPage />} />
            <Route path="/order-online" element={<OrderOnlinePage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/book-a-table" element={<BookTablePage />} />
            <Route path="/order-tracking" element={<OrderTrackingHub />} />
            <Route path="/my-orders" element={<OrderTrackingHub />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
            <Route path="/chef-hiru" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
