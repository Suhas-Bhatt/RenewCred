const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const prisma = require('../config/prisma');

function signAccessToken(admin) {
  return jwt.sign(
    { sub: admin.id, email: admin.email, role: admin.role },
    env.jwt.accessSecret,
    { expiresIn: env.jwt.accessExpiresIn }
  );
}

function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Refresh tokens are random opaque strings (not JWTs) so they carry no
// decodable claims if leaked; only their hash is persisted, so a DB leak
// alone cannot be replayed as a valid token either.
async function issueRefreshToken(admin) {
  const raw = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + parseDurationMs(env.jwt.refreshExpiresIn));

  await prisma.refreshToken.create({
    data: { adminId: admin.id, tokenHash, expiresAt },
  });

  return raw;
}

async function rotateRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  const existing = await prisma.refreshToken.findUnique({ where: { tokenHash } });

  if (!existing || existing.revoked || existing.expiresAt < new Date()) {
    return null;
  }

  await prisma.refreshToken.update({ where: { id: existing.id }, data: { revoked: true } });
  const admin = await prisma.admin.findUnique({ where: { id: existing.adminId } });
  if (!admin) return null;

  const newRaw = await issueRefreshToken(admin);
  return { admin, newRaw };
}

async function revokeRefreshToken(rawToken) {
  const tokenHash = hashToken(rawToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
    data: { revoked: true },
  });
}

function parseDurationMs(duration) {
  const match = /^(\d+)([smhd])$/.exec(duration);
  if (!match) return 7 * 24 * 60 * 60 * 1000; // default 7d
  const value = parseInt(match[1], 10);
  const unit = { s: 1000, m: 60000, h: 3600000, d: 86400000 }[match[2]];
  return value * unit;
}

module.exports = {
  signAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  hashToken,
};
