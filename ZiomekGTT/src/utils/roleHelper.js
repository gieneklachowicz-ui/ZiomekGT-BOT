import { config } from '../config/config.js';

export async function getRequiredRoles(guild) {
  const roles = {};
  const roleNames = config.roleNames;

  for (const [key, name] of Object.entries(roleNames)) {
    const role = guild.roles.cache.find(r => r.name === name);
    if (role) {
      roles[key] = role;
    } else {
      console.warn(`⚠️ Nie znaleziono roli: ${name}`);
    }
  }

  return roles;
}

export function hasRequiredRole(member, roles) {
  const allowedRoles = [roles.owner, roles.coOwner, roles.admin, roles.helper];
  return member.roles.cache.some(role => allowedRoles.includes(role));
}

export function canManageApplications(member, roles) {
  const allowedRoles = [roles.owner, roles.coOwner, roles.admin, roles.helper];
  return member.roles.cache.some(role => allowedRoles.includes(role));
}
