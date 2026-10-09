
import { handleRecruitmentStart } from './buttons/recruitmentStart.js';
import { handleAccept } from './buttons/accept.js';
import { handleReject } from './buttons/reject.js';

export async function handleButton(interaction) {
  const { customId } = interaction;

  switch (customId) {
    case 'recruitment_start':
      await handleRecruitmentStart(interaction);
      break;

    case 'accept_application':
      await handleAccept(interaction);
      break;

    case 'reject_application':
      await handleReject(interaction);
      break;

    default:
      await interaction.reply({
        content: '❌ Nieznana akcja.',
        ephemeral: true,
      });
  }
}