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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuggestedActionsBot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const backend_1 = require("./backend");
const botActions_1 = require("./botActions");
const apiConfig_json_1 = __importDefault(require("../apiConfig.json"));
class SuggestedActionsBot {
    constructor(dialog) {
        this.dialog = dialog;
        this.isClientIdSet = false;
        this.botActions = new botActions_1.BotActions();
        this.backend = new backend_1.BackEndFunctions();
        this.suggestedActions = [
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: '1.Get My Accounts',
                value: 'Get My Accounts'
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: '2.Last 10 Transaction Details',
                value: 'Last 10 Transaction Details',
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: '3.Forgot Password',
                value: 'Forgot Password',
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: '4.Account Status',
                value: 'Account Status'
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: '5.My Details',
                value: 'My Details'
            }
        ];
        //Dialogs
        this.cardActions = [
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: 'Savings Account',
                value: 'Savings Account'
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: 'Current Account',
                value: 'Current Account'
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: 'Recuring Account',
                value: 'Recuring Account'
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: 'FD Account',
                value: 'FD Account'
            },
            {
                type: botbuilder_1.ActionTypes.PostBack,
                title: 'All Accounts',
                value: 'All Accounts'
            }
        ];
    }
    onMessage(context, dc, qnaMaker) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.isClientIdSet) {
                switch (context.activity.text) {
                    case 'yes':
                        return yield this.sendSuggestedActions(context);
                    case 'no':
                        return yield this.endChat(context);
                    case 'Get My Accounts':
                        return dc.beginDialog('accounts');
                    case 'Last 10 Transaction Details':
                        return dc.beginDialog('transactions');
                    case 'Forgot Password':
                        return yield this.forgotPassword(qnaMaker, context);
                    case 'Account Status':
                        return dc.beginDialog('accountStatus');
                    case 'My Details':
                        return yield this.botActions.getMyDetails(context);
                    default:
                        yield context.sendActivity('Please select one of the below options');
                        return yield this.sendSuggestedActions(context);
                }
            }
            else {
                this.isClientIdSet = yield this.setClientId(context);
            }
        });
    }
    ;
    //sends suggested actions that the user can click
    sendSuggestedActions(turnContext) {
        return __awaiter(this, void 0, void 0, function* () {
            const cards = botbuilder_1.CardFactory.heroCard('How may I help you', [], this.suggestedActions);
            const message = botbuilder_1.MessageFactory.attachment(cards);
            yield turnContext.sendActivity(message);
        });
    }
    //redirects to qna when user clicks on forgot password
    forgotPassword(qnaMaker, context) {
        return __awaiter(this, void 0, void 0, function* () {
            let qnaResults = yield qnaMaker.getAnswers(context);
            if (qnaResults.length > 0) {
                yield context.sendActivity(qnaResults[0].answer);
                return yield this.botActions.moreHelp(context);
            }
        });
    }
    //End a chat when user clicks on end chat
    endChat(context) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.clearClientId();
            this.isClientIdSet = false;
            yield context.sendActivity('Thank you using Chat Bot !');
        });
    }
    //Set Client Id. The client id is encrypted as jwt and sent to backend to store in c# session
    setClientId(context) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let token = jsonwebtoken_1.default.sign({ id: context.activity.text }, apiConfig_json_1.default.jwt.secret_key);
                yield this.backend.setClientId(token);
                yield context.sendActivity('Thank you for entering your Client Id');
                const cards = botbuilder_1.CardFactory.heroCard('How may I help you', undefined, this.suggestedActions);
                const message = botbuilder_1.MessageFactory.attachment(cards);
                yield context.sendActivity(message);
                return true;
            }
            catch (e) {
                yield context.sendActivity('Please enter a valid Client Id');
                return false;
            }
        });
    }
    //Clear client id stored in C# session when user closes the chat
    clearClientId() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.backend.clearClientId();
        });
    }
    addDialogs() {
        this.dialog.add(new botbuilder_dialogs_1.WaterfallDialog('accounts', [
            (step) => __awaiter(this, void 0, void 0, function* () {
                let cards = botbuilder_1.CardFactory.heroCard('Select Account', [], this.cardActions);
                let message = botbuilder_1.MessageFactory.attachment(cards);
                return yield step.prompt('accountType', message);
            }),
            (step) => __awaiter(this, void 0, void 0, function* () {
                yield this.botActions.getAccounts(step.context);
                return yield step.endDialog();
            })
        ]));
        this.dialog.add(new botbuilder_dialogs_1.WaterfallDialog('transactions', [
            (step) => __awaiter(this, void 0, void 0, function* () {
                let cards = botbuilder_1.CardFactory.heroCard('Select Account', [], this.cardActions);
                let message = botbuilder_1.MessageFactory.attachment(cards);
                return yield step.prompt('accountType', message);
            }),
            (step) => __awaiter(this, void 0, void 0, function* () {
                yield this.botActions.getLastTrasactions(step.context);
                return yield step.endDialog();
            })
        ]));
        this.dialog.add(new botbuilder_dialogs_1.WaterfallDialog('accountStatus', [
            (step) => __awaiter(this, void 0, void 0, function* () {
                yield this.botActions.getAllAccountStatusByClientId(step.context);
                return yield step.endDialog();
            })
        ]));
        this.dialog.add(new botbuilder_dialogs_1.TextPrompt('accountType'));
    }
}
exports.SuggestedActionsBot = SuggestedActionsBot;
