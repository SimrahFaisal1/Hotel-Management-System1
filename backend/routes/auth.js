const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
	try {
		const { name, email, password } = req.body;
		if (!name || !email || !password) return res.status(400).json({ error: 'Missing fields' });

		const existing = await User.findOne({ email });
		if (existing) return res.status(409).json({ error: 'Email already registered' });

		const user = new User({ name, email, password });
		await user.save();

		const userObj = user.toObject();
		delete userObj.password;

		res.status(201).json({ user: userObj });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Login
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;
		if (!email || !password) return res.status(400).json({ error: 'Missing fields' });

		const user = await User.findOne({ email });
		if (!user) return res.status(401).json({ error: 'Invalid credentials' });

		const isMatch = await user.comparePassword(password);
		if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

		const secret = process.env.JWT_SECRET || 'devsecret';
		const token = jwt.sign({ id: user._id, role: user.role }, secret, { expiresIn: '1d' });

		const userObj = user.toObject();
		delete userObj.password;

		res.json({ token, user: userObj });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Simple auth check
router.get('/me', async (req, res) => {
	res.json({ message: 'Auth router alive' });
});

module.exports = router;
