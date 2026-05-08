import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, UtensilsCrossed, PackageCheck } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchOrder();
    socket.emit('joinOrder', id);

    socket.on('orderUpdate', (updatedOrder) => {
      setOrder(updatedOrder);
    });

    return () => {
      socket.off('orderUpdate');
    };
  }, [id]);

  useEffect(() => {
    if (!order || !order.estimatedReadyTime || order.status === 'Ready for Pickup') {
      setTimeLeft(null);
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

  if (!order) return <div className="h-screen flex items-center justify-center bg-black text-gold">Loading...</div>;

  const steps = [
    { name: 'Pending', icon: <Clock size={24} />, color: 'text-gray-500' },
    { name: 'Preparing', icon: <UtensilsCrossed size={24} />, color: 'text-orange-500' },
    { name: 'Almost Ready', icon: <Flame size={24} />, color: 'text-yellow-500' },
    { name: 'Ready for Pickup', icon: <PackageCheck size={24} />, color: 'text-green-500' }
  ];

  const currentStepIndex = steps.findIndex(s => s.name === order.status);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-black px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-gold font-royal tracking-[0.3em] uppercase mb-4">Order Status</h2>
          <h1 className="text-4xl md:text-5xl font-serif font-bold">Track Your Feast</h1>
        </div>

        {/* Timer Card */}
        <div className="glass p-12 text-center mb-12 relative overflow-hidden border-gold/20">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold to-transparent opacity-50"></div>
          
          <h3 className="text-gray-400 uppercase tracking-widest text-sm mb-4 font-bold">Estimated Preparation Time</h3>
          <div className="text-7xl md:text-9xl font-serif font-bold text-gold mb-6 tabular-nums">
            {timeLeft !== null ? timeLeft : '--:--'}
          </div>
          <p className="text-gold/60 italic font-serif">
            {order.status === 'Ready for Pickup' ? 'Your food is ready for collection!' : 'Minutes until culinary perfection'}
          </p>
        </div>

        {/* Progress Tracker */}
        <div className="relative mb-20 px-8">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-800 -translate-y-1/2"></div>
          <div 
            className="absolute top-1/2 left-0 h-0.5 bg-gold transition-all duration-1000 -translate-y-1/2"
            style={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
          ></div>
          
          <div className="relative flex justify-between">
            {steps.map((step, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
                  idx <= currentStepIndex ? 'bg-gold text-black border-4 border-black' : 'bg-black border-4 border-gray-800 text-gray-500'
                }`}>
                  {step.icon}
                </div>
                <span className={`mt-4 text-xs font-bold uppercase tracking-widest ${idx <= currentStepIndex ? 'text-gold' : 'text-gray-600'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Details */}
        <div className="glass p-8">
          <h4 className="text-xl font-serif font-bold mb-6 border-b border-gold/10 pb-4">Order Details</h4>
          <div className="space-y-4">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center">
                <div>
                  <span className="font-bold text-gold">{item.quantity}x</span> {item.menuItem?.name}
                  {item.spiceLevel && <span className="ml-2 text-xs text-gray-500 italic">({item.curryBase}, {item.spiceLevel})</span>}
                </div>
                <span className="text-gray-400">${item.menuItem?.price * item.quantity}</span>
              </div>
            ))}
            <div className="pt-4 mt-4 border-t border-gold/10 flex justify-between font-bold text-xl">
              <span>Total</span>
              <span className="text-gold">${order.totalAmount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderTracking;
