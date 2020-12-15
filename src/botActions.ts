import { ActionTypes, CardFactory, MessageFactory, TurnContext } from "botbuilder";
import { config } from "dotenv";
import { BackEndFunctions } from './backend';
import jwt = require('jsonwebtoken');
import apiConfig from '../apiConfig.json';

config();

export class BotActions {
    clientId = 2;
    private backend: BackEndFunctions;
    constructor() {
        this.backend = new BackEndFunctions();
    }

    //Set Client Id. The client id is encrypted as jwt and sent to backend to store in c# session
    async setClientId(context: TurnContext) {
        try {
            let token = jwt.sign({ id: context.activity.text }, apiConfig.jwt.secret_key);
            await this.backend.setClientId(token);
            await context.sendActivity('Thank you for entering your Client Id');
            const cardActions = [
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

            const cards = CardFactory.heroCard('How may I help you', undefined, cardActions)
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

    //Get All Active Client Accounts
    async getAccounts(context: TurnContext) {
        try {
            let accountResult = await this.backend.accounts();
            let data = accountResult.data;
            if (context.activity.text === 'All Accounts') {
                data.forEach(async (account: any) => {
                    await context.sendActivity('Account Number :' + account.accountNumber + '\r\n Account Type: ' + account.accountType.accountTypeName.toUpperCase() + '\r\n Balance: ' + account.balance);
                });
                return await this.moreHelp(context);
            }
            let flag = false;
            data.forEach(async (account: any) => {
                if (account.accountType.accountTypeName == context.activity.text) {
                    flag = true;
                    return await context.sendActivity('Account Number :' + account.accountNumber + '\r\n Account Type: ' + account.accountType.accountTypeName.toUpperCase() + '\r\n Balance: ' + account.balance);
                }
            });
            if (!flag) {
                await context.sendActivity('No Accounts found !');
            }
        } catch (e) {
            await context.sendActivity('No Accounts found !');
        }
        return await this.moreHelp(context);
    }

    //Unused Method
    async getAccount(context: TurnContext) {
        try {
            let accountResult = await this.backend.account('23');
            let data = accountResult.data;
            await context.sendActivity('Your Account Number is ' + data.accountNumber + '. This is a ' + data.accountType.accountTypeName);
            await context.sendActivity('Your account was opened on ' + data.accountOpenDate);
            await context.sendActivity('The current balance in your account is ' + data.balance);
        } catch (e) {
            await context.sendActivity('Please enter valid Account Number !')
        }
        await this.moreHelp(context);
    }

    //Unused Method
    async getAccountBalance(context: TurnContext) {
        try {
            let accountResult = await this.backend.account('214');
            let data = accountResult.data;
            context.sendActivity('Your Account Balance is ' + data.balance)
        } catch (e) {
            await context.sendActivity('Please enter valid Account Number !');
        }
        await this.moreHelp(context)
    }

    //Gets the client details
    async getMyDetails(context: TurnContext) {
        let clientResult = await this.backend.client();
        let data = clientResult.data;
        await context.sendActivity('Name : ' + data.name + ',\r\n Phone Number : ' + data.phoneNumber + ',\r\n Email : ' + data.email.toLowerCase() + ',\r\n City : ' + data.cityName.toUpperCase());
        await this.moreHelp(context);
    }

    //Gets last 10 transactions of the client
    async getLastTrasactions(context: TurnContext) {
        try {
            let transactionResult = await this.backend.lastTransactions(context.activity.text);
            let transactions = transactionResult.data;
            await context.sendActivity('Your Last 10 Transactions are ');
            transactions.forEach(async (transaction: any) => {
                if (transaction.receiverName) {
                    await context.sendActivity('Transaction Date : ' + new Date(transaction.date).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) + ',\r\n Amount :' + transaction.amount + ',\r\n Debit/Credit : DEBIT ,\r\n ReceiverName : ' + transaction.receiverName.toUpperCase());
                } else {
                    await context.sendActivity('Transaction Date : ' + new Date(transaction.date).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) + ',\r\n Amount :' + transaction.amount + ',\r\n Debit/Credit : CREDIT ,\r\n SenderName : ' + transaction.senderName.toUpperCase());
                }
            });

        } catch (e) {
            await context.sendActivity('No Transactions found');
        }
        await this.moreHelp(context)
    }

    //Get All Accounts of the client : Active/Deactive/Applied/Denied/PDO
    async getAllAccountStatusByClientId(context: TurnContext) {
        try {
            let accountsResult = await this.backend.getAllAccountStatusByClientId();
            let accounts = accountsResult.data;
            accounts.forEach(async (account: any) => {
                await context.sendActivity('Account Number :' + account.accountNumber + '\r\n Account Type: ' + account.accountType.accountTypeName.toUpperCase() + '\r\n Status: ' + account.accountStatus.toUpperCase());
            });
        } catch (e) {
            await context.sendActivity('No Accounts Found');
        }
        return await this.moreHelp(context);
    }


    //Method to ask user if they need more help after every query solution
    async moreHelp(context: TurnContext) {
        const helps = [
            {
                type: ActionTypes.PostBack,
                title: 'Yes',
                value: 'yes'
            },
            {
                type: ActionTypes.PostBack,
                title: 'No',
                value: 'no'
            }
        ];

        var reply = MessageFactory.suggestedActions(helps, 'Do you need more help');
        await context.sendActivity(reply)
    }

}