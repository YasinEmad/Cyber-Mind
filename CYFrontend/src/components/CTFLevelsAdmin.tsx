import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import {
  fetchAllCTFLevels,
  fetchTemplates,
  createCTFLevel,
  updateCTFLevel,
  deleteCTFLevel,
  toggleCTFLevelStatus,
} from '../redux/slices/ctfSlice';
import { clearChallengeCache } from '../pages/ctfChallenges';
import { Plus, Edit, Trash2, Eye, EyeOff, Search } from 'lucide-react';
import CommandTemplatesAdmin from './CommandTemplatesAdmin';

interface CTFLevel {
  id: number;
  level: number;
  title: string;
  description: string;
  hints: string[];
  flag: string;
  difficulty: 'easy' | 'medium' | 'hard';
  isActive: boolean;
  commands: Array<{
    name: string;
    output: string;
    description: string;
  }>;
  customCommands?: Array<{
    name: string;
    output: string;
    description: string;
  }>;
  commandTemplates?: Array<{ templateId: string; values: any }>;
  requiredCommandSequence?: string[];
  successCondition?: string;
  initialDirectory?: string;
  createdAt: string;
  updatedAt: string;
}

interface Command {
  name: string;
  output: string;
  description: string;
  allowedPaths?: string[];
  blockedPaths?: string[];
}

interface TemplateCommand extends Command {
  sourceTemplateId?: string;
  sourceCommandIndex?: number;
}

