require('dotenv').config()
const express = require('express');
const ping = require('ping');
const app = express();
const PORT = process.env.PORT || 8081;
const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TOKEN;
const chatId = process.env.CHAT_ID;
const ip = process.env.IP_ADDRESS;
const bot = new TelegramBot(token);

global.isAlive = false;

const getMessage = (isAlive) => isAlive ? 'Світло з\'явилося' : 'Світло зникло';


const pingServer = async () =>  {
  const result = await ping.promise.probe(ip, {
    timeout: 10,
    extra: ["-i", "2"],
  });

  console.log(result);
  return result;
}

const sendTelegramNotification = async (message) => {
  await bot.sendMessage(chatId, message)
}

const setAliveState = async () => {
  try {
    const { alive } = await pingServer()
    if (alive !== global.isAlive) {
      global.isAlive = alive;
      const message = getMessage(isAlive);
      await sendTelegramNotification(message);
    }
  } catch (error) {
    console.log('Catched error ', error);
  }
}
app.get('/health', async (req, res) => {
  try {
    await sendTelegramNotification('Hello from server');
    
    res.send('ЖК Садочок Світлобот health page');
  } catch (error) {
    console.log(error);
    res.status(400).send('Error');
  }
})

app.get('/', async (req, res) => {
  try {
    res.send('ЖК Садочок Світлобот');
  } catch (error) {
    console.log(error);
    res.status(400).send('Error');
  }
});

app.listen(PORT, () => {
  console.log(`server started on port ${PORT}`);
  setInterval(() => {
    console.log(1, global.isAlive);

    setAliveState();
    console.log(2, global.isAlive);
  }, 15000);

});
