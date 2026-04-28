import React, { useEffect, useState } from 'react';
import { ctfService } from '../api/ctfService';
import { Plus, Edit, Trash2 } from 'lucide-react';

interface Template {
  id?: number;
  templateId: string;
  name: string;
  baseCommand: string;
  defaultOutput?: string;
  fields: string[];
  description?: string;
  commands?: Array<{ name?: string; output?: string }>;
}

const CommandTemplatesAdmin: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Template | null>(null);
  const [form, setForm] = useState<Template>({ templateId: '', name: '', baseCommand: '', defaultOutput: '', fields: [], description: '', commands: [] });

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await ctfService.getTemplates();
      setTemplates(data || []);
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const openCreate = () => { setEditing(null); setForm({ templateId: '', name: '', baseCommand: '', defaultOutput: '', fields: [], description: '', commands: [] }); setShowForm(true); };

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
      description: t.description || '',
      commands: t.commands || [],
    });
    setShowForm(true);
  };

  const save = async () => {
    try {
      if (editing && editing.id) {
        await ctfService.updateTemplate(editing.id, form);
      } else {
        await ctfService.createTemplate(form);
      }
      await load();
      setShowForm(false);
    } catch (err) {
      console.error('Error saving template', err);
      alert('Error saving template');
    }
  };

  const remove = async (id?: number) => {
    if (!id) return;
    if (!confirm('Delete this template?')) return;
    try { await ctfService.deleteTemplate(id); await load(); } catch (err) { console.error(err); }
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

        {loading ? <div className="text-white">Loading...</div> : (
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
                  <div>
                    <label className="text-sm text-gray-300">Template ID</label>
                    <input value={form.templateId} onChange={(e)=>setForm({...form, templateId: e.target.value})} className="w-full px-2 py-2 bg-zinc-900 text-white rounded" />
                  </div>
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
                        <input className="col-span-4 px-2 py-2 bg-zinc-900 text-white rounded" placeholder="command (eg. ls)" value={c.name || ''} onChange={(e)=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds[idx] = { ...cmds[idx], name: e.target.value }; setForm({ ...form, commands: cmds });
                        }} />
                        <input className="col-span-7 px-2 py-2 bg-zinc-900 text-white rounded" placeholder="output" value={c.output || ''} onChange={(e)=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds[idx] = { ...cmds[idx], output: e.target.value }; setForm({ ...form, commands: cmds });
                        }} />
                        <button className="col-span-1 text-red-400" onClick={()=>{
                          const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds.splice(idx,1); setForm({ ...form, commands: cmds });
                        }}>Remove</button>
                      </div>
                    ))}
                    <div>
                      <button className="px-2 py-1 bg-zinc-700 text-white rounded" onClick={()=>{
                        const cmds = JSON.parse(JSON.stringify(form.commands || [])); cmds.push({ name: '', output: '' }); setForm({ ...form, commands: cmds });
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
