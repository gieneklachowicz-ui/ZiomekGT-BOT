import { ChannelType } from 'discord.js';

export async function checkActiveRecruitment(userId, guild) {
  const channels = guild.channels.cache.filter(
    ch => ch.type === ChannelType.GuildText && ch.name.startsWith('rekrutacja-')
  );

  for (const channel of channels.values()) {
    try {
      const overwrites = channel.permissionOverwrites.cache.get(userId);
      if (overwrites && overwrites.allow.has(1 << 10)) {
        return channel;
      }
    } catch (error) {
      continue;
    }
  }

  return null;
}
