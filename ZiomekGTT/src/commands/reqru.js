import { SlashCommandBuilder, ChannelType, PermissionFlagsBits, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { hasRequiredRole } from '../utils/roleHelper.js';

export const data = new SlashCommandBuilder()
  .setName('reqru')
  .setDescription('Utwórz panel rekrutacyjny na wybranym kanale')
  .addChannelOption(option =>
    option
      .setName('channel')
      .setDescription('Kanał na którym ma zostać utworzony panel')
      .addChannelTypes(ChannelType.GuildText)
      .setRequired(false)
  )
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

export async function handleReqru(interaction) {
  if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
    await interaction.reply({ 
      content: 'Ta komenda jest dostępna tylko dla administratorów.', 
      ephemeral: true 
    });
    return;
  }

  const channel = interaction.options.getChannel('channel') || interaction.channel;

  if (!channel || channel.type !== ChannelType.GuildText) {
    await interaction.reply({ 
      content: 'Podano nieprawidłowy kanał.', 
      ephemeral: true 
    });
    return;
  }

  const embed = new EmbedBuilder()
    .setTitle('# REKRUTACJA')
    .setDescription('Jeśli chcesz dołączyć do administracji lub zespołu serwera, kliknij przycisk poniżej i wybierz rangę, o którą chcesz się ubiegać.')
    .setColor(0x2b2d31)
    .setTimestamp();

  const row = new ActionRowBuilder()
    .addComponents(
      new ButtonBuilder()
        .setCustomId('recruitment_start')
        .setLabel('📝 ZŁÓŻ REKRUTACJĘ')
        .setStyle(ButtonStyle.Primary)
    );

  await channel.send({ embeds: [embed], components: [row] });

  await interaction.reply({
    content: `✅ Panel rekrutacyjny został utworzony na kanale ${channel}`,
    ephemeral: true,
  });
}
