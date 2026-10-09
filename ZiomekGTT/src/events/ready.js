export default {
  name: 'ready',
  once: true,
  execute(client) {
    console.log(`✅ Bot zalogowany jako ${client.user.tag}`);
    console.log(`📊 Obsługuję ${client.guilds.cache.size} serwerów`);
  },
};
