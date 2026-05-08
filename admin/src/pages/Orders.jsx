import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { Clock, Check, Loader2, AlertCircle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const socket = io(API_URL);

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/orders`);
        setOrders(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    socket.on('newOrder', (newOrder) => {
      setOrders(prev => [newOrder, ...prev]);
    });

    socket.on('adminOrderUpdate', (updatedOrder) => {
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
    });

    return () => {
      socket.off('newOrder');
      socket.off('adminOrderUpdate');
    };
  }, []);

  const updateStatus = async (id, status, prepTimer = null) => {
    try {
      await axios.put(`${API_URL}/api/orders/${id}/status`, { 
        status, 
        preparationTimer: prepTimer 
      });
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gold"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Live Orders</h2>
        <div className="flex gap-2">
          <span className="flex items-center gap-2 text-xs bg-gold/10 text-gold px-3 py-1 border border-gold/20">
            <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
            CONNECTED TO KITCHEN
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {orders.filter(o => o.status !== 'Completed').map(order => (
          <div key={order._id} className={`card ${order.status === 'Pending' ? 'border-l-4 border-l-gold' : ''}`}>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-bold text-gold uppercase tracking-widest">#{order._id.slice(-6)}</h3>
                <p className="text-gray-400 text-sm">{order.customerInfo.name} • {order.customerInfo.phone}</p>
              </div>
              <div className="text-right">
                <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${
                  order.status === 'Pending' ? 'border-gold text-gold' : 'border-gray-500 text-gray-500'
                }`}>
                  {order.status}
                </span>
                <p className="text-xs text-gray-500 mt-2">{new Date(order.createdAt).toLocaleTimeString()}</p>
              </div>
            </div>

            <div className="space-y-3 mb-8">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span>{item.quantity}x {item.menuItem?.name || 'Item'}</span>
                  <span className="text-gray-500">{item.curryBase} | {item.spiceLevel}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-3 pt-6 border-t border-gold/10">
              {order.status === 'Pending' && (
                <div className="flex items-center gap-2 w-full mb-4">
                  <input 
                    type="number" 
                    placeholder="Prep mins" 
                    id={`prep-${order._id}`}
                    className="bg-black border border-gold/20 px-3 py-2 text-sm w-24 focus:outline-none focus:border-gold"
                  />
                  <button 
                    onClick={() => {
                      const val = document.getElementById(`prep-${order._id}`).value;
                      updateStatus(order._id, 'Preparing', val || 15);
                    }}
                    className="btn-gold flex-grow"
                  >
                    Start Preparing
                  </button>
                </div>
              )}
              
              {order.status === 'Preparing' && (
                <button onClick={() => updateStatus(order._id, 'Almost Ready')} className="bg-orange-600 text-white px-4 py-2 font-bold hover:bg-orange-700 transition-all flex-grow">
                  Mark Almost Ready
                </button>
              )}

              {order.status === 'Almost Ready' && (
                <button onClick={() => updateStatus(order._id, 'Ready for Pickup')} className="bg-green-600 text-white px-4 py-2 font-bold hover:bg-green-700 transition-all flex-grow">
                  Ready for Pickup
                </button>
              )}

              {(order.status === 'Ready for Pickup') && (
                <button onClick={() => updateStatus(order._id, 'Completed')} className="border border-gray-600 text-gray-400 px-4 py-2 font-bold hover:border-white hover:text-white transition-all flex-grow">
                  Finish / Collected
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Orders;
