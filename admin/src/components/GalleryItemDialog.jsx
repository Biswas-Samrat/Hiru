import { useEffect } from 'react';

export const LAYOUT_OPTIONS = [
  { value: 'normal', label: 'Standard tile' },
  { value: 'wide', label: 'Wide (2 columns)' },
  { value: 'hero', label: 'Large feature (2×2)' },
];

const GalleryItemDialog = ({
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
            <p className="text-xs font-bold uppercase tracking-widest text-gold">Gallery</p>
            <h3 className="text-xl font-bold text-ink">
              {mode === 'edit' ? 'Edit photo' : 'Add gallery photo'}
            </h3>
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
          <div className="overflow-hidden rounded-xl border border-border bg-surface">
            {form.image ? (
              <img src={form.image} alt="Preview" className="aspect-video w-full object-cover" />
            ) : (
              <div className="flex aspect-video items-center justify-center text-muted">
                <i className="fa-solid fa-image text-4xl" />
              </div>
            )}
          </div>
          <label className="btn-secondary inline-flex cursor-pointer gap-2">
            <i className="fa-solid fa-cloud-arrow-up" />
            {uploading ? 'Uploading…' : 'Upload photo'}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              disabled={uploading}
              onChange={onImageUpload}
            />
          </label>

          <input
            className="input-field"
            placeholder="Caption (shown on hover)"
            value={form.caption}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
          />

          <select
            className="input-field"
            value={form.layout}
            onChange={(e) => setForm({ ...form, layout: e.target.value })}
          >
            {LAYOUT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>

          <div className="flex gap-2 pt-2">
            <button type="button" className="btn-secondary flex-1" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 gap-2"
              disabled={saving || uploading || !form.image}
            >
              {saving ? <i className="fa-solid fa-spinner fa-spin" /> : null}
              {mode === 'edit' ? 'Save changes' : 'Add to gallery'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryItemDialog;
