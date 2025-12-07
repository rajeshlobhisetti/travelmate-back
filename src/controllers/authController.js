const prisma = require('../prisma');
const bcrypt = require('bcryptjs');
const Joi = require('joi');

const registerSchema = Joi.object({
  name: Joi.string().min(2).max(60).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

async function register(req, res) {
  try {
    const { value, error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const existing = await prisma.user.findUnique({ where: { email: value.email } });
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const hashed = await bcrypt.hash(value.password, 10);
    const user = await prisma.user.create({
      data: { name: value.name, email: value.email, password: hashed, role: 'USER' },
      select: { id: true, name: true, email: true, role: true }
    });

    req.session.user = user;
    return res.status(201).json({ user });
  } catch (e) {
    return res.status(500).json({ message: 'Registration failed' });
  }
}

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

async function login(req, res) {
  try {
    const { value, error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ message: error.message });

    const user = await prisma.user.findUnique({ where: { email: value.email } });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(value.password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    const safeUser = { id: user.id, name: user.name, email: user.email, role: user.role };
    req.session.user = safeUser;
    return res.json({ user: safeUser });
  } catch (e) {
    return res.status(500).json({ message: 'Login failed' });
  }
}

async function me(req, res) {
  return res.json({ user: req.session.user || null });
}

async function logout(req, res) {
  req.session.destroy(() => {
    res.clearCookie('sid');
    res.json({ message: 'Logged out' });
  });
}

module.exports = { register, login, me, logout };
