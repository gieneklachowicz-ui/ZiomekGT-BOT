
import {
  ActionRowBuilder,
  StringSelectMenuBuilder,
  StringSelectMenuOptionBuilder,
} from 'discord.js';
import { checkActiveRecruitment } from '../../utils/recruitmentHelper.js';
import { config } from '../../config/config.js';

export async function handleRecruitmentStart(interaction) {
  const activeChannel = await checkActiveRecruitment(interaction.user.id, interaction.guild);

  if (activeChannel) {
    await interaction.reply({
      content: '⚠️ Masz już aktywne zgłoszenie rekrutacyjne.',
      ephemeral: true,
    });
    return;
  }

  // Sprawdź wymagana rolę do rekrutacji na wyższą rangę
  if (config.requiredHigherRoleId) {
    const member = await interaction.guild.members.fetch(interaction.user.id);
    const hasRequiredRole = member.roles.cache.has(config.requiredHigherRoleId);

    if (!hasRequiredRole) {
      await interaction.reply({
        content: '❌ Nie możesz jeszcze ubiegać się o wyższą rangę. Aby rozpocząć tę rekrutację, musisz posiadać odpowiednią rangę.',
        ephemeral: true,
      });
      return;
    }
  }

  const menu = new StringSelectMenuBuilder()
    .setCustomId('role_selection')
    .setPlaceholder('Wybierz rangę')
    .addOptions(
      new StringSelectMenuOptionBuilder()
        .setLabel('Ticket')
        .setDescription('Rekrutacja na rangę Ticket')
        .setValue('ticket')
        .setEmoji('🎫'),

      new StringSelectMenuOptionBuilder()
        .setLabel('Helper')
        .setDescription('Rekrutacja na rangę Helper')
        .setValue('helper')
        .setEmoji('🔨'),

      new StringSelectMenuOptionBuilder()
        .setLabel('Admin')
        .setDescription('Rekrutacja na rangę Admin')
        .setValue('admin')
        .setEmoji('🛡️'),

      new StringSelectMenuOptionBuilder()
        .setLabel('Co-Owner')
        .setDescription('Rekrutacja na rangę Co-Owner')
        .setValue('coowner')
        .setEmoji('👑')
    );

  const row = new ActionRowBuilder().addComponents(menu);

  await interaction.reply({
    content: '### Wybierz rangę, o którą się ubiegasz:',
    components: [row],
    ephemeral: true,
  });
}