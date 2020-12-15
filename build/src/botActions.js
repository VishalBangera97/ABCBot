"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BotActions = void 0;
const botbuilder_1 = require("botbuilder");
const dotenv_1 = require("dotenv");
const backend_1 = require("./backend");
dotenv_1.config();
class BotActions {
    constructor() {
        this.backend = new backend_1.BackEndFunctions();
    }
    //Get All Active Client Accounts
    getAccounts(context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let accountResult = yield this.backend.accounts();
                let data = accountResult.data;
                if (context.activity.text === 'All Accounts') {
                    data.forEach((account) => __awaiter(this, void 0, void 0, function* () {
                        yield context.sendActivity('Account Number :' + account.accountNumber + '\r\n Account Type: ' + account.accountType.accountTypeName.toUpperCase() + '\r\n Balance: ' + account.balance);
                    }));
                    return yield this.moreHelp(context);
                }
                let flag = false;
                data.forEach((account) => __awaiter(this, void 0, void 0, function* () {
                    if (account.accountType.accountTypeName == context.activity.text) {
                        flag = true;
                        return yield context.sendActivity('Account Number :' + account.accountNumber + '\r\n Account Type: ' + account.accountType.accountTypeName.toUpperCase() + '\r\n Balance: ' + account.balance);
                    }
                }));
                if (!flag) {
                    yield context.sendActivity('No Accounts found !');
                }
            }
            catch (e) {
                yield context.sendActivity('No Accounts found !');
            }
            return yield this.moreHelp(context);
        });
    }
    //Gets the client details
    getMyDetails(context) {
        return __awaiter(this, void 0, void 0, function* () {
            let clientResult = yield this.backend.client();
            let data = clientResult.data;
            yield context.sendActivity('Name : ' + data.name + ',\r\n Phone Number : ' + data.phoneNumber + ',\r\n Email : ' + data.email.toLowerCase() + ',\r\n City : ' + data.cityName.toUpperCase());
            yield this.moreHelp(context);
        });
    }
    //Gets last 10 transactions of the client
    getLastTrasactions(context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let transactionResult = yield this.backend.lastTransactions(context.activity.text);
                let transactions = transactionResult.data;
                yield context.sendActivity('Your Last 10 Transactions are ');
                transactions.forEach((transaction) => __awaiter(this, void 0, void 0, function* () {
                    if (transaction.receiverName) {
                        yield context.sendActivity('Transaction Date : ' + new Date(transaction.date).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) + ',\r\n Amount :' + transaction.amount + ',\r\n Debit/Credit : DEBIT ,\r\n ReceiverName : ' + transaction.receiverName.toUpperCase());
                    }
                    else {
                        yield context.sendActivity('Transaction Date : ' + new Date(transaction.date).toLocaleString(undefined, { timeZone: 'Asia/Kolkata' }) + ',\r\n Amount :' + transaction.amount + ',\r\n Debit/Credit : CREDIT ,\r\n SenderName : ' + transaction.senderName.toUpperCase());
                    }
                }));
            }
            catch (e) {
                yield context.sendActivity('No Transactions found');
            }
            yield this.moreHelp(context);
        });
    }
    //Get All Accounts of the client : Active/Deactive/Applied/Denied/PDO
    getAllAccountStatusByClientId(context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let accountsResult = yield this.backend.getAllAccountStatusByClientId();
                let accounts = accountsResult.data;
                accounts.forEach((account) => __awaiter(this, void 0, void 0, function* () {
                    yield context.sendActivity('Account Number :' + account.accountNumber + '\r\n Account Type: ' + account.accountType.accountTypeName.toUpperCase() + '\r\n Status: ' + account.accountStatus.toUpperCase());
                }));
            }
            catch (e) {
                yield context.sendActivity('No Accounts Found');
            }
            return yield this.moreHelp(context);
        });
    }
    //Method to ask user if they need more help after every query solution
    moreHelp(context) {
        return __awaiter(this, void 0, void 0, function* () {
            const helps = [
                {
                    type: botbuilder_1.ActionTypes.PostBack,
                    title: 'Yes',
                    value: 'yes'
                },
                {
                    type: botbuilder_1.ActionTypes.PostBack,
                    title: 'No',
                    value: 'no'
                }
            ];
            var reply = botbuilder_1.MessageFactory.suggestedActions(helps, 'Do you need more help');
            yield context.sendActivity(reply);
        });
    }
}
exports.BotActions = BotActions;
