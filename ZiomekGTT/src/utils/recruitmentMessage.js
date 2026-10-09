import { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { getRequiredRoles } from './roleHelper.js';

export async function sendRecruitmentMessage(channel, user, role, roleEmoji, formData) {
  const roles = await getRequiredRoles(channel.guild);

  const embed = new EmbedBuilder()
    .setTitle('📋 REKRUTACJA')
    .setColor(0x2b2d31)
    .addFields(
      { name: '👤 Użytkownik', value: `<@${user.id}>`, inline: true },
      { name: '🎯 Wybrana ranga', value: `${roleEmoji} ${role.toUpperCase()}`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }
    );

  if (formData.email) {
    embed.addFields({ name: '📧 Email', value: formData.email, inline: false });
  }

  embed.addFields(
    { name: '🔞 Powyżej 13 lat', value: formData.age, inline: true },
    { name: '🎤 Mutacja głosu', value: formData.voice, inline: true },
    { name: '\u200b', value: '\u200b', inline: true },
    { name: '💭 Dlaczego chcesz tę rangę', value: formData.reason || 'Brak odpowiedzi', inline: false },
    { name: '⭐ Dlaczego mamy wybrać Ciebie', value: formData.whyYou || 'Brak odpowiedzi', inline: false },
    { name: 'Status', value: '🟡 OCZEKUJE NA ROZPATRZENIE', inline: false }
  )
  .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('accept_application')
        .setLabel('✅ PRZYJMIJ')
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId('reject_application')
        .setLabel('❌ ODRZUĆ')
        .setStyle(ButtonStyle.Danger)
    );

  await channel.send({ content: `<@${user.id}>`, embeds: [embed], components: [row] });
}
