const templates = [
  {
    templateId: 'file_list',
    name: 'File Listing Command',
    baseCommand: 'ls',
    defaultOutput: 'Desktop Documents Downloads',
    fields: ['output', 'allowedPaths', 'blockedPaths'],
    description: 'List files in a directory',
  },
  {
    templateId: 'file_read',
    name: 'File Read Command',
    baseCommand: 'cat',
    defaultOutput: 'Example file contents',
    fields: ['output', 'allowedPaths', 'blockedPaths'],
    description: 'Read file contents',
  },
  {
    templateId: 'hidden_finder',
    name: 'Hidden File Finder',
    baseCommand: 'ls -a',
    defaultOutput: '.hidden_flag.txt .bashrc',
    fields: ['output', 'allowedPaths', 'blockedPaths'],
    description: 'Show hidden files',
  },
  {
    templateId: 'process_inspect',
    name: 'Process Inspection',
    baseCommand: 'ps aux',
    defaultOutput: 'root  1234  0.0  0.1 /usr/bin/example',
    fields: ['output'],
    description: 'Inspect running processes',
  },
  {
    templateId: 'permission_trap',
    name: 'Permission Denied Trap',
    baseCommand: 'cat',
    defaultOutput: 'Permission denied',
    fields: ['output', 'blockedPaths'],
    description: 'Return permission denied when in blocked path',
  },
  {
    templateId: 'cd_navigation',
    name: 'Change Directory Command',
    baseCommand: 'cd',
    defaultOutput: '',
    fields: ['allowedPaths', 'blockedPaths'],
    description: 'Navigate to directories (special navigation command)',
  },
];

function addTemplate(t) {
  if (!t || !t.templateId) throw new Error('Invalid template');
  templates.push(t);
  return t;
}

module.exports = {
  templates,
  addTemplate,
};
