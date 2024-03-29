const TelegramApi = require('node-telegram-bot-api');
const sequelize = require('./db');
const UserModel = require('./models');
const token = '5398982464:AAHqK9WmtYnUxlzI1T7rvvFqU0xivKjM9vY';

const destinationChatId = 440848273;

const bot = new TelegramApi(token, {polling: true})

const start = () => {

    let originalUserName = '';
    Data = new Date();
    let hours = Data.getHours();
    let currentGreeting = '';

    function gettingTime() {
        if (hours >= 4 && hours < 12) {
            currentGreeting = 'Good morning'
        } else if (hours >= 12 && hours < 18) {
            currentGreeting = 'Good afternoon'
        } else currentGreeting = 'Good evening'
    }

    gettingTime();

    const nameOptions = {
        reply_markup: JSON.stringify({
            inline_keyboard: [
                [{text: 'Yes, you may', callback_data: 'yes'}],
                [{text: 'No, I will send you the only option now', callback_data: 'no'}]
            ]
        })
    }

    bot.setMyCommands([
        {command: '/start', description: 'Reload'},
        {command: '/info', description: 'Purpose of the Bot'},
        {command: '/help', description: 'Report an issue'},
        {command: '/co', description: 'Offer cooperation'}

        //{command: '/random cat', description: 'Get your daily cat'}
    ])

    bot.on('message', async msg => {
        const text = msg.text;
        const userId = msg.chat.id;

        try {
            if (text === '/start') {
                //await UserModel.create({chatId})
                await bot.sendSticker(userId, './sticker.png')
                return bot.sendMessage(userId, `${currentGreeting}, dear Guest. Would you like me to call you ${msg.from.first_name}?`, nameOptions)
            }
            if (text === '/info') {
                return bot.sendMessage(userId, `You could submit any media content for the channel here. It will be inspected and possibly posted on the channel.`)
            }

            if (text === '/help') {
                return bot.sendMessage(userId, 'To get the help you need, please contact us at this email address - ')
            }

            if (text === '/co') {
                return bot.sendMessage(userId, 'Please contact us at this email address - ')
            }

        } catch (error) {
            return bot.sendMessage(userId, 'Something went wrong')
        }
    })

    const userPreferableName = {};
    let waitForName = false;

    bot.on('callback_query', async msg => {
        const data = msg.data;
        const chatId = msg.message.chat.id;


        if (data === 'yes' && !originalUserName) {
            return bot.sendMessage(chatId, `Thank you, ${msg.from.first_name}! Now you can send anything you want to be posted in the channel`);
        } else if (originalUserName) {
            return bot.sendMessage(chatId, `You've already chosen a name, haven't you?`)
        }
        if (data === 'no' && !originalUserName) {
            waitForName = true;
            return bot.sendMessage(chatId, `Please send the name you prefer`);
        } else if (originalUserName) {
            await bot.sendMessage(chatId, `You've already chosen a name, haven't you?`)
        }
    });

    bot.onText(/(.+)/, async (msg, match) => {
        const userId = msg.chat.id;
        const newName = match[1];

        if (waitForName) {
            if (!userPreferableName[userId]) {
                userPreferableName[userId] = {name: newName};
                originalUserName = newName;
                await bot.sendMessage(userId, `Great, thank you, ${originalUserName}. Now you can send anything you want to be posted in the channel`);
            } else if (userPreferableName[userId]) {
                await bot.sendMessage(userId, `You've already chosen a name, haven't you?`);
            }
        }
        waitForName = false;
    });

    bot.on('message', async (msg) => {

        const chatId = msg.chat.id;
        if (msg.photo || msg.video || msg.document) {
            await bot.forwardMessage(destinationChatId, chatId, msg.message_id);
        }
    });


    let mediaGroupReceived = false;

    bot.on('message', async (msg) => {
        const userId = msg.chat.id;
        let name = originalUserName !== msg.from.first_name && originalUserName ? originalUserName : msg.from.first_name;
        if (msg.photo || msg.video || msg.document) {
            if (!mediaGroupReceived) {
                await bot.sendMessage(userId, `Thank you so much, ${name}. A great choice! 🖤`);
                mediaGroupReceived = true;
            }
        }
    });
}

start();