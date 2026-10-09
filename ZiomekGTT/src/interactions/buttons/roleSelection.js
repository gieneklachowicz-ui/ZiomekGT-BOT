import {
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ActionRowBuilder,
} from 'discord.js';

export async function handleRoleSelection(interaction) {
  // Select Menu zwraca wybraną wartość tutaj
  const role = interaction.values?.[0];

  console.log(`🔘 Wybrana ranga: ${role}`);

  if (!['ticket', 'helper', 'admin', 'coowner'].includes(role)) {
    return await interaction.reply({
      content: '❌ Nieprawidłowa ranga.',
      ephemeral: true,
    });
  }

  const roleNames = {
    ticket: 'TICKET',
    helper: 'HELPER',
    admin: 'ADMIN',
    coowner: 'CO-OWNER',
  };

  const modal = new ModalBuilder()
    .setCustomId(`recruitment_${role}_modal`)
    .setTitle(`Rekrutacja - ${roleNames[role]}`);

  // ==========================================
  // ADMIN / CO-OWNER
  // ==========================================

  if (role === 'admin' || role === 'coowner') {
    const emailRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('email')
        .setLabel('Podaj swój email')
        .setStyle(TextInputStyle.Short)
        .setRequired(true)
        .setMaxLength(254)
    );

    const ageRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('age')
        .setLabel('Czy masz powyżej 13 lat?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Tak / Nie')
        .setRequired(true)
        .setMaxLength(3)
    );

    const voiceRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('voice')
        .setLabel('Czy przeszedłeś mutację głosu?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Tak / Nie')
        .setRequired(true)
        .setMaxLength(3)
    );

    const reasonRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Dlaczego chcesz tę rangę?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
    );

    const whyYouRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('why_you')
        .setLabel('Dlaczego mamy wybrać Ciebie?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
    );

    modal.addComponents(
      emailRow,
      ageRow,
      voiceRow,
      reasonRow,
      whyYouRow
    );
  }

  // ==========================================
  // TICKET / HELPER
  // ==========================================

  else {
    const ageRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('age')
        .setLabel('Czy masz powyżej 13 lat?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Tak / Nie')
        .setRequired(true)
        .setMaxLength(3)
    );

    const voiceRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('voice')
        .setLabel('Czy przeszedłeś mutację głosu?')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('Tak / Nie')
        .setRequired(true)
        .setMaxLength(3)
    );

    const reasonRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('reason')
        .setLabel('Dlaczego chcesz tę rangę?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
    );

    const whyYouRow = new ActionRowBuilder().addComponents(
      new TextInputBuilder()
        .setCustomId('why_you')
        .setLabel('Dlaczego mamy wybrać Ciebie?')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true)
        .setMaxLength(1000)
    );

    modal.addComponents(
      ageRow,
      voiceRow,
      reasonRow,
      whyYouRow
    );
  }

  try {
    await interaction.showModal(modal);

    console.log(`✅ Pokazano formularz: ${role}`);
  } catch (error) {
    console.error('❌ Błąd podczas pokazywania formularza:', error);
  }
}