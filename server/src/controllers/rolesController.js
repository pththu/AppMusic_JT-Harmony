const { redisClient } = require('../configs/redis');
const { Role } = require('../models');

exports.getAllRole = async (req, res) => {
  try {
    const cacheKey = 'all_roles';
    // Check if data is in cache
    const cachedData = await redisClient.get(cacheKey);
    if (cachedData) {
      return res.json(JSON.parse(cachedData));
    }

    const rows = await Role.findAll();
    const response = {
      message: 'Lấy tất cả người dùng thành công',
      data: rows,
      success: true
    };
    await redisClient.set(cacheKey, JSON.stringify(response), { EX: 3600 });
    res.json(response);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRoleById = async (req, res) => {
  try {
    const row = await Role.findByPk(req.params.id);
    if (!row) return res.status(404).json({ error: 'Role not found' });
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const row = await Role.create(req.body);
    await redisClient.del('all_roles');

    res.status(201).json({
      message: 'Role created successfully',
      data: row,
      success: true
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const [updated] = await Role.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Role not found' });
    const row = await Role.findByPk(req.params.id);
    await redisClient.del('all_roles');
    res.json(row);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const deleted = await Role.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ error: 'Role not found' });
    await redisClient.del('all_roles');
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


