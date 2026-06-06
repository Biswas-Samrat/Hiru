/**
 * ConfirmDialog — modal confirmation box used throughout admin panel.
 * Props:
 *   open       {boolean}   - whether dialog is visible
 *   title      {string}    - heading text
 *   message    {string}    - body text
 *   confirmLabel {string}  - confirm button text (default 'Yes, proceed')
 *   danger     {boolean}   - red confirm button (default true)
 *   onConfirm  {function}  - called when user clicks confirm
 *   onCancel   {function}  - called when user clicks cancel / backdrop
 */
const ConfirmDialog = ({
  open,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Yes, proceed',
  danger = true,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <button
        type="button"
        className="absolute inset-0 bg-ink/40 backdrop-blur-sm"
        aria-label="Close dialog"
        onClick={onCancel}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-border bg-white p-6 shadow-2xl">
        {/* Icon */}
        <div
          className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full ${
            danger ? 'bg-red-100' : 'bg-gold/10'
          }`}
        >
          <i
            className={`fa-solid text-2xl ${
              danger ? 'fa-triangle-exclamation text-red-600' : 'fa-circle-question text-gold'
            }`}
          />
        </div>

        <h3 className="mb-2 text-center text-lg font-bold text-ink">{title}</h3>
        {message && (
          <p className="mb-6 text-center text-sm text-muted">{message}</p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary flex-1"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-bold text-white transition ${
              danger
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-gold hover:bg-gold-hover'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
