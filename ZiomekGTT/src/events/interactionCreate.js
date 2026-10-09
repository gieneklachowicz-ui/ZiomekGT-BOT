
import { handleCommand } from '../commands/handleCommand.js';
import { handleButton } from '../interactions/handleButton.js';
import { handleModal } from '../interactions/handleModal.js';
import { handleRoleSelection } from '../interactions/buttons/roleSelection.js';

export default {
  name: 'interactionCreate',

  async execute(interaction) {
    try {
      // Slash commands
      if (interaction.isChatInputCommand()) {
        await handleCommand(interaction);
        return;
      }

      // Przyciski
      if (interaction.isButton()) {
        await handleButton(interaction);
        return;
      }

      // Select Menu - wybór rangi
      if (interaction.isStringSelectMenu()) {
        if (interaction.customId === 'role_selection') {
          await handleRoleSelection(interaction);
        }
        return;
      }

      // Formularze
      if (interaction.isModalSubmit()) {
        await handleModal(interaction);
        return;
      }

    } catch (error) {
      console.error('❌ Błąd obsługi interakcji:', error);

      try {
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: '❌ Wystąpił błąd podczas obsługi tej interakcji.',
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: '❌ Wystąpił błąd podczas obsługi tej interakcji.',
            ephemeral: true,
          });
        }
      } catch (replyError) {
        console.error('❌ Nie udało się wysłać wiadomości błędu:', replyError);
      }
    }
  },
};