const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const tokenService = require('../services/tokenService');
const env = require('../config/env');

const REFRESH_COOKIE = 'refreshToken';

const cookieOptions = {
  httpOnly: true,
  secure: env.nodeEnv === 'production',
  sameSite: 'lax',
  path: '/api/auth',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

function toPublicAdmin(admin) {
  return { id: admin.id, name: admin.name, email: admin.email, role: admin.role };
}

// POST /api/auth/register
// Intentionally open only to create the first SUPER_ADMIN (no admins exist
// yet); once an admin exists this route requires an authenticated
// SUPER_ADMIN caller. See router for the guard.
const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) throw ApiError.conflict('An admin with this email already exists');

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.admin.create({
    data: { name, email, passwordHash, role: role || 'EDITOR' },
  });

  res.status(201).json({ success: true, data: toPublicAdmin(admin) });
});

// POST /api/auth/login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await prisma.admin.findUnique({ where: { email } });
  if (!admin) throw ApiError.unauthorized('Invalid email or password');

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');

  const accessToken = tokenService.signAccessToken(admin);
  const refreshToken = await tokenService.issueRefreshToken(admin);

  res.cookie(REFRESH_COOKIE, refreshToken, cookieOptions);
  res.json({ success: true, data: { accessToken, admin: toPublicAdmin(admin) } });
});

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (!raw) throw ApiError.unauthorized('No refresh token provided');

  const result = await tokenService.rotateRefreshToken(raw);
  if (!result) {
    res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
    throw ApiError.unauthorized('Refresh token invalid or expired');
  }

  const { admin, newRaw } = result;
  const accessToken = tokenService.signAccessToken(admin);
  res.cookie(REFRESH_COOKIE, newRaw, cookieOptions);
  res.json({ success: true, data: { accessToken, admin: toPublicAdmin(admin) } });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE];
  if (raw) await tokenService.revokeRefreshToken(raw);
  res.clearCookie(REFRESH_COOKIE, { path: '/api/auth' });
  res.json({ success: true, data: null });
});

// GET /api/auth/me
const me = asyncHandler(async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.admin.id } });
  if (!admin) throw ApiError.notFound('Admin not found');
  res.json({ success: true, data: toPublicAdmin(admin) });
});

module.exports = { register, login, refresh, logout, me };
