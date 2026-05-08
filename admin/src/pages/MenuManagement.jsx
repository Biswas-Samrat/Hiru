import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Edit2, Trash2, EyeOff, Eye, Plus, Loader2 } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMenu();
  }, []);

  const fetchMenu = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/menu`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStock = async (id, currentStatus) => {
    try {
      await axios.put(`${API_URL}/api/menu/${id}`, { isOutOfStock: !currentStatus });
      setItems(items.map(item => item._id === id ? { ...item, isOutOfStock: !currentStatus } : item));
    } catch (err) {
      console.error(err);
    }
  };

  const updatePrice = async (id, newPrice) => {
    try {
      await axios.put(`${API_URL}/api/menu/${id}`, { price: newPrice });
      setItems(items.map(item => item._id === id ? { ...item, price: newPrice } : item));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-full text-gold"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-serif font-bold">Menu Control</h2>
        <button className="btn-gold flex items-center gap-2">
          <Plus size={18} /> Add New Item
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-left">
          <thead className="border-b border-gold/10 text-gold uppercase text-xs tracking-widest">
            <tr>
              <th className="px-6 py-4">Item</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4">Price ($)</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gold/5">
            {items.map(item => (
              <tr key={item._id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold">{item.name}</div>
                  <div className="text-xs text-gray-500 line-clamp-1">{item.description}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs border border-gold/20 px-2 py-1 text-gold">{item.category}</span>
                </td>
                <td className="px-6 py-4">
                  <input 
                    type="number" 
                    defaultValue={item.price} 
                    onBlur={(e) => updatePrice(item._id, e.target.value)}
                    className="bg-black border border-gold/10 px-2 py-1 w-20 focus:outline-none focus:border-gold"
                  />
                </td>
                <td className="px-6 py-4">
                  {item.isOutOfStock ? (
                    <span className="text-red-500 text-xs flex items-center gap-1 font-bold">
                      <EyeOff size={14} /> OUT OF STOCK
                    </span>
                  ) : (
                    <span className="text-green-500 text-xs flex items-center gap-1 font-bold">
                      <Eye size={14} /> AVAILABLE
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-4">
                    <button onClick={() => toggleStock(item._id, item.isOutOfStock)} className="text-gray-400 hover:text-gold">
                      {item.isOutOfStock ? <Eye size={18} /> : <EyeOff size={18} />}
                    </button>
                    <button className="text-gray-400 hover:text-white">
                      <Edit2 size={18} />
                    </button>
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MenuManagement;
