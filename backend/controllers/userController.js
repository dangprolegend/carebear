import User from '../models/User.js';

// GET user profile
export const getUser = async (req, res) => {
  try {
    const user = await User.findOne({ userID: req.params.userID });
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/signup
export const signup = async (req, res) => {
  const { userID, email, name, image } = req.body;
  try {
    const existing = await User.findOne({ userID });
    if (existing) return res.status(400).json({ message: 'User already exists' });

    const newUser = new User({ userID, email, name, image });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /auth/login
export const login = async (req, res) => {
  const { userID, email, name, image } = req.body;
  try {
    let user = await User.findOne({ userID });
    if (!user) {
      user = new User({ userID, email, name, image });
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// PUT user info
export const updateUser = async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { userID: req.params.userID },
      { $set: req.body },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// DELETE user
export const deleteUser = async (req, res) => {
  try {
    await User.findOneAndDelete({ userID: req.params.userID });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
