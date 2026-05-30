import { useState } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { email, updateSession } = useAuth();
  const [form, setForm] = useState({
    currentPassword: '',
    newEmail: email || '',
    newPassword: '',
    confirmPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.put('/api/auth/credentials', {
        currentPassword: form.currentPassword,
        newEmail: form.newEmail !== email ? form.newEmail : undefined,
        newPassword: form.newPassword || undefined,
      });
      updateSession(res.data.token, res.data.email);
      setMessage(res.data.message || 'Credentials updated.');
      setForm({
        currentPassword: '',
        newEmail: res.data.email,
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <p className="eyebrow">Account</p>
          <h2 className="page-title">Login settings</h2>
        </div>
      </div>

      <div className="max-w-xl">
        <form className="card space-y-4 p-6" onSubmit={handleSubmit}>
          <p className="text-sm text-muted">
            Signed in as <strong className="text-ink">{email}</strong>. Enter your current password to change email or password.
          </p>

          <label className="block text-sm font-semibold text-ink">
            Current password
            <input
              className="input-field mt-1"
              type="password"
              required
              value={form.currentPassword}
              onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
            />
          </label>

          <label className="block text-sm font-semibold text-ink">
            New email
            <input
              className="input-field mt-1"
              type="email"
              value={form.newEmail}
              onChange={(e) => setForm({ ...form, newEmail: e.target.value })}
            />
          </label>

          <label className="block text-sm font-semibold text-ink">
            New password
            <input
              className="input-field mt-1"
              type="password"
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              placeholder="Leave blank to keep current"
            />
          </label>

          <label className="block text-sm font-semibold text-ink">
            Confirm new password
            <input
              className="input-field mt-1"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
          </label>

          {message && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
              {message}
            </div>
          )}
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Settings;
