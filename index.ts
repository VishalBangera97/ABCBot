import { BotFrameworkAdapter } from 'botbuilder';
import express from 'express';
import { QnAMaker } from 'botbuilder-ai';
import { AbcBot } from './src/bot';
import config from './apiConfig.json';
import { sqlQuery } from './src/queryExecutor';

const app = express();

// Setting up Bot Framework Adaptor
var adapter = new BotFrameworkAdapter({
    appId: undefined,
    appPassword: undefined
});

// Setting Up QNA Maker
var qnaMaker = new QnAMaker({
    knowledgeBaseId: config.qna.KB_ID,
    endpointKey: config.qna.QNA_MAKER_ENDPOINT_KEY,
    host: config.qna.HOST
});

const bot = new AbcBot(qnaMaker);

// To process request from Bot Emulator
app.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        await bot.run(context);
    });
});

// To execute a SQL Query at localhost:3000/{Query}
app.get('/:sqlQuery', async (req, res) => {
    try {
        let response = await sqlQuery(req.params.sqlQuery);
        res.send(response);
    } catch (e) {
        res.send(e);
    }
});

const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log('Port is', port)
});








