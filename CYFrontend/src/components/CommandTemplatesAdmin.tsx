import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { fetchTemplates, createTemplate, updateTemplate, deleteTemplate } from '../redux/slices/ctfSlice';
import axiosInstance from '../api/axios';
import { Plus, Edit, Trash2, Check, AlertCircle } from 'lucide-react';

interface CommandEntry {
  name?: string;
  output?: string;
  allowedPaths?: string[];
  blockedPaths?: string[];
}

interface Template {
  id?: number;
  templateId: string;
  name: string;
  baseCommand: string;
  defaultOutput?: string;
  fields: string[];
  allowedPaths?: string[];
  blockedPaths?: string[];
  description?: string;
  commands?: Array<CommandEntry>;
}

interface AdminStatus {
  email: string;
  name: string;
  role: string;
  isAdmin: boolean;
  userId: number;
  uid: string;
}

const CommandTemplatesAdmin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const dispatch = useDispatch<AppDispatch>();
  const templates = useSelector((state: RootState) => state.ctf.templates);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<Template>({ templateId: '', name: '', baseCommand: '', defaultOutput: '', fields: [], allowedPaths: [], blockedPaths: [], description: '', commands: [] });
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string, generatedId?: string } | null>(null);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  const checkAdminStatus = useCallback(async () => {
    setCheckingStatus(true);
    try {
      const response = await axiosInstance.get('/users/me/admin-status');
      const status = response.data.data;
      setAdminStatus(status);
      
      console.log('Admin Status Check:', {
        email: status.email,
        role: status.role,
        isAdmin: status.isAdmin,
        userId: status.userId,
      });

      if (!status.isAdmin) {
        setNotification({
          type: 'error',
          message: `Your account (${status.email}) has role: "${status.role}" - you need "admin" role to create templates`
        });
      }
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      setNotification({
        type: 'error',
        message: 'Could not verify admin status - make sure you are logged in'
      });
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      await dispatch(fetchTemplates()).unwrap();
    } catch (err: any) {
      console.error('Error loading templates:', err);

      if (adminStatus?.isAdmin) {
        console.log('Admin is verified but template API failed:', {
          status: err?.response?.status,
          message: err?.response?.data?.message
        });

        setNotification({
          type: 'error',
          message: 'Template API error (session issue) - Try refreshing the page or logging out and back in'
        });
        return;
      }

      if (!adminStatus) {
        setNotification({ type: 'error', message: 'Still verifying permissions...' });
        return;
      }

      if (!adminStatus.isAdmin) {
        setNotification({
          type: 'error',
          message: `Your role is "${adminStatus.role}" but "admin" is required to view templates`
        });
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [adminStatus, dispatch]);

  useEffect(() => {
    checkAdminStatus();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (adminStatus?.isAdmin) {
      load();
    }
  }, [adminStatus, load]);

  const openCreate = () => { setEditing(null); setForm({ templateId: '', name: '', baseCommand: '', defaultOutput: '', fields: [], allowedPaths: [], blockedPaths: [], description: '', commands: [] }); setShowForm(true); };

  const openEdit = (t: any) => openEditEnhanced(t);

  // Enhanced edit to include commands
  const openEditEnhanced = (t: any) => {
    setEditing(t);
    setForm({
      templateId: t.templateId,
      name: t.name,
      baseCommand: t.baseCommand,
      defaultOutput: t.defaultOutput || '',
      fields: t.fields || [],
      allowedPaths: Array.isArray(t.allowedPaths) ? t.allowedPaths : [],
      blockedPaths: Array.isArray(t.blockedPaths) ? t.blockedPaths : [],
      description: t.description || '',
      commands: t.commands || [],
    });
    setShowForm(true);
  };

  const save = async () => {
    try {
      if (editing && editing.id) {
        await dispatch(updateTemplate({ id: editing.id, templateData: form })).unwrap();
        setNotification({ type: 'success', message: 'Template updated successfully' });
      } else {
        const createdTemplate = await dispatch(createTemplate(form)).unwrap();
        setNotification({ 
          type: 'success', 
          message: 'Template created successfully', 
          generatedId: createdTemplate?.templateId
        });
      }
      await load();
      setShowForm(false);
    } catch (err: any) {
      console.error('Error saving template', err);
      
      // Better error messaging
      let errorMessage = 'Error saving template';
      
      if (err?.response?.status === 401) {
        if (adminStatus?.isAdmin) {
          errorMessage = 'Session expired - You are verified as admin but API rejected the request. Try refreshing the page.';
        } else {
          errorMessage = 'Not authorized - Token issue. Please refresh and try again.';
        }
      } else if (err?.response?.status === 403) {
        errorMessage = `Permission denied - Your role is "${adminStatus?.role || 'unknown'}", but "admin" is required`;
      } else if (err?.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err?.message) {
        errorMessage = err.message;
      }
      
      setNotification({ type: 'error', message: errorMessage });
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Delete this template?')) return;
    try { await dispatch(deleteTemplate(id)).unwrap(); await load(); } catch (err) { console.error(err); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-red-900/40 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-white">Command Templates</h3>
          <div className="flex items-center gap-2">
            <button onClick={openCreate} className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-2"><Plus size={16}/> New</button>
            <button onClick={onClose} className="px-3 py-1 bg-zinc-700 text-white rounded">Close</button>
          </div>
        </div>

        {/* Success Notification */}
        {notification && notification.type === 'success' && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-600/50 rounded flex items-start gap-2">
            <Check size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-green-400 text-sm font-medium">{notification.message}</p>
              {notification.generatedId && (
                <p className="text-green-300 text-xs mt-1">Template ID: <span className="font-mono font-bold">{notification.generatedId}</span></p>
              )}
            </div>
          </div>
        )}

        {/* Error Notification */}
        {notification && notification.type === 'error' && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-600/50 rounded flex items-start gap-2">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-red-400 text-sm font-medium">{notification.message}</p>
              {notification.message.includes('session issue') && (
                <div className="text-red-300 text-xs mt-2 space-y-1">
                  <p>💡 Even though you're verified as admin, the API needs a fresh session.</p>
                  <p>Try one of these:</p>
                  <ul className="ml-4 list-disc">
                    <li>Refresh the page (F5)</li>
                    <li>Close and reopen the admin panel</li>
                    <li>Log out from Profile → click Logout, then log back in</li>
                  </ul>
                </div>
              )}
              {notification.message.includes('authorized') && (
                <p className="text-red-300 text-xs mt-2">
                  💡 Make sure you're logged in to the application with an admin account. Close and reopen the admin panel after logging in.
                </p>
              )}
              {notification.message.includes('Permission denied') && (
                <p className="text-red-300 text-xs mt-2">
                  💡 Your account doesn't have admin privileges. Contact your system administrator to grant admin access.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Admin Status Check - Show while checking */}
        {checkingStatus && (
          <div className="mb-4 p-3 bg-blue-900/20 border border-blue-600/50 rounded flex items-center gap-2">
            <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full" />
            <p className="text-blue-300 text-sm">Verifying admin permissions...</p>
          </div>
        )}

        {/* Admin Status Confirmed - Show when verification succeeds and user IS admin */}
        {!checkingStatus && adminStatus?.isAdmin && (
          <div className="mb-4 p-3 bg-green-900/20 border border-green-600/50 rounded flex items-center gap-2">
            <Check size={16} className="text-green-400" />
            <p className="text-green-300 text-xs">✓ Admin verified: <span className="font-mono">{adminStatus.email}</span></p>
          </div>
        )}

        {loading ? <div className="text-white">Loading templates...</div> : (
          <div className="space-y-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-300">
                  <th className="px-2">Template ID</th>
                  <th className="px-2">Name</th>
                  <th className="px-2">Base Command</th>
                  <th className="px-2">Fields</th>
                  <th className="px-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.id} className="border-t border-zinc-800">
                    <td className="px-2 py-2 text-white">{t.templateId}</td>
                    <td className="px-2 py-2 text-white">{t.name}</td>
                    <td className="px-2 py-2 text-white">{t.baseCommand}</td>
                    <td className="px-2 py-2 text-gray-300">{(t.fields || []).join(', ')}</td>
                    <td className="px-2 py-2">
                      <div className="flex gap-2">
                        <button onClick={() => openEditEnhanced(t)} className="text-blue-400"><Edit size={16}/></button>
                        <button onClick={() => remove(t.id)} className="text-red-400"><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {showForm && (
              <div className="bg-zinc-800 p-4 rounded">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* Template ID - Only shown when editing (read-only) */}
                  {editing && (
                    <div>
                      <label className="text-sm text-gray-300">Template ID (Auto-generated)</label>
                      <input 
                        value={form.templateId} 
                        readOnly 
                        className="w-full px-2 py-2 bg-zinc-800 text-gray-400 rounded border border-zinc-700 cursor-not-allowed" 
                        title="Template ID is automatically generated and cannot be changed"
                      />
                    </div>
                  )}
                  {/* When creating new template, show helper text instead */}
                  {!editing && (
                    <div>
                      <label className="text-sm text-gray-300">Template ID</label>
                      <div className="w-full px-2 py-2 bg-zinc-800 rounded border border-green-600/30 text-green-300 text-xs flex items-center">
                        ✓ Will be auto-generated
                      </div>
                    </div>
                  )}
                  <div>
                    <label className="text-sm text-gray-300">Name</label>
                    <input value={form.name} onChange={(e)=>setForm({...form, name: e.target.value})} className="w-full px-2 py-2 bg-zinc-900 text-white rounded" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Base Command</label>
                    <input value={form.baseCommand} onChange={(e)=>setForm({...form, baseCommand: e.target.value})} className="w-full px-2 py-2 bg-zinc-900 text-white rounded" />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300">Default Output</label>
                    <input value={form.defaultOutput} onChange={(e)=>setForm({...form, defaultOutput: e.target.value})} className="w-full px-2 py-2 bg-zinc-900 text-white rounded" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="text-sm text-gray-300">Commands</label>
                  <div className="space-y-2 mt-2">
                    {(form.commands || []).map((c, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input className="col-span-3 px-2 py-2 bg-zinc-900 text-white rounded" placeholder="command (eg. ls)" value={c.name || ''} onChange={(e)=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds[idx] = { ...cmds[idx], name: e.target.value }; setForm({ ...form, commands: cmds });
                        }} />
                        <input className="col-span-3 px-2 py-2 bg-zinc-900 text-white rounded" placeholder="output" value={c.output || ''} onChange={(e)=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds[idx] = { ...cmds[idx], output: e.target.value }; setForm({ ...form, commands: cmds });
                        }} />
                        <input className="col-span-3 px-2 py-2 bg-zinc-900 text-white rounded" placeholder="Allowed paths (comma separated)" value={(c.allowedPaths || []).join(', ')} onChange={(e)=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds[idx] = { ...cmds[idx], allowedPaths: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean) }; setForm({ ...form, commands: cmds });
                        }} />
                        <input className="col-span-2 px-2 py-2 bg-zinc-900 text-white rounded" placeholder="Blocked paths" value={(c.blockedPaths || []).join(', ')} onChange={(e)=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds[idx] = { ...cmds[idx], blockedPaths: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean) }; setForm({ ...form, commands: cmds });
                        }} />
                        <button className="col-span-1 text-red-400" onClick={()=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds.splice(idx,1); setForm({ ...form, commands: cmds });
                        }}>Remove</button>
                      </div>
                    ))}
                    <div>
                      <button className="px-2 py-1 bg-zinc-700 text-white rounded" onClick={()=>{
                        const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds.push({ name: '', output: '', allowedPaths: [], blockedPaths: [] }); setForm({ ...form, commands: cmds });
                      }}>Add command</button>
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm text-gray-300">Fields (comma separated)</label>
                  <input value={(form.fields||[]).join(', ')} onChange={(e)=>setForm({...form, fields: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} className="w-full px-2 py-2 bg-zinc-900 text-white rounded" />
                </div>
                <div className="mt-3">
                  <label className="text-sm text-gray-300">Description</label>
                  <textarea value={form.description} onChange={(e)=>setForm({...form, description: e.target.value})} className="w-full px-2 py-2 bg-zinc-900 text-white rounded" />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button onClick={()=>setShowForm(false)} className="px-3 py-1 bg-zinc-700 text-white rounded">Cancel</button>
                  <button onClick={save} className="px-3 py-1 bg-red-600 text-white rounded">{editing ? 'Save' : 'Create'}</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CommandTemplatesAdmin;
