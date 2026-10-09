import { validateForm } from '../../utils/validation.js';
import { createRecruitmentChannel } from '../../utils/channelCreator.js';
import { sendRecruitmentMessage } from '../../utils/recruitmentMessage.js';

export async function handleTicketHelperModal(interaction) {
  const role = interaction.customId.replace('recruitment_', '').replace('_modal', '');
  const roleEmoji = role === 'ticket' ? '🎫' : '🔨';

  const age = interaction.fields.getTextInputValue('age');
  const voice = interaction.fields.getTextInputValue('voice');
  const reason = interaction.fields.getTextInputValue('reason');
  const whyYou = interaction.fields.getTextInputValue('why_you');

  const validation = validateForm(age, voice, reason, whyYou, null);
  if (!validation.valid) {
    await interaction.reply({ content: validation.error, ephemeral: true });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const channel = await createRecruitmentChannel(interaction.user, interaction.guild);
    await sendRecruitmentMessage(
      channel,
      interaction.user,
      role,
      roleEmoji,
      { age, voice, reason, whyYou }
    );

    await interaction.editReply({
      content: '✅ Twoje zgłoszenie zostało wysłane.',
    });
  } catch (error) {
    console.error('Błąd tworzenia kanału rekrutacyjnego:', error);
    await interaction.editReply({
      content: '❌ Wystąpił błąd podczas wysyłania zgłoszenia.',
    });
  }
}
