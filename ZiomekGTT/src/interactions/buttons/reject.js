import { EmbedBuilder } from 'discord.js';
import { canManageApplications, getRequiredRoles } from '../../utils/roleHelper.js';

export async function handleReject(interaction) {
  const requiredRoles = await getRequiredRoles(interaction.guild);
  const hasPermission = canManageApplications(interaction.member, requiredRoles);

  if (!hasPermission) {
    await interaction.reply({
      content: '❌ Nie masz uprawnień do zarządzania podaniami.',
      ephemeral: true,
    });
    return;
  }

  const originalEmbed = interaction.message.embeds[0];
  const userIdField = originalEmbed.fields.find(f => f.name === '👤 Użytkownik');
  const userId = userIdField?.value.replace(/[<@>]/g, '');

  if (!userId) {
    await interaction.reply({
      content: '❌ Nie można znaleźć ID użytkownika.',
      ephemeral: true,
    });
    return;
  }

  const user = await interaction.guild.members.fetch(userId).catch(() => null);
  if (!user) {
    await interaction.reply({
      content: '❌ Użytkownik nie jest już na serwerze.',
      ephemeral: true,
    });
    return;
  }

  const roleField = originalEmbed.fields.find(f => f.name === '🎯 Wybrana ranga');
  const roleText = roleField?.value || '';

  const updatedEmbed = EmbedBuilder.from(originalEmbed)
    .setColor(0xed4245)
    .spliceFields(originalEmbed.fields.length - 1, 1, { name: 'Status', value: '🔴 ODRZUCONO', inline: false });

  await interaction.message.edit({
    embeds: [updatedEmbed],
    components: [],
  });

  try {
    await user.send({
      content: `❌ Twoje zgłoszenie na rangę ${roleText} zostało odrzucone.`,
    });
  } catch (error) {
    console.warn('⚠️ Nie udało się wysłać DM do użytkownika:', error);
  }

  await interaction.followUp({
    content: '❌ Zgłoszenie zostało odrzucone.',
    ephemeral: true,
  });

  setTimeout(async () => {
    try {
      await interaction.channel.delete('Zgłoszenie odrzucone - kanał usunięty');
      console.log('✅ Kanał rekrutacyjny usunięty po odrzuceniu');
    } catch (error) {
      console.error('❌ Błąd podczas usuwania kanału:', error);
    }
  }, 3000);
}
