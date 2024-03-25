const TelegramApi = require('node-telegram-bot-api')
const token = ;
const bot = new TelegramApi(token, {polling: true})

const start = () => {

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
                [{text:'Yes, you may', callback_data: 'yes'}],
                [{text:'No, I will send your only option now', callback_data: 'no'}]
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

        if (text === '/start') {
            await bot.sendSticker(userId, './sticker.png')
            return bot.sendMessage(userId, `${currentGreeting}, dear Guest. Would you like me to call you ${msg.from.first_name}?`, nameOptions)
        }
        if (text === '/info') {
            return bot.sendMessage(userId, `You could submit any media content for the channel here. It will be inspected and possibly posted on the channel. Thank you, ${msg.from.first_name}`)
        }
        return bot.sendMessage(userId, 'May I ask you to send me one of the available commands, please')
    })

    bot.on('callback_query', async msg => {

        const userName = msg.from.first_name;
        const data = msg.data;
        const chatId = msg.message.chat.id;

        if (data === 'yes') {
            return bot.sendMessage(chatId, `Thank you, ${userName}, how can I help you?`)
        } else {
            return bot.sendMessage(chatId, `Please send the name you prefer, dear Guest`)
        }
    })
}

start();