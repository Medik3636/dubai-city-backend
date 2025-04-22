const fs = require('fs');

async function tap(ctx) {
  const userId = ctx.from.id;
  let users = JSON.parse(fs.readFileSync('./data/users.json'));

  if (!users.users[userId]) {
    users.users[userId] = { coins: 0, energy: 1000, level: 1 };
  }

  if (users.users[userId].energy > 0) {
    users.users[userId].coins += users.users[userId].level;
    users.users[userId].energy -= 1;
    ctx.reply(`+${users.users[userId].level} DubaiCoin! Qolgan energiya: ${users.users[userId].energy}`);
  } else {
    ctx.reply('Energiya tugadi! 3 soatdan keyin tiklanadi.');
  }

  fs.writeFileSync('./data/users.json', JSON.stringify(users, null, 2));
}

module.exports = { tap };