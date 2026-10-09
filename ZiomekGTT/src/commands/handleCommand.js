import { handleReqru } from './reqru.js';

export async function handleCommand(interaction) {
  const { commandName } = interaction;

  switch (commandName) {
    case 'reqru':
      await handleReqru(interaction);
      break;
    default:
      await interaction.reply({ content: 'Nieznana komenda', ephemeral: true });
  }
}
