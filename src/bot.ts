import { ActivityHandler, ConversationState, MemoryStorage, TurnContext } from "botbuilder";
import { QnAMaker } from "botbuilder-ai";
import { DialogContext, DialogSet, DialogTurnStatus } from "botbuilder-dialogs";
import { SuggestedActionsBot } from "./SuggestedActionsBot";

export class AbcBot extends ActivityHandler {
    private suggestedBotActions: SuggestedActionsBot;
    private conversationState: ConversationState;
    private dialog: DialogSet;

    constructor(private qnaMaker: QnAMaker) {
        super();
        this.conversationState = new ConversationState(new MemoryStorage());
        this.dialog = new DialogSet(this.conversationState.createProperty('dialog'));
        this.suggestedBotActions = new SuggestedActionsBot(this.dialog);
        this.suggestedBotActions.addDialogs();

        super.onMembersAdded(async (context: TurnContext, next) => {
            await this.suggestedBotActions.clearClientId();
            await context.sendActivity('Please Enter you Client ID');
            next();
        });

        super.onMessage(async (context: TurnContext) => {
            let dc = await this.dialog.createContext(context);
            let result = await dc.continueDialog();
            if (result.status == DialogTurnStatus.complete || result.status == DialogTurnStatus.waiting) {
                return await this.conversationState.saveChanges(context);
            }
            await this.message(dc, context, this.qnaMaker);
            await this.conversationState.saveChanges(context);
        });
    }
    async message(dc: DialogContext, context: TurnContext, qnaMaker: QnAMaker) {
        if (context.activity.type === 'message') {
            return await this.suggestedBotActions.onMessage(context, dc, qnaMaker);
        }
    }
}
