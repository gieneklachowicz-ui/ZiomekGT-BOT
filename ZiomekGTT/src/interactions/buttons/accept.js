import { EmbedBuilder } from 'discord.js';
import { canManageApplications, getRequiredRoles } from '../../utils/roleHelper.js';
import { config } from '../../config/config.js';

export async function handleAccept(interaction) {
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

  const roleMapping = {
    '🎫 TICKET': 'ticket',
    '🔨 HELPER': 'helper',
    '🛡️ ADMIN': 'admin',
    '👑 CO-OWNER': 'coowner',
  };

  const roleKey = roleMapping[roleText];

  const updatedEmbed = EmbedBuilder.from(originalEmbed)
    .setColor(0x57f287)
    .spliceFields(originalEmbed.fields.length - 1, 1, { name: 'Status', value: '🟢 PRZYJĘTO', inline: false });

  await interaction.message.edit({
    embeds: [updatedEmbed],
    components: [],
  });

  try {
    await user.send({
      content: `✅ Twoje zgłoszenie na rangę ${roleText} zostało przyjęte!`,
    });
  } catch (error) {
    console.warn('⚠️ Nie udało się wysłać DM do użytkownika:', error);
  }

  if (roleKey && roleKey !== 'owner') {
    const roleId = config.roleAssignIds[roleKey];
    if (roleId) {
      try {
        await user.roles.add(roleId);
        console.log(`✅ Nadano rolę ${roleKey} użytkownikowi ${user.user.tag}`);
      } catch (error) {
        console.error('❌ Błąd podczas nadawania roli:', error);
      }
    }
  }

  await interaction.followUp({
    content: '✅ Zgłoszenie zostało przyjęte.',
    ephemeral: true,
  });

  setTimeout(async () => {
    try {
      await interaction.channel.delete('Zgłoszenie przyjęte - kanał usunięty');
      console.log('✅ Kanał rekrutacyjny usunięty po akceptacji');
    } catch (error) {
      console.error('❌ Błąd podczas usuwania kanału:', error);
    }
  }, 3000);
}
