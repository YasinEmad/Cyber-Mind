import React, { useState, useEffect } from 'react';
import { ctfService } from '../api/ctfService';
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

const CTFLevelsAdmin: React.FC = () => {
  const [levels, setLevels] = useState<CTFLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLevel, setEditingLevel] = useState<CTFLevel | null>(null);
  const [templates, setTemplates] = useState<Array<any>>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(false);
  const [formData, setFormData] = useState({
    level: '',
    title: '',
    description: '',
    hints: [] as string[],
    flag: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    isActive: true,
    commands: [] as Command[],
    commandTemplates: [] as Array<{ templateId: string; values: any }>,
    requiredCommandSequence: [] as string[],
    successCondition: '',
    initialDirectory: '/home/user',
  });

  useEffect(() => {
    loadLevels();
    loadTemplates();
  }, []);

  const loadLevels = async () => {
    try {
      const data = await ctfService.getAllCTFLevels();
      setLevels(data);
    } catch (error) {
      console.error('Error loading CTF levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    try {
      const data = await ctfService.getTemplates();
      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent multiple submissions
    setSubmitting(true);
    try {
      if (editingLevel) {
        await ctfService.updateCTFLevel(editingLevel.id, formData);
      } else {
        await ctfService.createCTFLevel(formData);
      }
      await loadLevels();
      resetForm();
    } catch (error) {
      console.error('Error saving CTF level:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (level: CTFLevel) => {
    setEditingLevel(level);
    setFormData({
      level: level.level.toString(),
      title: level.title,
      description: level.description,
      hints: level.hints || [],
      flag: level.flag,
      difficulty: level.difficulty,
      isActive: level.isActive,
      commands: level.commands || [],
      commandTemplates: [],
      requiredCommandSequence: level.requiredCommandSequence || [],
      successCondition: level.successCondition || '',
      initialDirectory: level.initialDirectory || '/home/user',
    });
    setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this CTF level?')) {
      try {
        await ctfService.deleteCTFLevel(id);
        await loadLevels();
      } catch (error) {
        console.error('Error deleting CTF level:', error);
      }
    }
  };

  const handleToggleStatus = async (id: number) => {
    try {
      await ctfService.toggleCTFLevelStatus(id);
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

  const addCommandFromTemplate = (templateId: string) => {
    const tmpl = templates.find((t: any) => t.templateId === templateId);
    const values = {
      name: tmpl?.baseCommand || tmpl?.name || '',
      output: tmpl?.defaultOutput || '',
      allowedPaths: [],
      blockedPaths: [],
    };
    setFormData({
      ...formData,
      commandTemplates: [...formData.commandTemplates, { templateId, values }],
    });
  };

  const updateCommand = (index: number, field: keyof Command, value: any) => {
    const updatedCommands = [...formData.commands];
    updatedCommands[index] = { ...updatedCommands[index], [field]: value } as Command;
    setFormData({ ...formData, commands: updatedCommands });
  };

  const removeCommand = (index: number) => {
    setFormData({
      ...formData,
      commands: formData.commands.filter((_, i) => i !== index),
    });
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
                  <label className="block text-sm font-medium text-gray-300">Terminal Commands</label>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedTemplateId}
                      onChange={(e) => setSelectedTemplateId(e.target.value)}
                      className="px-2 py-1 bg-zinc-800 border border-red-900/40 rounded-lg text-white"
                    >
                      <option value="">Select template</option>
                      {templates.map((t) => (
                        <option key={t.templateId} value={t.templateId}>{t.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selectedTemplateId) return addCommand();
                        addCommandFromTemplate(selectedTemplateId);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                    >
                      <Plus size={16} />
                      Add From Template
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {formData.commands.map((command, index) => (
                    <div key={`cmd-${index}`} className="flex gap-2 items-end">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Command name"
                          value={command.name}
                          onChange={(e) => updateCommand(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Output"
                          value={command.output}
                          onChange={(e) => updateCommand(index, 'output', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Description"
                          value={command.description}
                          onChange={(e) => updateCommand(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Allowed paths (comma separated)"
                              value={(command.allowedPaths || []).join(', ')}
                              onChange={(e) => updateCommand(index, 'allowedPaths', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                              className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Blocked paths (comma separated)"
                              value={(command.blockedPaths || []).join(', ')}
                              onChange={(e) => updateCommand(index, 'blockedPaths', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                              className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                      <button
                        type="button"
                        onClick={() => removeCommand(index)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  {formData.commandTemplates.map((ct, index) => (
                    <div key={`tmpl-${index}`} className="flex gap-2 items-end border border-zinc-800 p-2 rounded">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Command name"
                          value={ct.values.name}
                          onChange={(e) => {
                            const updated = [...formData.commandTemplates];
                            updated[index] = { ...updated[index], values: { ...updated[index].values, name: e.target.value } };
                            setFormData({ ...formData, commandTemplates: updated });
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Output"
                          value={ct.values.output}
                          onChange={(e) => {
                            const updated = [...formData.commandTemplates];
                            updated[index] = { ...updated[index], values: { ...updated[index].values, output: e.target.value } };
                            setFormData({ ...formData, commandTemplates: updated });
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Allowed paths (comma separated)"
                          value={(ct.values.allowedPaths || []).join(', ')}
                          onChange={(e) => {
                            const updated = [...formData.commandTemplates];
                            updated[index] = { ...updated[index], values: { ...updated[index].values, allowedPaths: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } };
                            setFormData({ ...formData, commandTemplates: updated });
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Blocked paths (comma separated)"
                          value={(ct.values.blockedPaths || []).join(', ')}
                          onChange={(e) => {
                            const updated = [...formData.commandTemplates];
                            updated[index] = { ...updated[index], values: { ...updated[index].values, blockedPaths: e.target.value.split(',').map(s => s.trim()).filter(Boolean) } };
                            setFormData({ ...formData, commandTemplates: updated });
                          }}
                          className="w-full px-3 py-2 bg-zinc-800 border border-red-900/40 rounded-lg text-white focus:outline-none focus:border-red-500"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, commandTemplates: formData.commandTemplates.filter((_, i) => i !== index) })}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
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