const CTFLevelsAdmin: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const levels = useSelector((state: RootState) => state.ctf.adminLevels);
  const templates = useSelector((state: RootState) => state.ctf.templates);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CTFLevel | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [debugDumpOpen, setDebugDumpOpen] = useState(false);
  const [debugJson, setDebugJson] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [templateCommands, setTemplateCommands] = useState<TemplateCommand[]>([]);
  const [formData, setFormData] = useState({
    level: '',
    title: '',
    description: '',
    hints: [] as string[],
    flag: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    isActive: true,
    commands: [] as Command[],
    customCommands: [] as Command[],
    commandTemplates: [] as Array<{ templateId: string; values: any }>,
    requiredCommandSequence: [] as string[],
    successCondition: '',
    initialDirectory: '/home/user',
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await dispatch(fetchAllCTFLevels()).unwrap();
        await dispatch(fetchTemplates()).unwrap();
      } catch (error) {
        console.error('Error loading CTF admin data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [dispatch]);

  const loadLevels = async () => {
    setLoading(true);
    try {
      await dispatch(fetchAllCTFLevels()).unwrap();
    } catch (error) {
      console.error('Error loading CTF levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent multiple submissions
    setSubmitting(true);
    console.debug('Submitting CTF level, formData:', formData);
    // Client-side validation to avoid server 400
    if ((!formData.commands || formData.commands.length === 0) && (!formData.commandTemplates || formData.commandTemplates.length === 0) && (!formData.customCommands || formData.customCommands.length === 0)) {
      alert('Please add at least one command or add from a template or add custom commands before saving the level.');
      setSubmitting(false);
      return;
    }
    try {
      if (editingLevel) {
        await dispatch(updateCTFLevel({ id: editingLevel.id, levelData: formData })).unwrap();
      } else {
        await dispatch(createCTFLevel(formData)).unwrap();
      }
      // Clear frontend challenge cache and notify other pages to reload
      clearChallengeCache();
      window.dispatchEvent(new Event('ctf:updated'));
      await loadLevels();
      resetForm();
    } catch (error) {
      console.error('Error saving CTF level:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (level: CTFLevel) => {
    const parsedCommandTemplates = Array.isArray(level.commandTemplates) ? level.commandTemplates : [];
    setEditingLevel(level);
    setFormData({
      level: level.level.toString(),
      title: level.title,
      description: level.description,
      hints: level.hints || [],
      flag: level.flag,
      difficulty: level.difficulty,
      isActive: level.isActive,
      commands: [], // Will be loaded from templates
      customCommands: level.customCommands || [],
      commandTemplates: parsedCommandTemplates,
      requiredCommandSequence: level.requiredCommandSequence || [],
      successCondition: level.successCondition || '',
      initialDirectory: level.initialDirectory || '/home/user',
    });
    loadTemplateCommands(parsedCommandTemplates);
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this CTF level?')) {
      try {
        await dispatch(deleteCTFLevel(id)).unwrap();
        clearChallengeCache();
        window.dispatchEvent(new Event('ctf:updated'));
        await loadLevels();
      } catch (error) {
        console.error('Error deleting CTF level:', error);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await dispatch(toggleCTFLevelStatus(id)).unwrap();
      clearChallengeCache();
      window.dispatchEvent(new Event('ctf:updated'));
      await loadLevels();
    } catch (error) {
      console.error('Error toggling CTF level status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      level: '',
      title: '',
      description: '',
      hints: [],
      flag: '',
      difficulty: 'easy',
      isActive: true,
      commands: [],
      customCommands: [],
      commandTemplates: [],
      requiredCommandSequence: [],
      successCondition: '',
      initialDirectory: '/home/user',
    });
    setEditingLevel(null);
    setShowForm(false);
  };

  const addHint = () => {
    setFormData({
      ...formData,
      hints: [...formData.hints, ''],
    });
  };

  const updateHint = (index: number, value: string) => {
    const updatedHints = [...formData.hints];
    updatedHints[index] = value;
    setFormData({ ...formData, hints: updatedHints });
  };

  const removeHint = (index: number) => {
    const updatedHints = formData.hints.filter((_, i) => i !== index);
    setFormData({ ...formData, hints: updatedHints });
  };

  const addCommand = () => {
    setFormData({
      ...formData,
      commands: [...formData.commands, { name: '', output: '', description: '', allowedPaths: [], blockedPaths: [] } as Command],
    });
  };

  const updateTemplateCommand = (index: number, field: keyof Command, value: any) => {
    setTemplateCommands((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      setFormData((prevFormData) => {
        const nextTemplates = prevFormData.commandTemplates.map((ct) => {
          const templateId = String(ct.templateId);
          const commandsForTemplate = updated
            .filter((cmd) => String(cmd.sourceTemplateId) === templateId)
            .sort((a, b) => (a.sourceCommandIndex ?? 0) - (b.sourceCommandIndex ?? 0))
            .map((cmd) => ({
              name: cmd.name,
              output: cmd.output,
              description: cmd.description,
              allowedPaths: cmd.allowedPaths || [],
              blockedPaths: cmd.blockedPaths || [],
            }));

          return {
            ...ct,
            values: {
              ...ct.values,
              commands: commandsForTemplate,
            },
          };
        });
        return {
          ...prevFormData,
          commandTemplates: nextTemplates,
        };
      });

      return updated;
    });
  };

  const addCommandFromTemplate = (templateId: string) => {
    try {
      const tmpl = templates.find((t: any) => String(t.templateId) === String(templateId) || String(t.id) === String(templateId));
      if (!tmpl) throw new Error('Template not found');
      // Build a normalized values object that always contains a `commands` array
      const values: any = {
        name: tmpl?.baseCommand || tmpl?.name || '',
        output: tmpl?.defaultOutput || '',
        allowedPaths: [],
        blockedPaths: [],
        commands: [],
      };

      if (Array.isArray(tmpl.commands) && tmpl.commands.length > 0) {
        // Normalize each command entry to { name, output, description, allowedPaths, blockedPaths }
        values.commands = tmpl.commands.map((c: any) => ({
          name: c.name || c.baseCommand || tmpl.baseCommand || tmpl.name,
          output: c.output !== undefined ? c.output : (c.defaultOutput || tmpl.defaultOutput || ''),
          description: c.description || '',
          allowedPaths: Array.isArray(c.allowedPaths) ? c.allowedPaths : [],
          blockedPaths: Array.isArray(c.blockedPaths) ? c.blockedPaths : [],
        }));
      } else {
        // Fallback: create a single command from the template baseCommand/defaultOutput
        values.commands = [{ name: values.name, output: values.output, description: '' }];
      }
      console.debug('Adding command from template:', templateId, values);
      const sourceTemplateId = tmpl.templateId ?? String(tmpl.id);
      setFormData((prev) => ({
        ...prev,
        commandTemplates: [...(prev.commandTemplates || []), { templateId: sourceTemplateId, values }],
      }));
      // clear selection so user sees action taken
      setSelectedTemplateId('');
      // show transient action message
      setActionMessage(`Added ${Array.isArray(values.commands) && values.commands.length > 0 ? values.commands.length : 1} command(s) from template "${tmpl.name}"`);
      setTimeout(() => setActionMessage(null), 3000);

      // Also expand locally into editable template command entries
      if (Array.isArray(values.commands) && values.commands.length > 0) {
        const expanded: TemplateCommand[] = values.commands.map((c: any, idx: number) => ({
          name: c.name,
          output: c.output,
          description: c.description || '',
          allowedPaths: Array.isArray(c.allowedPaths) ? c.allowedPaths : [],
          blockedPaths: Array.isArray(c.blockedPaths) ? c.blockedPaths : [],
          sourceTemplateId,
          sourceCommandIndex: idx,
        }));
        setTemplateCommands((prev) => [...prev, ...expanded]);
      }
    } catch (err: any) {
      console.error('addCommandFromTemplate failed:', err, { templateId });
      alert('Failed to add template: ' + (err?.message || String(err)));
    }
  };

  const handleAddButton = () => {
    // immediate feedback so users without DevTools see the click
    if (!selectedTemplateId) {
      setActionMessage('Adding blank command');
      setTimeout(() => setActionMessage(null), 2000);
      return addCommand();
    }
    setActionMessage(`Adding from template: ${selectedTemplateId}`);
    setTimeout(() => setActionMessage(null), 2000);
    addCommandFromTemplate(selectedTemplateId);
  };

  useEffect(() => {
    // Log when commandTemplates array changes for easier debugging
    console.debug('commandTemplates changed, count=', (formData.commandTemplates || []).length, formData.commandTemplates);
  }, [formData.commandTemplates]);

  const addCustomCommand = () => {
    setFormData({
      ...formData,
      customCommands: [...formData.customCommands, { name: '', output: '', description: '', allowedPaths: [], blockedPaths: [] } as Command],
    });
  };

  const updateCustomCommand = (index: number, field: keyof Command, value: any) => {
    const updatedCommands = [...formData.customCommands];
    updatedCommands[index] = { ...updatedCommands[index], [field]: value } as Command;
    setFormData({ ...formData, customCommands: updatedCommands });
  };

  const removeCustomCommand = (index: number) => {
    setFormData({
      ...formData,
      customCommands: formData.customCommands.filter((_, i) => i !== index),
    });
  };

  const loadTemplateCommands = async (commandTemplates: Array<{ templateId: string; values: any }>) => {
    if (commandTemplates.length === 0) {
      setTemplateCommands([]);
      return;
    }
    try {
      // For simplicity, assume we can expand locally if templates are loaded
      let expanded: Command[] = [];
      for (const ct of commandTemplates) {
        const tmpl = templates.find(t => String(t.templateId) === String(ct.templateId) || String(t.id) === String(ct.templateId));
        if (tmpl && Array.isArray(tmpl.commands)) {
          const cmds = tmpl.commands.map((c: any, idx: number) => ({
            name: c.name || tmpl.baseCommand,
            output: c.output || tmpl.defaultOutput || '',
            description: c.description || '',
            allowedPaths: c.allowedPaths || [],
            blockedPaths: c.blockedPaths || [],
            sourceTemplateId: String(ct.templateId),
            sourceCommandIndex: idx,
          }));
          expanded = [...expanded, ...cmds];
        }
      }
      setTemplateCommands(expanded);
    } catch (error) {
      console.error('Error loading template commands:', error);
      setTemplateCommands([]);
    }
  };

  const filteredLevels = levels.filter(level =>
    level.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    level.level.toString().includes(searchTerm)
  );

  if (loading) {
    return <div className="text-center py-8">Loading CTF levels...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Linux CTF Levels Management</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} />
          Add New Level
        </button>
        <button onClick={() => setShowTemplates(true)} className="ml-2 bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-2 rounded-lg">Manage Templates</button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search by level number or title..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-red-500"
        />
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-red-900/40 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              {editingLevel ? 'Edit CTF Level' : 'Create New CTF Level'}
            </h3>

            {actionMessage && (
              <div className="mb-3 p-2 bg-green-900/20 border border-green-600/40 rounded text-sm text-green-200">{actionMessage}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Level Number</label>
                  <input
                    type="number"
                    value={formData.level}
                    onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Title</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as 'easy' | 'medium' | 'hard' })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Initial Directory</label>
                  <input
                    type="text"
                    value={formData.initialDirectory}
                    onChange={(e) => setFormData({ ...formData, initialDirectory: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                  rows={3}
                  required
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Hints</label>
                  <button
                    type="button"
                    onClick={addHint}
                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                  >
                    Add Hint
                  </button>
                </div>
                {formData.hints.map((hint, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <textarea
                      value={hint}
                      onChange={(e) => updateHint(index, e.target.value)}
                      placeholder={`Hint ${index + 1}`}
                      className="flex-1 px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                      rows={2}
                    />
                    <button
                      type="button"
                      onClick={() => removeHint(index)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Flag</label>
                <input
                  type="text"
                  value={formData.flag}
                  onChange={(e) => setFormData({ ...formData, flag: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                  required
                />
              </div>

              {/* Commands Section */}
              <div>

                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Template Commands (from selected templates)</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="px-2 py-1 bg-zinc-800 border border-red-900/40 rounded-lg text-white"
                    >
                      <option value="">Select template</option>
                      {templates.map((t) => (
                        <option key={t.templateId ?? t.id} value={String(t.templateId ?? t.id)}>{t.name}</option>
                      ))}
                    </select>
                    {/* Show count of commands in selected template for clarity */}
                    {selectedTemplateId && (() => {
                      const sel = templates.find(t => String(t.templateId) === String(selectedTemplateId) || String(t.id) === String(selectedTemplateId));
                      const cnt = sel && Array.isArray(sel.commands) ? sel.commands.length : 0;
                      return (
                        <div className="ml-2 px-2 py-1 bg-zinc-700 text-xs text-gray-200 rounded">
                          {cnt} command{cnt !== 1 ? 's' : ''}
                        </div>
                      );
                    })()}
                    <button
                      type="button"
                      onClick={handleAddButton}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add From Template
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {templateCommands.map((command, index) => (
                    <div key={`tmpl-cmd-${index}`} className="grid grid-cols-12 gap-2 items-end bg-zinc-800 p-2 rounded">
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Command name"
                          value={command.name}
                          onChange={(e) => updateTemplateCommand(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Output"
                          value={command.output}
                          onChange={(e) => updateTemplateCommand(index, 'output', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="text"
                          placeholder="Description"
                          value={command.description}
                          onChange={(e) => updateTemplateCommand(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Allowed paths"
                          value={(command.allowedPaths || []).join(', ')}
                          onChange={(e) => updateTemplateCommand(index, 'allowedPaths', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="text"
                          placeholder="Blocked paths"
                          value={(command.blockedPaths || []).join(', ')}
                          onChange={(e) => updateTemplateCommand(index, 'blockedPaths', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                          className="w-full px-3 py-2 bg-zinc-900 border border-zinc-600 rounded-lg text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Custom Commands Section */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-medium text-gray-300">Custom Commands (additional for this level)</label>
                  <button
                    type="button"
                    onClick={addCustomCommand}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add Custom Command
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.customCommands.map((command, index) => (
                    <div key={`custom-cmd-${index}`} className="flex gap-2 items-end bg-blue-900/20 p-2 rounded border border-blue-600/40">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Command name"
                          value={command.name}
                          onChange={(e) => updateCustomCommand(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Output"
                          value={command.output}
                          onChange={(e) => updateCustomCommand(index, 'output', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Description"
                          value={command.description}
                          onChange={(e) => updateCustomCommand(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Allowed paths (comma separated)"
                          value={(command.allowedPaths || []).join(', ')}
                          onChange={(e) => updateCustomCommand(index, 'allowedPaths', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Blocked paths (comma separated)"
                          value={(command.blockedPaths || []).join(', ')}
                          onChange={(e) => updateCustomCommand(index, 'blockedPaths', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeCustomCommand(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 items-center">
                <div className="mr-auto text-sm text-gray-300 flex items-center gap-4">
                  <div>Template Commands: <span className="font-mono">{templateCommands.length}</span></div>
                  <div>Custom Commands: <span className="font-mono">{formData.customCommands.length}</span></div>
                  <button type="button" onClick={() => { setDebugJson(JSON.stringify(formData, null, 2)); setDebugDumpOpen(true); }} className="px-2 py-1 bg-zinc-700 text-white rounded">Dump formData</button>
                </div>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white rounded-lg"
                >
                  {submitting ? 'Saving...' : (editingLevel ? 'Update Level' : 'Create Level')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTemplates && <CommandTemplatesAdmin onClose={() => setShowTemplates(false)} />}

      {/* Debug Dump Modal (for users without DevTools) */}
      {debugDumpOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-zinc-900 p-4 rounded max-w-3xl w-full max-h-[80vh] overflow-auto border border-zinc-700">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white">formData Dump</h4>
              <button onClick={() => setDebugDumpOpen(false)} className="px-2 py-1 bg-zinc-700 text-white rounded">Close</button>
            </div>
            <pre className="text-xs text-gray-200 whitespace-pre-wrap break-words bg-zinc-800 p-3 rounded">{debugJson}</pre>
          </div>
        </div>
      )}

      {/* Levels List */}
      <div className="bg-zinc-950/50 rounded-xl border border-red-900/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-zinc-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Level</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Title</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Difficulty</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Commands</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-red-900/20">
              {filteredLevels.map((level) => (
                <tr key={level.id} className="hover:bg-zinc-900/30">
                  <td className="px-4 py-3 text-sm text-white">{level.level}</td>
                  <td className="px-4 py-3 text-sm text-white">{level.title}</td>
                  <td className="px-4 py-3 text-sm text-white capitalize">{level.difficulty}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      level.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'
                    }`}>
                      {level.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-300">{level.commands?.length || 0}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(level)}
                        className="text-blue-400 hover:text-blue-300"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(level.id)}
                        className={level.isActive ? 'text-yellow-400 hover:text-yellow-300' : 'text-green-400 hover:text-green-300'}
                        title={level.isActive ? 'Deactivate' : 'Activate'}
                      >
                        {level.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(level.id)}
                        className="text-red-400 hover:text-red-300"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLevels.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            {searchTerm ? 'No levels found matching your search.' : 'No CTF levels found.'}
          </div>
        )}
      </div>
    </div>
  );
};

export default CTFLevelsAdmin;