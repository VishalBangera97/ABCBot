import { BotFrameworkAdapter } from 'botbuilder';
import express from 'express';
import { QnAMaker } from 'botbuilder-ai';
import { ConfBot } from './src/bot';
import config from './apiConfig.json';

const app = express()

var adapter = new BotFrameworkAdapter({
    appId: undefined
});

var qnaMaker = new QnAMaker({
    knowledgeBaseId: config.qna.KB_ID,
    endpointKey: config.qna.QNA_MAKER_ENDPOINT_KEY,
    host: config.qna.HOST
});

const bot = new ConfBot(qnaMaker);

app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});



const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Port is', port)
});


