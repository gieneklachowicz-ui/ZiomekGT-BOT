import { getRequiredRoles } from './roleHelper.js';
import { PermissionFlagsBits, ChannelType } from 'discord.js';

export async function createRecruitmentChannel(user, guild) {
  const roles = await getRequiredRoles(guild);

  const sanitizedName = user.username
    .replace(/[^a-zA-Z0-9-]/g, '')
    .toLowerCase()
    .substring(0, 80);

  const channelName = `rekrutacja-${sanitizedName}`;

  const existingChannel = guild.channels.cache.find(
    ch => ch.name === channelName && ch.type === ChannelType.GuildText
  );

  if (existingChannel) {
    throw new Error('Kanał rekrutacyjny dla tego użytkownika już istnieje');
  }

  const overwrites = [
    {
      id: guild.id,
      deny: [PermissionFlagsBits.ViewChannel],
    },
    {
      id: user.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    },
  ];

  if (roles.owner) {
    overwrites.push({
      id: roles.owner.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
      ],
    });
  }

  if (roles.coOwner) {
    overwrites.push({
      id: roles.coOwner.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
      ],
    });
  }

  if (roles.admin) {
    overwrites.push({
      id: roles.admin.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
        PermissionFlagsBits.ManageChannels,
      ],
    });
  }

  if (roles.helper) {
    overwrites.push({
      id: roles.helper.id,
      allow: [
        PermissionFlagsBits.ViewChannel,
        PermissionFlagsBits.SendMessages,
        PermissionFlagsBits.ReadMessageHistory,
      ],
    });
  }

  const missingRoles = [];
  if (!roles.owner) missingRoles.push('OWNER');
  if (!roles.coOwner) missingRoles.push('CO-OWNER');
  if (!roles.admin) missingRoles.push('ADMIN');
  if (!roles.helper) missingRoles.push('HELPER');

  if (missingRoles.length > 0) {
    console.warn(`⚠️ Ostrzeżenie: Brakujące role: ${missingRoles.join(', ')}`);
  }

  const channel = await guild.channels.create({
    name: channelName,
    type: ChannelType.GuildText,
    permissionOverwrites: overwrites,
    parent: null,
  });

  return channel;
}
