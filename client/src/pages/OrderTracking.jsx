import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { saveTrackedOrder } from './OrderTrackingHub';

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
        if (localOrder) setOrder(JSON.parse(localOrder));
        return;
      }

      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}`);
        setOrder(res.data);
        saveTrackedOrder(res.data);
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
      saveTrackedOrder(updatedOrder);
    });

    return () => socket.off('orderUpdate');
  }, [id]);

  useEffect(() => {
    if (!order || !order.estimatedReadyTime || order.status === 'Ready for Pickup') return;

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

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream pt-28 text-gold">
        <i className="fa-solid fa-spinner fa-spin text-3xl" />
      </div>
    );
  }

  const steps = [
    { name: 'Pending', icon: 'fa-regular fa-clock' },
    { name: 'Preparing', icon: 'fa-solid fa-utensils' },
    { name: 'Almost Ready', icon: 'fa-solid fa-fire' },
    { name: 'Ready for Pickup', icon: 'fa-solid fa-box' },
  ];

  const currentStepIndex = Math.max(0, steps.findIndex((s) => s.name === order.status));
  const orderItems = Array.isArray(order.items) ? order.items : [];
  const progressWidth = (currentStepIndex / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-cream px-3 pb-12 pt-28">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <Link to="/my-orders" className="mb-4 inline-block text-sm text-gold hover:underline">
            ← My orders
          </Link>
          <h2 className="mb-2 font-royal text-xs font-bold uppercase tracking-widest text-gold">Order status</h2>
          <h1 className="text-3xl font-bold text-ink md:text-4xl">Track your order</h1>
        </div>

        <div className="card-light mb-8 p-8 text-center">
          <h3 className="mb-3 text-xs font-bold uppercase text-muted">Estimated preparation time</h3>
          <div className="mb-3 text-5xl font-bold tabular-nums text-gold md:text-6xl">
            {timeLeft !== null ? timeLeft : '--:--'}
          </div>
          <p className="text-muted">
            {order.status === 'Ready for Pickup'
              ? 'Your food is ready for collection!'
              : 'Your food will be ready soon'}
          </p>
          <span className="mt-4 inline-block rounded-full bg-gold/10 px-4 py-1 text-sm font-bold text-gold">
            {order.status}
          </span>
        </div>

        <div className="relative mb-10 px-2 md:px-4">
          <div className="absolute left-0 top-1/2 h-px w-full -translate-y-1/2 bg-gray-200" />
          <div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-gold transition-all duration-500"
            style={{ width: `${progressWidth}%` }}
          />
          <div className="relative flex justify-between">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full ${
                    idx <= currentStepIndex
                      ? 'bg-gold text-white'
                      : 'border border-gray-200 bg-white text-muted'
                  }`}
                >
                  <i className={step.icon} />
                </div>
                <span className={`mt-2 text-[10px] font-bold uppercase sm:text-xs ${idx <= currentStepIndex ? 'text-gold' : 'text-muted'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card-light p-6">
          <h4 className="mb-4 border-b border-gray-200 pb-2 text-xl font-bold text-ink">Order details</h4>
          <div className="space-y-3">
            {orderItems.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <span className="font-bold text-gold">{item.quantity}x</span>{' '}
                  {item.itemName || item.menuItem?.name || 'Menu item'}
                  {(item.spiceLevel || item.curryBase || item.extras?.length > 0) && (
                    <span className="ms-2 text-muted">
                      {[item.curryBase, item.spiceLevel, ...(item.extras || []).map((extra) => extra.name)]
                        .filter(Boolean)
                        .join(', ')}
                    </span>
                  )}
                </div>
                <span className="shrink-0 text-muted">
                  ${Number(item.lineTotal || item.menuItem?.price * item.quantity || 0).toFixed(2)}
                </span>
              </div>
            ))}
            <div className="mt-2 flex justify-between border-t border-gray-200 pt-3 text-lg font-bold">
              <span>Total</span>
              <span className="text-gold">${Number(order.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
