const SorryDialog = ({ open, onClose, title, message }) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sorry-dialog-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-amber-200 bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <i className="fa-solid fa-face-frown text-3xl" />
        </div>
        <h2 id="sorry-dialog-title" className="mb-3 text-xl font-bold text-amber-900">
          {title || 'Sorry'}
        </h2>
        <p className="mb-6 text-muted leading-relaxed">
          {message || 'This service is temporarily unavailable. Please try again later or contact the restaurant.'}
        </p>
        <button type="button" className="btn-primary w-full cursor-pointer" onClick={onClose}>
          OK, understood
        </button>
      </div>
    </div>
  );
};

export default SorryDialog;
