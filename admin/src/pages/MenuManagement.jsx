import { useState } from 'react';
import api from '../lib/api';
import { invalidateCache } from '../lib/adminCache';
import { useCachedQuery } from '../hooks/useCachedQuery';
import MenuItemDialog, { CATEGORIES } from '../components/MenuItemDialog';

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

const itemToForm = (item) => ({
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
});

const MenuManagement = () => {
  const { data: items, loading, setData, refresh } = useCachedQuery(
    'menu',
    () => api.get('/api/menu').then((res) => res.data),
    []
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const openAdd = () => {
    setDialogMode('add');
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = async (item) => {
    const id = item.id || item._id;
    setDialogMode('edit');
    setEditingItem(item);
    setForm(itemToForm(item));
    setDialogOpen(true);

    if (!item.image || String(item.image).startsWith('data:')) {
      try {
        const res = await api.get(`/api/menu/${id}`);
        setForm(itemToForm(res.data));
        setEditingItem(res.data);
      } catch {
        /* use list data */
      }
    }
  };

  const closeDialog = () => {
    if (saving) return;
    setDialogOpen(false);
    setEditingItem(null);
    setForm(emptyForm);
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const body = new FormData();
      body.append('image', file);
      const res = await api.post('/api/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((current) => ({ ...current, image: res.data.url }));
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const saveItem = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      price: Number(form.price),
      prepTime: Number(form.prepTime),
      spicyLevel: Number(form.spicyLevel),
      isSpicy: Number(form.spicyLevel) > 0,
      isOutOfStock: !form.isAvailable,
    };

    try {
      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        const res = await api.put(`/api/menu/${id}`, payload);
        setData((current) =>
          (current || []).map((entry) => ((entry.id || entry._id) === id ? res.data : entry))
        );
      } else {
        const res = await api.post('/api/menu', payload);
        setData((current) => [...(current || []), res.data]);
      }
      invalidateCache('menu');
      closeDialog();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save menu item.');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/menu/${id}`);
      setData((current) => (current || []).filter((entry) => (entry.id || entry._id) !== id));
      invalidateCache('menu');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete item.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (item) => {
    const id = item.id || item._id;
    const nextAvailable = !(item.isAvailable !== false && item.isOutOfStock !== true);
    try {
      const res = await api.put(`/api/menu/${id}`, { isAvailable: nextAvailable });
      setData((current) =>
        (current || []).map((entry) => ((entry.id || entry._id) === id ? res.data : entry))
      );
      invalidateCache('menu');
    } catch (err) {
      alert('Could not update availability.');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Menu</p>
          <h2 className="page-title">{(items ?? []).length} items</h2>
        </div>
        <button className="btn-primary gap-2" type="button" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Add item
        </button>
      </div>

      {loading && !(items ?? []).length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card h-64 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {(items ?? []).map((item) => {
            const id = item.id || item._id;
            const available = item.isAvailable !== false && item.isOutOfStock !== true;
            return (
              <article key={id} className="card overflow-hidden">
                <div className="relative aspect-[16/10] bg-surface">
                  {item.image && !item.image.includes('unsplash.com') ? (
                    <img src={item.image} alt={item.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-gold/60 bg-cream/30">
                      <i className="fa-solid fa-bowl-food text-4xl" />
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold ${
                      available ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {available ? 'Live' : 'Hidden'}
                  </span>
                </div>
                <div className="p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <h3 className="font-bold text-ink">{item.name}</h3>
                    <span className="shrink-0 font-bold text-gold">${Number(item.price).toFixed(2)}</span>
                  </div>
                  <p className="mb-3 line-clamp-2 text-sm text-muted">{item.description}</p>
                  <div className="mb-4 flex flex-wrap gap-1">
                    <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-xs text-gold">
                      {item.category}
                    </span>
                    {item.isVegetarian && (
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-800">Veg</span>
                    )}
                    {Number(item.spicyLevel || 0) > 0 && (
                      <span className="rounded bg-red-100 px-2 py-0.5 text-xs text-red-800">
                        Spice {item.spicyLevel}
                      </span>
                    )}
                    {item.isFeatured && (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-900">Featured</span>
                    )}
                    <span className="text-xs text-muted">{item.prepTime || 15} min prep</span>
                  </div>
                  <div className="flex justify-end gap-1 border-t border-border pt-3">
                    <button
                      type="button"
                      onClick={() => toggleAvailability(item)}
                      className="btn-secondary px-2 py-1"
                      title="Toggle availability"
                    >
                      <i className={available ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(item)}
                      className="btn-secondary px-2 py-1 text-gold"
                      title="Edit"
                    >
                      <i className="fa-solid fa-pen" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteItem(id)}
                      className="btn-secondary px-2 py-1 text-red-600"
                      title="Delete"
                      disabled={deletingId === id}
                    >
                      {deletingId === id ? (
                        <i className="fa-solid fa-spinner fa-spin" />
                      ) : (
                        <i className="fa-solid fa-trash" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && (items ?? []).length === 0 && (
        <div className="card p-12 text-center text-muted">
          <p className="mb-4">No menu items yet.</p>
          <button type="button" className="btn-primary" onClick={openAdd}>
            Add your first item
          </button>
        </div>
      )}

      <MenuItemDialog
        open={dialogOpen}
        mode={dialogMode}
        form={form}
        setForm={setForm}
        uploading={uploading}
        saving={saving}
        onClose={closeDialog}
        onSubmit={saveItem}
        onImageUpload={handleImageUpload}
      />
    </div>
  );
};

export default MenuManagement;
