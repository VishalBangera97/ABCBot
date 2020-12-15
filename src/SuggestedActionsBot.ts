import { ActionTypes, CardFactory, MessageFactory, TurnContext } from 'botbuilder';
import { QnAMaker } from 'botbuilder-ai';
import { DialogContext, DialogSet, TextPrompt, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import jwt from 'jsonwebtoken';
import { BackEndFunctions } from './backend';
import { BotActions } from './botActions';
import config from '../apiConfig.json';


export class SuggestedActionsBot {

    private isClientIdSet = false;
    private botActions = new BotActions();
    private backend = new BackEndFunctions();

    constructor(private dialog: DialogSet) {
    }

    async onMessage(context: TurnContext, dc: DialogContext, qnaMaker: QnAMaker) {
        if (this.isClientIdSet) {
            switch (context.activity.text) {
                case 'yes':
                    return await this.sendSuggestedActions(context);

                case 'no':
                    return await this.endChat(context);

                case 'Get My Accounts':
                    return dc.beginDialog('accounts');

                case 'Last 10 Transaction Details':
                    return dc.beginDialog('transactions');

                case 'Forgot Password':
                    return await this.forgotPassword(qnaMaker, context);

                case 'Account Status':
                    return dc.beginDialog('accountStatus');

                case 'My Details':
                    return await this.botActions.getMyDetails(context);

                default:
                    await context.sendActivity('Please select one of the below options');
                    return await this.sendSuggestedActions(context);

            }
        }
        else {
            this.isClientIdSet = await this.setClientId(context);
        }
    };


    private suggestedActions = [
        {
            type: ActionTypes.PostBack,
            title: '1.Get My Accounts',
            value: 'Get My Accounts'
        },
        {
            type: ActionTypes.PostBack,
            title: '2.Last 10 Transaction Details',
            value: 'Last 10 Transaction Details',

        },
        {
            type: ActionTypes.PostBack,
            title: '3.Forgot Password',
            value: 'Forgot Password',
        },
        {
            type: ActionTypes.PostBack,
            title: '4.Account Status',
            value: 'Account Status'
        },
        {
            type: ActionTypes.PostBack,
            title: '5.My Details',
            value: 'My Details'
        }
    ];

    //sends suggested actions that the user can click
    async sendSuggestedActions(turnContext: TurnContext) {
        const cards = CardFactory.heroCard('How may I help you', [], this.suggestedActions)
        const message = MessageFactory.attachment(cards);
        await turnContext.sendActivity(message);

    }

    //redirects to qna when user clicks on forgot password
    async forgotPassword(qnaMaker: QnAMaker, context: TurnContext) {
        let qnaResults = await qnaMaker.getAnswers(context);
        if (qnaResults.length > 0) {
            await context.sendActivity(qnaResults[0].answer);
            return await this.botActions.moreHelp(context);
        }
    }

    //End a chat when user clicks on end chat
    async endChat(context: TurnContext) {
        await this.clearClientId();
        this.isClientIdSet = false;
        await context.sendActivity('Thank you using Chat Bot !');
    }

    //Set Client Id. The client id is encrypted as jwt and sent to backend to store in c# session
    async setClientId(context: TurnContext) {
        try {
            let token = jwt.sign({ id: context.activity.text }, config.jwt.secret_key);
            await this.backend.setClientId(token);
            await context.sendActivity('Thank you for entering your Client Id');
            const cards = CardFactory.heroCard('How may I help you', undefined, this.suggestedActions)
            const message = MessageFactory.attachment(cards);
            await context.sendActivity(message);
            return true;
        } catch (e) {
            await context.sendActivity('Please enter a valid Client Id');
            return false;
        }
    }

    //Clear client id stored in C# session when user closes the chat
    async clearClientId() {
        await this.backend.clearClientId();
    }


    //Dialogs
    cardActions = [
        {
            type: ActionTypes.PostBack,
            title: 'Savings Account',
            value: 'Savings Account'
        },
        {
            type: ActionTypes.PostBack,
            title: 'Current Account',
            value: 'Current Account'
        },
        {
            type: ActionTypes.PostBack,
            title: 'Recuring Account',
            value: 'Recuring Account'
        },
        {
            type: ActionTypes.PostBack,
            title: 'FD Account',
            value: 'FD Account'
        },
        {
            type: ActionTypes.PostBack,
            title: 'All Accounts',
            value: 'All Accounts'
        }
    ];

    addDialogs() {
        this.dialog.add(new WaterfallDialog('accounts', [
            async (step: WaterfallStepContext) => {
                let cards = CardFactory.heroCard('Select Account', [], this.cardActions);
                let message = MessageFactory.attachment(cards);
                return await step.prompt('accountType', message);
            },

            async (step: WaterfallStepContext) => {
                await this.botActions.getAccounts(step.context);
                return await step.endDialog();
            }

        ]));

        this.dialog.add(new WaterfallDialog('transactions', [
            async (step: WaterfallStepContext) => {
                let cards = CardFactory.heroCard('Select Account', [], this.cardActions);
                let message = MessageFactory.attachment(cards);
                return await step.prompt('accountType', message);
            },
            async (step: WaterfallStepContext) => {
                await this.botActions.getLastTrasactions(step.context);
                return await step.endDialog();
            }

        ]));

        this.dialog.add(new WaterfallDialog('accountStatus', [
            async (step: WaterfallStepContext) => {
                await this.botActions.getAllAccountStatusByClientId(step.context);
                return await step.endDialog();
            }
        ]));

        this.dialog.add(new TextPrompt('accountType'));
    }

}

