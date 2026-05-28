import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (id.startsWith('local-')) {
        const localOrder = localStorage.getItem(`hirans-order-${id}`);
        if (localOrder) {
          setOrder(JSON.parse(localOrder));
        }
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
    if (!id.startsWith('local-')) {
      socket.emit('joinOrder', id);
    }

    socket.on('orderUpdate', (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => {
      socket.off('orderUpdate');
    };
  }, [id]);

  useEffect(() => {
    if (!order || !order.estimatedReadyTime || order.status === 'Ready for Pickup') {
      return;
    }

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const readyTime = new Date(order.estimatedReadyTime).getTime();
      const diff = readyTime - now;

      if (diff <= 0) {
        setTimeLeft(0);
        clearInterval(timer);
      } else {
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}:${seconds < 10 ? '0' : ''}${seconds}`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order]);

  if (!order) return <div className="vh-100 d-flex align-items-center justify-content-center section-dark text-gold">Loading...</div>;

  const steps = [
    { name: 'Pending', icon: 'fa-regular fa-clock' },
    { name: 'Preparing', icon: 'fa-solid fa-utensils' },
    { name: 'Almost Ready', icon: 'fa-solid fa-fire' },
    { name: 'Ready for Pickup', icon: 'fa-solid fa-box' }
  ];

  const currentStepIndex = Math.max(0, steps.findIndex(s => s.name === order.status));
  const orderItems = Array.isArray(order.items) ? order.items : [];

  return (
    <div className="min-vh-100 pt-5 pb-5 section-dark px-3">
      <div className="container" style={{ maxWidth: '960px' }}>
        <div className="text-center mb-5 mt-4">
          <h2 className="text-gold text-uppercase mb-2 small">Order Status</h2>
          <h1 className="display-5 fw-bold">Track Your Feast</h1>
        </div>

        <div className="glass p-4 p-md-5 text-center mb-5">
          <h3 className="text-secondary text-uppercase small mb-3 fw-bold">Estimated Preparation Time</h3>
          <div className="display-1 fw-bold text-gold mb-3" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {timeLeft !== null ? timeLeft : '--:--'}
          </div>
          <p className="text-secondary mb-0 fst-italic">
            {order.status === 'Ready for Pickup' ? 'Your food is ready for collection!' : 'Your food will be ready soon'}
          </p>
        </div>

        <div className="position-relative mb-5 px-2 px-md-4">
          <div className="position-absolute top-50 start-0 w-100 border-top border-secondary"></div>
          <div 
            className="position-absolute top-50 start-0 border-top border-warning"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="position-relative d-flex justify-content-between">
            {steps.map((step, idx) => (
              <div key={idx} className="d-flex flex-column align-items-center">
                <div className={`rounded-circle d-flex align-items-center justify-content-center position-relative ${
                  idx <= currentStepIndex ? 'bg-gold text-dark border border-dark' : 'bg-dark border border-secondary text-secondary'
                }`}>
                  <i className={step.icon} style={{ width: '44px', height: '44px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}></i>
                </div>
                <span className={`mt-2 small fw-bold text-uppercase ${idx <= currentStepIndex ? 'text-gold' : 'text-secondary'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-4">
          <h4 className="h4 fw-bold mb-3 border-bottom border-gold pb-2">Order Details</h4>
          <div className="d-grid gap-3">
            {orderItems.map((item, idx) => (
              <div key={idx} className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="fw-bold text-gold">{item.quantity}x</span> {item.itemName || item.menuItem?.name || 'Menu item'}
                  {(item.spiceLevel || item.curryBase || item.extras?.length > 0) && (
                    <span className="ms-2 small text-secondary fst-italic">
                      {[item.curryBase, item.spiceLevel, ...(item.extras || []).map((extra) => extra.name)].filter(Boolean).join(', ')}
                    </span>
                  )}
                </div>
                <span className="text-secondary">${Number(item.lineTotal || item.menuItem?.price * item.quantity || 0).toFixed(2)}</span>
              </div>
            ))}
            <div className="pt-3 mt-2 border-top border-gold d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span className="text-gold">${Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
            {order.customerInfo?.paymentMethod && (
              <div className="pt-2 d-flex justify-content-between small text-secondary">
                <span>Payment</span>
                <span>{order.customerInfo.paymentMethod === 'online' ? 'Paid online' : 'Cash on pickup'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
