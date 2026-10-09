import { handleTicketHelperModal } from './modals/ticketHelperModal.js';
import { handleAdminCoOwnerModal } from './modals/adminCoOwnerModal.js';

export async function handleModal(interaction) {
  const { customId } = interaction;

  switch (customId) {
    case 'recruitment_ticket_modal':
    case 'recruitment_helper_modal':
      await handleTicketHelperModal(interaction);
      break;
    case 'recruitment_admin_modal':
    case 'recruitment_coowner_modal':
      await handleAdminCoOwnerModal(interaction);
      break;
    default:
      await interaction.reply({ content: 'Nieznany formularz', ephemeral: true });
  }
}
