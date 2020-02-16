
const { ActionTypes, ActivityHandler, CardFactory } = require('botbuilder');

const WELCOMED_USER = 'welcomedUserProperty';

class WelcomeBot extends ActivityHandler {

    constructor(userState) {
        super();

        this.welcomedUserProperty = userState.createProperty(WELCOMED_USER);

        this.userState = userState;

        this.onMessage(async (context, next) => {

            const didBotWelcomedUser = await this.welcomedUserProperty.get(context, false);

            
            if (didBotWelcomedUser === false) {
                
                const userName = context.activity.from.name;
                
                await this.welcomedUserProperty.set(context, true);
            } else {
           
               
                const text = context.activity.text.toLowerCase();

                switch (text) {
                case 'hello':
                case 'hi':
                    await context.sendActivity(`You said "${ context.activity.text }"`);
                    break;
                case 'intro':
                await this.sendIt(context);
                    break;
                case 'help':

                    await this.sendIntroCard(context);
                    break;
                }
            }

            
            await next();
        });

        // Sends welcome messages to conversation members when they join the conversation.
        // Messages are only sent to conversation members who aren't the bot.
        this.onMembersAdded(async (context, next) => {
            const userName = context.activity.from.name;
            for (const idx in context.activity.membersAdded) {
                
                if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                    await context.sendActivity(`Welcome to the Rollins Chat Group ${ userName }.`)
                    
                }
            }

           
            await next();
        });
    }

   
    async run(context) {    
        await super.run(context);

        // Save state changes
        await this.userState.saveChanges(context);
        }






    async sendIt(context){   
        const card = CardFactory.heroCard(
            'Welcome to the Rollns Chat Group!',
            'This is a great place to ask questions and engage in menaingful dialog during your in the field training.',
            ['https://aka.ms/bf-welcome-card-image'],
            [
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Who are the administrators?',
                    value: 'https://docs.microsoft.com/en-us/azure/bot-service/?view=azure-bot-service-4.0'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Where can I find the frequently asked questions?',
                    value: 'https://stackoverflow.com/'
                },
                {
                    type: ActionTypes.OpenUrl,
                    title: 'Which office ?',
                    value: 'Atlanta!'
                }
            ]
        );

        await context.sendActivity({ attachments: [card] });
    }


}


module.exports.WelcomeBot = WelcomeBot;
