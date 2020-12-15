import { ActionTypes, MessageFactory, TurnContext } from "botbuilder";
import { BackEndFunctions } from './backend';

export class BotActions {
    private backend: BackEndFunctions;
    constructor() {
        this.backend = new BackEndFunctions();
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
        const help = [
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

        var reply = MessageFactory.suggestedActions(help, 'Do you need more help');
        await context.sendActivity(reply)
    }

}