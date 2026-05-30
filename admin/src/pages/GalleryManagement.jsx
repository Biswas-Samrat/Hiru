import { useState } from 'react';
import api from '../lib/api';
import { invalidateCache } from '../lib/adminCache';
import { useCachedQuery } from '../hooks/useCachedQuery';
import GalleryItemDialog from '../components/GalleryItemDialog';

const emptyForm = {
  image: '',
  caption: '',
  layout: 'normal',
  cloudinaryPublicId: '',
};

const itemToForm = (item) => ({
  image: item.image || '',
  caption: item.caption || '',
  layout: item.layout || 'normal',
  cloudinaryPublicId: item.cloudinaryPublicId || '',
});

const layoutLabel = (layout) => {
  if (layout === 'hero') return 'Large feature';
  if (layout === 'wide') return 'Wide';
  return 'Standard';
};

const GalleryManagement = () => {
  const { data: items, loading, setData, refresh } = useCachedQuery(
    'gallery',
    () => api.get('/api/gallery?all=true').then((res) => res.data),
    []
  );

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState('add');
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [reordering, setReordering] = useState(false);

  const list = items ?? [];

  const openAdd = () => {
    setDialogMode('add');
    setEditingItem(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (item) => {
    setDialogMode('edit');
    setEditingItem(item);
    setForm(itemToForm(item));
    setDialogOpen(true);
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
      const res = await api.post('/api/gallery/upload', body, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setForm((current) => ({
        ...current,
        image: res.data.url,
        cloudinaryPublicId: res.data.publicId || '',
      }));
    } catch (err) {
      alert(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const saveItem = async (event) => {
    event.preventDefault();
    if (!form.image) {
      alert('Please upload a photo first.');
      return;
    }
    setSaving(true);
    const payload = {
      image: form.image,
      caption: form.caption,
      layout: form.layout,
      cloudinaryPublicId: form.cloudinaryPublicId,
    };

    try {
      if (editingItem) {
        const id = editingItem.id || editingItem._id;
        const res = await api.put(`/api/gallery/${id}`, payload);
        setData((current) =>
          (current || []).map((entry) => ((entry.id || entry._id) === id ? res.data : entry))
        );
      } else {
        const res = await api.post('/api/gallery', payload);
        setData((current) => [...(current || []), res.data]);
      }
      invalidateCache('gallery');
      closeDialog();
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save gallery photo.');
    } finally {
      setSaving(false);
    }
  };

  const deleteItem = async (id) => {
    if (!window.confirm('Remove this photo from the gallery?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/api/gallery/${id}`);
      setData((current) => (current || []).filter((entry) => (entry.id || entry._id) !== id));
      invalidateCache('gallery');
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete photo.');
    } finally {
      setDeletingId(null);
    }
  };

  const toggleActive = async (item) => {
    const id = item.id || item._id;
    try {
      const res = await api.put(`/api/gallery/${id}`, { isActive: !item.isActive });
      setData((current) =>
        (current || []).map((entry) => ((entry.id || entry._id) === id ? res.data : entry))
      );
      invalidateCache('gallery');
    } catch {
      alert('Could not update visibility.');
    }
  };

  const moveItem = async (index, direction) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= list.length) return;
    const orderedIds = list.map((item) => item.id || item._id);
    const [moved] = orderedIds.splice(index, 1);
    orderedIds.splice(nextIndex, 0, moved);

    setReordering(true);
    try {
      const res = await api.put('/api/gallery/reorder', { orderedIds });
      setData(res.data);
      invalidateCache('gallery');
    } catch {
      alert('Could not reorder gallery.');
      refresh();
    } finally {
      setReordering(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Homepage</p>
          <h2 className="page-title">Gallery — {list.length} photos</h2>
          <p className="mt-1 text-sm text-muted">
            Photos shown in the &quot;A glimpse of our kitchen&quot; section on the website.
          </p>
        </div>
        <button className="btn-primary gap-2" type="button" onClick={openAdd}>
          <i className="fa-solid fa-plus" /> Add photo
        </button>
      </div>

      {loading && !list.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card h-56 animate-pulse bg-surface" />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((item, index) => {
            const id = item.id || item._id;
            const visible = item.isActive !== false;
            return (
              <article key={id} className="card overflow-hidden">
                <div className="relative aspect-[16/10] bg-surface">
                  {item.image ? (
                    <img src={item.image} alt={item.caption || 'Gallery'} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                      <i className="fa-solid fa-image text-3xl" />
                    </div>
                  )}
                  <span
                    className={`absolute right-2 top-2 rounded-full px-2 py-1 text-xs font-bold ${
                      visible ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {visible ? 'On site' : 'Hidden'}
                  </span>
                  <span className="absolute left-2 top-2 rounded-full bg-ink/70 px-2 py-1 text-xs font-bold text-white">
                    {layoutLabel(item.layout)}
                  </span>
                </div>
                <div className="p-4">
                  <p className="mb-3 line-clamp-2 text-sm font-medium text-ink">
                    {item.caption || <span className="text-muted italic">No caption</span>}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1"
                        title="Move earlier"
                        disabled={index === 0 || reordering}
                        onClick={() => moveItem(index, -1)}
                      >
                        <i className="fa-solid fa-arrow-up" />
                      </button>
                      <button
                        type="button"
                        className="btn-secondary px-2 py-1"
                        title="Move later"
                        disabled={index === list.length - 1 || reordering}
                        onClick={() => moveItem(index, 1)}
                      >
                        <i className="fa-solid fa-arrow-down" />
                      </button>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => toggleActive(item)}
                        className="btn-secondary px-2 py-1"
                        title={visible ? 'Hide from website' : 'Show on website'}
                      >
                        <i className={visible ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye'} />
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
                </div>
              </article>
            );
          })}
        </div>
      )}

      {!loading && !list.length && (
        <div className="card p-12 text-center text-muted">
          <p className="mb-4">No gallery photos yet.</p>
          <button type="button" className="btn-primary" onClick={openAdd}>
            Add your first photo
          </button>
        </div>
      )}

      <GalleryItemDialog
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

export default GalleryManagement;
