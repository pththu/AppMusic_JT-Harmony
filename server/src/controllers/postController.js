const { Post } = require('../models');

exports.getAllPost = async (req, res) => {
  try {
    const posts = await Post.findAll();
    res.json(posts);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    res.json({ error: error.message });
  }
};

exports.getPostsByMe = async (req, res) => {
  try {
    const posts = await Post.findAll({ where: { userId: req.user.id } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPostsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    const posts = await Post.findAll({ where: { userId } });
    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const payload = { ...req.body };
    console.log('payload', payload);

    payload.userId = req.user.id; // Gán userId từ token đã xác thực

    const post = await Post.create(payload);
    return res.json(
      {
        message: 'Upload successful',
        data: post
      },
    );
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const [updated] = await Post.update(req.body, { where: { id: req.params.id } });
    if (!updated) {
      return res.status(404).json({ error: 'Post not found' });
    }
    const post = await Post.findByPk(req.params.id);
    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a post by ID (only by the owner or admin)
exports.deletePost = async (req, res) => {
  try {
    const deleted = await Post.destroy({ where: { id: req.params.id } });
    if (!deleted) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
