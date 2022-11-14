import { Client, AlexaClientFactory } from './interfaces';
import { Logger } from './logging';

declare const Alexa: AlexaClientFactory;
let alexaClient: Client | undefined;

const debugElement = document.getElementById('debug-element') ?? undefined;
const logger = Logger(alexaClient, debugElement);

function messageReceivedCallback(message: never) {
    logger.log(message);
}

Alexa.create({ version: '1.1' })
    .then(args => {
        const { alexa } = args;
        alexaClient = alexa;
        alexaClient?.skill.onMessage(messageReceivedCallback);
        logger.log('Alexa is ready');
    })
    .catch(error => {
        logger.log(`Failed to initialize Alexa: ${JSON.stringify(error)}`);
    });
