import { useCallback, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { AxiosError } from 'axios';
import api from '@/api/axios';
import { selectUser } from '@/redux/slices/userSlice';
import { UserPlus, AlertCircle, CheckCircle, Loader } from 'lucide-react';

interface User {
  _id: string;
  email: string;
  name?: string;
  role: string;
}

type MessageType = { type: 'success' | 'error' | 'info'; text: string } | null;

// Allow overriding the super-admin via env (Vite): `VITE_SUPER_ADMIN_EMAIL`
const SUPER_ADMIN_EMAIL = (import.meta as any).env?.VITE_SUPER_ADMIN_EMAIL || 'yemad7676@gmail.com';

const GrantAdminSection: React.FC = () => {
  const user = useSelector(selectUser);
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState<MessageType>(null);

  // Only show this section to the configured super admin
  if (user?.email !== SUPER_ADMIN_EMAIL) return null;

  const extractErrorMessage = (err: unknown, fallback = 'Something went wrong') => {
    if (!err) return fallback;
    if ((err as AxiosError).isAxiosError) {
      const axiosErr = err as AxiosError<any>;
      return axiosErr.response?.data?.message || axiosErr.message || fallback;
    }
    return (err as Error).message || fallback;
  };

  const fetchUsers = useCallback(async () => {
    setFetchingUsers(true);
    try {
      const { data } = await api.get('/admin/users');
      if (data?.success) {
        setUsers(data.data || []);
        setMessage({ type: 'info', text: 'Users loaded' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to load users') });
    } finally {
      setFetchingUsers(false);
    }
  }, []);

  const handleGrantAdmin = useCallback(async (userEmail: string) => {
    setActionLoading(true);
    try {
      const { data } = await api.post('/admin/users/grant-admin', { email: userEmail });
      if (data?.success) {
        setMessage({ type: 'success', text: data.message || 'Admin granted' });
        setEmail('');
        await fetchUsers();
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to grant admin' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to grant admin') });
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers]);

  const handleRevokeAdmin = useCallback(async (userEmail: string) => {
    const confirmed = window.confirm(`Revoke admin access from ${userEmail}?`);
    if (!confirmed) return;
    setActionLoading(true);
    try {
      const { data } = await api.post('/admin/users/revoke-admin', { email: userEmail });
      if (data?.success) {
        setMessage({ type: 'success', text: data.message || 'Admin revoked' });
        await fetchUsers();
      } else {
        setMessage({ type: 'error', text: data?.message || 'Failed to revoke admin' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: extractErrorMessage(err, 'Failed to revoke admin') });
    } finally {
      setActionLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 5000);
    return () => clearTimeout(t);
  }, [message]);

  const handleGrantByEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setMessage({ type: 'error', text: 'Please enter an email address' });
      return;
    }
    if (email.trim() === SUPER_ADMIN_EMAIL) {
      setMessage({ type: 'info', text: 'That user already has the highest privileges' });
      return;
    }
    await handleGrantAdmin(email.trim());
  };

  const isBusy = fetchingUsers || actionLoading;

  return (
    <div className="bg-black border border-red-900/40 rounded-xl p-6 mb-8 shadow-2xl shadow-red-900/5">
      <div className="flex items-center gap-2 mb-6">
        <UserPlus className="text-red-500" size={24} />
        <h2 className="text-2xl font-bold text-white tracking-tight">Users & Admin Management</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg mb-6 flex items-start gap-3 ${
          message.type === 'success' ? 'bg-green-900/20 border border-green-600/40' :
          message.type === 'error' ? 'bg-red-900/20 border border-red-600/40' :
          'bg-red-900/20 border border-red-600/40'
        }`} role="status" aria-live="polite">
          {message.type === 'success' ? (
            <CheckCircle className="text-green-500 mt-1" size={20} />
          ) : (
            <AlertCircle className={message.type === 'error' ? 'text-red-500' : 'text-blue-500'} size={20} />
          )}
          <p className={
            message.type === 'success' ? 'text-green-300' :
            message.type === 'error' ? 'text-red-300' :
            'text-blue-300'
          }>{message.text}</p>
        </div>
      )}

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-red-400 mb-4 uppercase tracking-wider">Grant Admin Access</h3>
        <form onSubmit={handleGrantByEmail} className="flex gap-3" aria-label="Grant admin form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter user email"
            className="flex-1 bg-black border border-red-900/40 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500/30 transition-colors"
            disabled={isBusy}
            aria-label="User email"
          />
          <button
            type="submit"
            disabled={isBusy}
            className="bg-red-600 hover:bg-red-700 disabled:bg-red-900/10 disabled:text-gray-500 text-white font-semibold px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            aria-disabled={isBusy}
          >
            {(isBusy && actionLoading) && <Loader size={16} className="animate-spin" />}
            Grant Admin
          </button>
        </form>
      </div>

      <div className="mb-6">
        <button
          onClick={fetchUsers}
          disabled={fetchingUsers}
          className="bg-red-900/30 hover:bg-red-900/50 disabled:bg-red-900/10 text-red-400 hover:text-red-300 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 mb-4 border border-red-900/40"
        >
          {fetchingUsers && <Loader size={16} className="animate-spin" />}
          Refresh Users
        </button>
      </div>

      {users.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-red-400 mb-4 uppercase tracking-wider">Users ({users.length})</h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-black border border-red-900/40 rounded-lg p-4 flex items-center justify-between hover:bg-red-900/10 hover:border-red-900/60 transition-colors"
              >
                <div>
                  <p className="text-white font-medium">{u.name || u.email}</p>
                  <p className="text-gray-400 text-sm">{u.email}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                    u.role === 'admin'
                      ? 'bg-red-900/40 text-red-300 border border-red-900/60'
                      : 'bg-black border-red-900/40 text-gray-400 border'
                  }`}>
                    {u.role === 'admin' ? '🔒 Admin' : 'User'}
                  </span>
                </div>
                <button
                  onClick={() => u.role === 'admin'
                    ? handleRevokeAdmin(u.email)
                    : handleGrantAdmin(u.email)
                  }
                  disabled={isBusy || u.email === SUPER_ADMIN_EMAIL}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors border ${
                    u.role === 'admin'
                      ? 'bg-red-900/30 border-red-900/60 hover:bg-red-900/50 text-red-400 hover:text-red-300 disabled:bg-red-900/10 disabled:border-red-900/40 disabled:text-gray-500'
                      : 'bg-green-900/30 border-green-900/60 hover:bg-green-900/50 text-green-400 hover:text-green-300 disabled:bg-red-900/10 disabled:border-red-900/40 disabled:text-gray-500'
                  }`}
                  aria-disabled={isBusy || u.email === SUPER_ADMIN_EMAIL}
                >
                  {u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default GrantAdminSection;
