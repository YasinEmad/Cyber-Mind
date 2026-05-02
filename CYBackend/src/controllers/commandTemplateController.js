const { CommandTemplate } = require('../models');
const { generateTemplateId } = require('../utils/idGenerator');

// Command templates CRUD (DB-backed)
exports.getCommandTemplates = async (req, res, next) => {
  try {
    const rows = await CommandTemplate.findAll({ order: [['id', 'ASC']] });
    const data = rows.map((t) => ({
      id: t.id,
      templateId: t.templateId,
      name: t.name,
      baseCommand: t.baseCommand,
      defaultOutput: t.defaultOutput,
      fields: t.fields,
      allowedPaths: t.allowedPaths,
      blockedPaths: t.blockedPaths,
      commands: t.commands,
      description: t.description,
    }));
    res.status(200).json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

exports.getCommandTemplateById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tmpl = await CommandTemplate.findByPk(id);
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template not found' });
    res.status(200).json({ success: true, data: tmpl });
  } catch (error) {
    next(error);
  }
};

exports.createCommandTemplate = async (req, res, next) => {
  try {
    const { name, baseCommand, defaultOutput, fields, description, commands, allowedPaths, blockedPaths } = req.body;
    // Generate templateId automatically - no longer required in request
    const templateId = generateTemplateId();

    // Require name; accept either a single baseCommand or an array of commands
    if (!name || (!baseCommand && !Array.isArray(commands))) {
      return res.status(400).json({ success: false, message: 'name and baseCommand or commands are required' });
    }

    // basic validation for fields
    if (fields && !Array.isArray(fields)) {
      return res.status(400).json({ success: false, message: 'fields must be an array' });
    }
    if (commands && !Array.isArray(commands)) {
      return res.status(400).json({ success: false, message: 'commands must be an array' });
    }
    if (allowedPaths && !Array.isArray(allowedPaths)) {
      return res.status(400).json({ success: false, message: 'allowedPaths must be an array' });
    }
    if (blockedPaths && !Array.isArray(blockedPaths)) {
      return res.status(400).json({ success: false, message: 'blockedPaths must be an array' });
    }

    const created = await CommandTemplate.create({
      templateId,
      name,
      baseCommand,
      defaultOutput,
      fields: fields || [],
      allowedPaths: allowedPaths || [],
      blockedPaths: blockedPaths || [],
      description,
      commands: commands || []
    });
    res.status(201).json({ success: true, data: created, message: `Template created with ID: ${templateId}` });
  } catch (error) {
    next(error);
  }
};

exports.updateCommandTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const tmpl = await CommandTemplate.findByPk(id);
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template not found' });
    if (updateData.fields && !Array.isArray(updateData.fields)) {
      return res.status(400).json({ success: false, message: 'fields must be an array' });
    }
    if (updateData.commands && !Array.isArray(updateData.commands)) {
      return res.status(400).json({ success: false, message: 'commands must be an array' });
    }
    if (updateData.allowedPaths && !Array.isArray(updateData.allowedPaths)) {
      return res.status(400).json({ success: false, message: 'allowedPaths must be an array' });
    }
    if (updateData.blockedPaths && !Array.isArray(updateData.blockedPaths)) {
      return res.status(400).json({ success: false, message: 'blockedPaths must be an array' });
    }
    if (updateData.templateId && updateData.templateId !== tmpl.templateId) {
      const exists = await CommandTemplate.findOne({ where: { templateId: updateData.templateId } });
      if (exists) return res.status(409).json({ success: false, message: 'templateId already exists' });
    }
    // If significant template fields changed, bump version
    const significant = ['templateId', 'name', 'baseCommand', 'defaultOutput', 'fields', 'commands', 'description', 'allowedPaths', 'blockedPaths'];
    const willChangeVersion = significant.some((k) => {
      if (updateData[k] === undefined) return false;
      const oldVal = tmpl[k];
      const newVal = updateData[k];
      // simple deep check for arrays
      if (Array.isArray(oldVal) || Array.isArray(newVal)) {
        return JSON.stringify(oldVal) !== JSON.stringify(newVal);
      }
      return oldVal !== newVal;
    });
    if (willChangeVersion) {
      updateData.version = (tmpl.version || 1) + 1;
    }
    await tmpl.update(updateData);
    res.status(200).json({ success: true, data: tmpl });
  } catch (error) {
    next(error);
  }
};

exports.deleteCommandTemplate = async (req, res, next) => {
  try {
    const { id } = req.params;
    const tmpl = await CommandTemplate.findByPk(id);
    if (!tmpl) return res.status(404).json({ success: false, message: 'Template not found' });
    await tmpl.destroy();
    res.status(200).json({ success: true, message: 'Template deleted' });
  } catch (error) {
    next(error);
  }
};

