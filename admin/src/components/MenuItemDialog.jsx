import { useEffect } from 'react';

const CATEGORIES = ['Kottu', 'Rice', 'Burgers', 'Fusion'];

const MenuItemDialog = ({
  open,
  mode,
  form,
  setForm,
  uploading,
  saving,
  onClose,
  onSubmit,
  onImageUpload,
}) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-gold">Menu</p>
            <h3 className="text-xl font-bold text-ink">{mode === 'edit' ? 'Edit item' : 'Add new item'}</h3>
          </div>
          <button
            type="button"
            className="btn-secondary h-9 w-9 shrink-0 p-0"
            aria-label="Close"
            onClick={onClose}
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        <form className="space-y-3" onSubmit={onSubmit}>
          <input
            className="input-field"
            required
            placeholder="Item name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <textarea
            className="input-field"
            required
            rows="3"
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              className="input-field"
              required
              type="number"
              min="0"
              step="0.01"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
            <input
              className="input-field"
              type="number"
              min="1"
              placeholder="Prep mins"
              value={form.prepTime}
              onChange={(e) => setForm({ ...form, prepTime: e.target.value })}
            />
          </div>
          <select
            className="input-field"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>

          <div>
            <label className="mb-2 block text-sm font-semibold text-ink">Menu photo</label>
            <input
              className="input-field"
              type="file"
              accept="image/*"
              onChange={onImageUpload}
              disabled={uploading}
            />
            {uploading && (
              <p className="mt-1 text-sm text-gold">
                <i className="fa-solid fa-spinner fa-spin me-1" />
                Uploading...
              </p>
            )}
            {form.image && (
              <img className="mt-3 aspect-video w-full rounded-lg object-cover" src={form.image} alt="Preview" />
            )}
          </div>

          <label className="block text-sm font-semibold text-ink">
            Spicy level
            <input
              className="mt-2 w-full accent-gold"
              type="range"
              min="0"
              max="3"
              value={form.spicyLevel}
              onChange={(e) => setForm({ ...form, spicyLevel: e.target.value })}
            />
          </label>

          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ['isVegetarian', 'Vegetarian'],
              ['isFeatured', 'Featured'],
              ['isAvailable', 'Available'],
            ].map(([key, label]) => (
              <label key={key} className="flex cursor-pointer items-center gap-2 rounded-lg border border-border p-3 text-sm">
                <input
                  type="checkbox"
                  checked={form[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <button className="btn-primary flex-grow" type="submit" disabled={saving || uploading}>
              {saving ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin me-2" />
                  Saving...
                </>
              ) : mode === 'edit' ? (
                'Save changes'
              ) : (
                'Create item'
              )}
            </button>
            <button className="btn-secondary" type="button" onClick={onClose} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { CATEGORIES };
export default MenuItemDialog;
