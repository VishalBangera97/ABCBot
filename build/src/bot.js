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
exports.ConfBot = void 0;
const botbuilder_1 = require("botbuilder");
const botbuilder_dialogs_1 = require("botbuilder-dialogs");
const botActions_1 = require("./botActions");
const SuggestedActionsBot_1 = require("./SuggestedActionsBot");
class ConfBot extends botbuilder_1.ActivityHandler {
    constructor(qnaMaker) {
        super();
        this.qnaMaker = qnaMaker;
        this.conversationState = new botbuilder_1.ConversationState(new botbuilder_1.MemoryStorage());
        this.dialog = new botbuilder_dialogs_1.DialogSet(this.conversationState.createProperty('dialog'));
        this.suggestedBotActions = new SuggestedActionsBot_1.SuggestedActionsBot(this.dialog);
        this.botActions = new botActions_1.BotActions();
        this.suggestedBotActions.addDialogs();
        super.onMembersAdded((context, next) => __awaiter(this, void 0, void 0, function* () {
            yield this.botActions.clearClientId();
            yield context.sendActivity('Please Enter you Client Id');
            next();
        }));
        super.onMessage((context) => __awaiter(this, void 0, void 0, function* () {
            let dc = yield this.dialog.createContext(context);
            let result = yield dc.continueDialog();
            if (result.status == botbuilder_dialogs_1.DialogTurnStatus.complete || result.status == botbuilder_dialogs_1.DialogTurnStatus.waiting) {
                return yield this.conversationState.saveChanges(context);
            }
            yield this.message(dc, context, qnaMaker);
            yield this.conversationState.saveChanges(context);
        }));
    }
    message(dc, context, qnaMaker) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.activity.type === 'message') {
                return yield this.suggestedBotActions.onMessage(context, dc, qnaMaker);
            }
        });
    }
}
exports.ConfBot = ConfBot;
