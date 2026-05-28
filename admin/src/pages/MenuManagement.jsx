import { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const CATEGORIES = ['Kottu', 'Rice', 'Burgers', 'Fusion'];

const emptyForm = {
  name: '',
  description: '',
  price: '',
  category: 'Kottu',
  image: '',
  isVegetarian: false,
  spicyLevel: 0,
  isFeatured: false,
  isAvailable: true,
  prepTime: 15,
};

const MenuManagement = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    let active = true;

    axios.get(`${API_URL}/api/menu`)
      .then((res) => {
        if (active) {
          setItems(res.data);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const openForm = (item = null) => {
    setEditingItem(item);
    setForm(item ? {
      name: item.name || '',
      description: item.description || '',
      price: item.price || '',
      category: CATEGORIES.includes(item.category) ? item.category : 'Fusion',
      image: item.image || '',
      isVegetarian: Boolean(item.isVegetarian),
      spicyLevel: Number(item.spicyLevel || (item.isSpicy ? 2 : 0)),
      isFeatured: Boolean(item.isFeatured),
      isAvailable: item.isAvailable !== false && item.isOutOfStock !== true,
      prepTime: item.prepTime || 15,
    } : emptyForm);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setForm((current) => ({ ...current, image: reader.result }));
    reader.readAsDataURL(file);
  };

  const saveItem = async (event) => {
    event.preventDefault();
    const payload = {
      ...form,
      price: Number(form.price),
      prepTime: Number(form.prepTime),
      spicyLevel: Number(form.spicyLevel),
      isSpicy: Number(form.spicyLevel) > 0,
      isOutOfStock: !form.isAvailable,
    };

    if (editingItem) {
      const res = await axios.put(`${API_URL}/api/menu/${editingItem.id || editingItem._id}`, payload);
      setItems((current) => current.map((item) => (item.id === res.data.id ? res.data : item)));
    } else {
      const res = await axios.post(`${API_URL}/api/menu`, payload);
      setItems((current) => [...current, res.data]);
    }

    openForm(null);
  };

  const deleteItem = async (id) => {
    await axios.delete(`${API_URL}/api/menu/${id}`);
    setItems((current) => current.filter((item) => (item.id || item._id) !== id));
  };

  const toggleAvailability = async (item) => {
    const id = item.id || item._id;
    const nextAvailable = !(item.isAvailable !== false && item.isOutOfStock !== true);
    const res = await axios.put(`${API_URL}/api/menu/${id}`, { isAvailable: nextAvailable });
    setItems((current) => current.map((entry) => ((entry.id || entry._id) === id ? res.data : entry)));
  };

  if (loading) {
    return <div className="d-flex align-items-center justify-content-center h-100 text-gold"><i className="fa-solid fa-spinner fa-spin fs-3"></i></div>;
  }

  return (
    <div>
      <div className="admin-page-heading">
        <div>
          <p className="text-gold text-uppercase small fw-bold mb-2">Menu Management</p>
          <h2 className="display-6 fw-bold mb-0">Order online menu items</h2>
        </div>
        <button className="btn btn-gold d-flex align-items-center gap-2" type="button" onClick={() => openForm(null)}>
          <i className="fa-solid fa-plus"></i> Add Item
        </button>
      </div>

      <div className="row g-4">
        <div className="col-xl-5">
          <form className="admin-card p-4 menu-form" onSubmit={saveItem}>
            <h3 className="h5 fw-bold mb-3">{editingItem ? 'Edit menu item' : 'Add menu item'}</h3>
            <input className="form-control" required placeholder="Item name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            <textarea className="form-control" required rows="3" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <div className="row g-2">
              <div className="col-6">
                <input className="form-control" required type="number" min="0" step="0.01" placeholder="Price" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} />
              </div>
              <div className="col-6">
                <input className="form-control" type="number" min="1" placeholder="Prep minutes" value={form.prepTime} onChange={(event) => setForm({ ...form, prepTime: event.target.value })} />
              </div>
            </div>
            <select className="form-control" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
            <input className="form-control" placeholder="Image URL" value={form.image} onChange={(event) => setForm({ ...form, image: event.target.value })} />
            <input className="form-control" type="file" accept="image/*" onChange={handleImageUpload} />
            {form.image && <img className="menu-form-preview" src={form.image} alt="Menu preview" />}
            <label>
              Spicy level
              <input className="form-range" type="range" min="0" max="3" value={form.spicyLevel} onChange={(event) => setForm({ ...form, spicyLevel: event.target.value })} />
            </label>
            <div className="admin-check-grid">
              <label><input type="checkbox" checked={form.isVegetarian} onChange={(event) => setForm({ ...form, isVegetarian: event.target.checked })} /> Vegetarian</label>
              <label><input type="checkbox" checked={form.isFeatured} onChange={(event) => setForm({ ...form, isFeatured: event.target.checked })} /> Featured</label>
              <label><input type="checkbox" checked={form.isAvailable} onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })} /> Available</label>
            </div>
            <div className="d-flex gap-2">
              <button className="btn btn-gold flex-grow-1" type="submit">{editingItem ? 'Save Changes' : 'Create Item'}</button>
              {editingItem && <button className="btn btn-outline-light" type="button" onClick={() => openForm(null)}>Cancel</button>}
            </div>
          </form>
        </div>

        <div className="col-xl-7">
          <div className="admin-card p-0 overflow-hidden">
            <table className="table table-dark table-hover mb-0 align-middle">
              <thead className="text-gold text-uppercase small">
                <tr>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Flags</th>
                  <th className="px-4 py-3 text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const id = item.id || item._id;
                  const available = item.isAvailable !== false && item.isOutOfStock !== true;
                  return (
                    <tr key={id}>
                      <td className="px-4 py-3">
                        <div className="d-flex align-items-center gap-3">
                          {item.image && <img className="menu-row-img" src={item.image} alt={item.name} />}
                          <div>
                            <div className="fw-bold">{item.name}</div>
                            <div className="small text-secondary">{Number(item.price).toFixed(2)} | {item.prepTime || 15} min</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3"><span className="badge border border-gold text-gold">{item.category}</span></td>
                      <td className="px-4 py-3">
                        <div className="d-flex flex-wrap gap-2">
                          {item.isVegetarian && <span className="badge text-bg-success">Vegetarian</span>}
                          {Number(item.spicyLevel || 0) > 0 && <span className="badge text-bg-danger">Spice {item.spicyLevel}</span>}
                          {item.isFeatured && <span className="badge text-bg-warning text-dark">Featured</span>}
                          <span className={`badge ${available ? 'text-bg-success' : 'text-bg-secondary'}`}>{available ? 'Available' : 'Hidden'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-end">
                        <div className="d-flex justify-content-end gap-2">
                          <button type="button" onClick={() => toggleAvailability(item)} className="btn btn-sm btn-outline-light">
                            <i className={available ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'}></i>
                          </button>
                          <button type="button" onClick={() => openForm(item)} className="btn btn-sm btn-outline-warning">
                            <i className="fa-solid fa-pen"></i>
                          </button>
                          <button type="button" onClick={() => deleteItem(id)} className="btn btn-sm btn-outline-danger">
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MenuManagement;
