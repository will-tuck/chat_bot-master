const { ActionTypes, ActivityHandler, CardFactory, MessageFactory  } = require('botbuilder');
const { QnAMaker } = require('botbuilder-ai');

class QnABot extends ActivityHandler {
    constructor() {
        super();

        try {
            this.qnaMaker = new QnAMaker({
                knowledgeBaseId: process.env.QnAKnowledgebaseId,
                endpointKey: process.env.QnAEndpointKey,
                host: process.env.QnAEndpointHostName
            });
        } catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }

        this.onMembersAdded(async (context, next) => {
            const membersAdded = context.activity.membersAdded;
            for (let cnt = 0; cnt < membersAdded.length; cnt++) {
                if (membersAdded[cnt].id !== context.activity.recipient.id) {
                    await context.sendActivity(
                        `Welcome to the Rollins Chat Group! Ask me a question and I will try to answer it.
                        \nIf you'd like to interact with the Rollins Bot, type the "rbot" command and one of the following phrases
                        \nEx. "rbot topic"
                        \n\u2022 Topic
                        \n\u2022 Admin`);
                }
            }

            await next();
        });

        
        this.onMessage(async (context, next) => {

            if (!process.env.QnAKnowledgebaseId || !process.env.QnAEndpointKey || !process.env.QnAEndpointHostName) {
                let unconfiguredQnaMessage = 'NOTE: \r\n' + 
                    'QnA Maker is not configured. To enable all capabilities, add `QnAKnowledgebaseId`, `QnAEndpointKey` and `QnAEndpointHostName` to the .env file. \r\n' +
                    'You may visit www.qnamaker.ai to create a QnA Maker knowledge base.'

                 await context.sendActivity(unconfiguredQnaMessage)
            }
            else {
                
                let text = context.activity.text.toLowerCase();

                if(text.includes("rbot") && !text.includes('bola')  && !text.includes('who is the admin') && !text.includes('ant') && !text.includes('roach')) {
                
                    let t = context._activity.text
                    
                    let u = t.replace('rbot', '')
                    context._activity.text = u
                    await console.log('Calling QnA Maker');
                    
        
                    const qnaResults = await this.qnaMaker.getAnswers(context);
                    
                
                    if (qnaResults[0]) {
                        let reply = MessageFactory.suggestedActions(qnaResults[0].context.prompts.map(prompt => {
                         return prompt.displayText;
                     }), qnaResults[0].answer);

                     await context.sendActivity(reply);
        
                    } else {
                        await context.sendActivity("I'm sorry, but I couldn't find an answer to that question. Can you please try again?" );
                    }
                } 

                else if(text.includes("rbot") && text.includes('bola') || text.includes("who is the admin")) {
                    this.bola(context)
                }

                else if(text.includes("rbot") && text.includes('ant')) {
                    this.ant(context)
                }
                else if(text.includes("rbot") && text.includes('roach')) {
                    this.roach(context)
                }
                
    
        }
            
            await next();
        });
    }




    async strola(context){
        const card = CardFactory.heroCard(
             'Meet Strola!',
             "He's the admin and leader of this learning group! ",
             ['https://iamge.com'],
             [
                 {
                    type: ActionTypes.OpenUrl,
                    title: 'Learn More About strola',
                    value: 'https://strola.com'
                
                 }
             ]
             
        );
        await context.sendActivity({ attachments: [card]});
        
    }

    async ant(context){
        const card = CardFactory.heroCard(
             'Ants',
             "They are really small",
             ['https://cdn.arstechnica.net/wp-content/uploads/2019/10/fastant1-800x536.jpg'],
             [
                 {
                    type: ActionTypes.OpenUrl,
                    title: 'Learn More',
                    value: 'https://www.learn.com'
                
                 }
             ]
             
        );
        await context.sendActivity({ attachments: [card]});
        
    }

    async roach(context){
        const card = CardFactory.heroCard(
             'Roaches',
             ['https://www.griffinpest.com/wp-content/uploads/2019/04/whats-that-roach.jpg'],
             [
                 {
                    type: ActionTypes.OpenUrl,
                    title: 'Learn More',
                    value: 'https://learn.com'
                
                 }
             ]
             
        );
        await context.sendActivity({ attachments: [card]});
        
    }


    
}

module.exports.QnABot = QnABot;
