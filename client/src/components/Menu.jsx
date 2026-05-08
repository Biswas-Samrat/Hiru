import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Leaf, Plus } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const Menu = () => {
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('Kottu');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const categories = ['Kottu', 'Rice', 'Burgers', 'Fusion'];

  useEffect(() => {
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
    fetchMenu();
  }, []);

  const filteredItems = items.filter(item => item.category === activeCategory);

  return (
    <section id="menu" className="py-24 bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-gold font-royal tracking-[0.3em] uppercase mb-4 text-sm">Curated Menu</h2>
          <h3 className="text-4xl md:text-6xl font-serif font-bold">Discover Our Flavors</h3>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-16">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-8 py-2 border transition-all duration-300 tracking-widest uppercase text-sm ${
                activeCategory === cat ? 'bg-gold border-gold text-black' : 'border-gold/30 text-gold hover:border-gold'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        <motion.div 
          layout
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode='popLayout'>
            {filteredItems.map(item => (
              <motion.div
                key={item._id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="glass p-6 group relative overflow-hidden"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    {item.isVegetarian && <Leaf className="text-green-500" size={18} />}
                    {item.isSpicy && <Flame className="text-accent-orange" size={18} />}
                  </div>
                  <span className="text-gold font-bold text-xl">${item.price}</span>
                </div>
                <h4 className="text-2xl font-serif font-bold mb-2 group-hover:text-gold transition-colors">{item.name}</h4>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{item.description}</p>
                
                <button 
                  onClick={() => setSelectedItem(item)}
                  className="w-full py-2 border border-gold/20 text-gold hover:bg-gold hover:text-black transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={18} /> Add to Order
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Customization Modal */}
      <AnimatePresence>
        {selectedItem && (
          <CustomizationModal 
            item={selectedItem} 
            onClose={() => setSelectedItem(null)} 
          />
        )}
      </AnimatePresence>
    </section>
  );
};

const CustomizationModal = ({ item, onClose }) => {
  const [spice, setSpice] = useState('Medium');
  const [curryBase, setCurryBase] = useState('Chicken');

  const spiceLevels = ['Mild', 'Medium', 'Spicy', 'Extra Spicy'];
  const curryBases = ['Chicken', 'Beef', 'Lamb', 'Vegetable'];

  const handleAddToCart = () => {
    // Logic to add to cart/local storage
    console.log('Added to cart:', { ...item, spice, curryBase });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="glass max-w-md w-full p-8 relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gold">
          <Plus className="rotate-45" size={24} />
        </button>
        
        <h3 className="text-3xl font-serif font-bold mb-2">{item.name}</h3>
        <p className="text-gray-400 mb-8">{item.description}</p>

        {item.category === 'Kottu' && (
          <div className="space-y-8">
            <div>
              <label className="block text-gold text-sm uppercase tracking-widest mb-4 font-bold">Select Curry Base</label>
              <div className="grid grid-cols-2 gap-3">
                {curryBases.map(base => (
                  <button
                    key={base}
                    onClick={() => setCurryBase(base)}
                    className={`py-3 border transition-all ${curryBase === base ? 'bg-gold border-gold text-black' : 'border-gold/20 text-gray-400 hover:border-gold/50'}`}
                  >
                    {base}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gold text-sm uppercase tracking-widest mb-4 font-bold">Spice Level</label>
              <div className="grid grid-cols-2 gap-3">
                {spiceLevels.map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setSpice(lvl)}
                    className={`py-3 border transition-all ${spice === lvl ? 'bg-accent-orange border-accent-orange text-white' : 'border-gold/20 text-gray-400 hover:border-gold/50'}`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <button 
          onClick={handleAddToCart}
          className="btn-primary w-full mt-10"
        >
          Confirm & Add to Bag
        </button>
      </motion.div>
    </div>
  );
};

export default Menu;