// Expand a template into a concrete command object (DB-backed)
exports.expandTemplate = async (templateIdOrId, values = {}) => {
  let tmpl;
  if (typeof templateIdOrId === 'number' || /^\d+$/.test(String(templateIdOrId))) {
    tmpl = await CommandTemplate.findByPk(templateIdOrId);
  } else {
    tmpl = await CommandTemplate.findOne({ where: { templateId: templateIdOrId } });
  }
  if (!tmpl) return null;
  const tpl = tmpl.dataValues || tmpl;

  // Build snapshot (deep copy) — immutable snapshot stored in level
  const snapshotTemplate = {
    id: tpl.id,
    templateId: tpl.templateId,
    name: tpl.name,
    baseCommand: tpl.baseCommand,
    defaultOutput: tpl.defaultOutput,
    fields: Array.isArray(tpl.fields) ? [...tpl.fields] : [],
    allowedPaths: Array.isArray(tpl.allowedPaths) ? [...tpl.allowedPaths] : [],
    blockedPaths: Array.isArray(tpl.blockedPaths) ? [...tpl.blockedPaths] : [],
    description: tpl.description,
    commands: Array.isArray(tpl.commands) ? JSON.parse(JSON.stringify(tpl.commands)) : [],
    version: tpl.version || 1,
  };

  const resolveAllowedPaths = (valueAllowedPaths) => {
    if (Array.isArray(valueAllowedPaths)) return valueAllowedPaths;
    if (valueAllowedPaths) return [String(valueAllowedPaths)];
    return Array.isArray(snapshotTemplate.allowedPaths) ? snapshotTemplate.allowedPaths : [];
  };

  const resolveBlockedPaths = (valueBlockedPaths) => {
    if (Array.isArray(valueBlockedPaths)) return valueBlockedPaths;
    if (valueBlockedPaths) return [String(valueBlockedPaths)];
    return Array.isArray(snapshotTemplate.blockedPaths) ? snapshotTemplate.blockedPaths : [];
  };

  // If template defines multiple commands, expand each one
  if (Array.isArray(snapshotTemplate.commands) && snapshotTemplate.commands.length > 0) {
    const vals = values && values.commands && Array.isArray(values.commands) ? values.commands : [];
    const cmds = snapshotTemplate.commands.map((c, idx) => {
      const v = vals[idx] || {};
      const name = v.name || c.name || c.baseCommand || snapshotTemplate.baseCommand || snapshotTemplate.name;
      const output = v.output !== undefined ? v.output : (c.output !== undefined ? c.output : snapshotTemplate.defaultOutput || '');
      const cmd = Object.assign({}, c, {
        name,
        output,
        sourceTemplateId: snapshotTemplate.id,
        sourceTemplateVersion: snapshotTemplate.version,
        templateSnapshot: snapshotTemplate,
      });
      if (snapshotTemplate.fields.includes('allowedPaths') || snapshotTemplate.allowedPaths.length > 0 || Array.isArray(v.allowedPaths)) {
        cmd.allowedPaths = resolveAllowedPaths(v.allowedPaths);
      }
      if (snapshotTemplate.fields.includes('blockedPaths') || snapshotTemplate.blockedPaths.length > 0 || Array.isArray(v.blockedPaths)) {
        cmd.blockedPaths = resolveBlockedPaths(v.blockedPaths);
      }
      return cmd;
    });
    return cmds;
  }

  // Fallback: single command template
  const cmd = {
    name: values.name || snapshotTemplate.baseCommand || snapshotTemplate.name,
    output: values.output !== undefined ? values.output : snapshotTemplate.defaultOutput || '',
    sourceTemplateId: snapshotTemplate.id,
    sourceTemplateVersion: snapshotTemplate.version,
    templateSnapshot: snapshotTemplate,
  };

  if (snapshotTemplate.fields.includes('allowedPaths') || snapshotTemplate.allowedPaths.length > 0) {
    cmd.allowedPaths = resolveAllowedPaths(values.allowedPaths);
  }
  if (snapshotTemplate.fields.includes('blockedPaths') || snapshotTemplate.blockedPaths.length > 0) {
    cmd.blockedPaths = resolveBlockedPaths(values.blockedPaths);
  }

  snapshotTemplate.fields.forEach((f) => {
    if (f !== 'allowedPaths' && f !== 'blockedPaths' && f !== 'output') {
      if (values[f] !== undefined) cmd[f] = values[f];
    }
  });

  return [cmd];
};