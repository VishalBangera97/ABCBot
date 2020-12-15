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
const botbuilder_1 = require("botbuilder");
const express_1 = __importDefault(require("express"));
const botbuilder_ai_1 = require("botbuilder-ai");
const bot_1 = require("./src/bot");
const apiConfig_json_1 = __importDefault(require("./apiConfig.json"));
const app = express_1.default();
var adapter = new botbuilder_1.BotFrameworkAdapter({
    appId: undefined
});
var qnaMaker = new botbuilder_ai_1.QnAMaker({
    knowledgeBaseId: apiConfig_json_1.default.qna.KB_ID,
    endpointKey: apiConfig_json_1.default.qna.QNA_MAKER_ENDPOINT_KEY,
    host: apiConfig_json_1.default.qna.HOST
});
const bot = new bot_1.ConfBot(qnaMaker);
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, (context) => __awaiter(void 0, void 0, void 0, function* () {
        yield bot.run(context);
    }));
});
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log('Port is', port);
});
