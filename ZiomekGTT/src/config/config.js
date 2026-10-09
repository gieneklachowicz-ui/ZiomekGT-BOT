import dotenv from 'dotenv';

dotenv.config();

export const config = {
  token: process.env.DISCORD_TOKEN,
  clientId: process.env.CLIENT_ID,

  // GUILD_ID nie jest już wymagane.
  // Bot może działać na wielu serwerach.
  guildId: process.env.GUILD_ID,

  recruitmentChannelId: process.env.RECRUITMENT_CHANNEL_ID,

  roleNames: {
    owner: process.env.ROLE_OWNER || '『 👑 』OWNER',
    coOwner: process.env.ROLE_CO_OWNER || '『 🏆 』CO-OWNER',
    admin: process.env.ROLE_ADMIN || '『 🛡️ 』ADMIN',
    helper: process.env.ROLE_HELPER || '『 🔨 』HELPER',
  },

  roleIds: {
    ticket: process.env.ROLE_TICKET_ID,
    helper: process.env.ROLE_HELPER_ID,
    admin: process.env.ROLE_ADMIN_ID,
    coOwner: process.env.ROLE_CO_OWNER_ID,
  },

  // ID ról używane do nadawania po akceptacji
  // Owner NIE jest nadawany automatycznie
  roleAssignIds: {
    ticket: process.env.ROLE_TICKET_ID,
    helper: process.env.ROLE_HELPER_ID || '1538614716220448890',
    admin: process.env.ROLE_ADMIN_ID || '1532037241629704212',
    coOwner: process.env.ROLE_CO_OWNER_ID || '1538527038690951168',
  },

  // Wymagana rola do rozpoczęcia rekrutacji na wyższą rangę
  requiredHigherRoleId: process.env.REQUIRED_HIGHER_ROLE_ID,

  deleteChannelAfterDecision:
    process.env.DELETE_CHANNEL_AFTER_DECISION === 'true',
};

export function validateConfig() {
  const required = ['token', 'clientId'];

  const missing = required.filter(key => !config[key]);

  if (missing.length > 0) {
    console.error('Błąd: Brakujące zmienne środowiskowe:');

    missing.forEach(key => {
      console.error(`  POTRZEBUJĘ: ${key.toUpperCase()}`);
    });

    process.exit(1);
  }
}