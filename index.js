const path = require('path');
const restify = require('restify');


const { BotFrameworkAdapter, ConversationState, UserState, MemoryStorage } = require('botbuilder');
const { ActivityTypes } = require('botbuilder-core');


const { QnABot } = require('./bots/QnABot');
const { WelcomeBot } = require('./bots/welcomeBot')
const { DialogBot } = require('./bots/dialogBot');
const { UserProfileDialog } = require('./dialogs/userProfileDialog');
const { DispatchBot } = require('./bots/dispatchBot');

const ENV_FILE = path.join(__dirname, '.env');
require('dotenv').config({ path: ENV_FILE });


const adapter = new BotFrameworkAdapter({
    appId: process.env.MicrosoftAppId,
    appPassword: process.env.MicrosoftAppPassword
});

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // Create a trace activity that contains the error object
    const traceActivity = {
        type: ActivityTypes.Trace,
        timestamp: new Date(),
        name: 'onTurnError Trace',
        label: 'TurnError',
        value: `${ error }`,
        valueType: 'https://www.botframework.com/schemas/error'
    };
    
    console.error(`\n [onTurnError] unhandled error: ${ error }`);

    // Send a trace activity, which will be displayed in Bot Framework Emulator
    await context.sendActivity(traceActivity);

    // Send a message to the user
    await context.sendActivity(`The bot encountered an error or bug.`);
    await context.sendActivity(`To continue to run this bot, please fix the bot source code.`);
};

// Create the main dialog.
const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage); 
const userState = new UserState(memoryStorage);

const bot = new QnABot();
const welcomebot = new WelcomeBot(userState);
const dialog = new UserProfileDialog(userState);
const dialogbot = new DialogBot(conversationState, userState, dialog);
const dispatchbot = new DispatchBot();

// Create HTTP server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function() {
    console.log(`\n${ server.name } listening to ${ server.url }`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
});

// Listen for incoming activities and route them to your bot main dialog.
server.get('/', (req, res) => {
    res.send('hello')
})

server.post('/api/messages', (req, res) => {
    // Route received a request to adapter for processing
    adapter.processActivity(req, res, async (turnContext) => {
        // route to bot activity handler.
        await bot.run(turnContext);
        // await welcomebot.run(turnContext);
        // await dialogbot.run(turnContext);
        // await dispatchbot.run(turnContext);
    });
});
