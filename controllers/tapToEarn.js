const fs = require('fs').promises;

async function tap(ctx) {
  const userId = ctx.from.id;
  const users = JSON.parse(await fs.readFile('./data/users.json'));

  if (!users.users[userId]) {
    users.users[userId] = {
      level: 1,
      energy: 1000,
      maxEnergy: 1000,
      dubaiCoin: 0,
      xp: 0,
      taps: 0,
    };
  }

  const user = users.users[userId];
  if (user.energy < 1) {
    return ctx.reply('Energiyangiz tugadi! 3 soatdan keyin tiklanadi.');
  }

  user.taps += 1;
  user.energy -= 1;
  user.dubaiCoin += user.level;
  user.xp += user.taps % 500 === 0 ? 1 : 0;

  if (user.xp >= user.level * 1500) {
    user.level += 1;
    user.maxEnergy += 500;
    user.energy = user.maxEnergy;
    ctx.reply(`Tabriklaymiz! ${user.level}-darajaga o‘tdingiz! 🎉`);
  }

  await fs.writeFile('./data/users.json', JSON.stringify(users, null, 2));
  ctx.reply(`Siz ${user.dubaiCoin} DubaiCoin yig‘dingiz! Energiya: ${user.energy}/${user.maxEnergy}`);
}

module.exports = { tap };