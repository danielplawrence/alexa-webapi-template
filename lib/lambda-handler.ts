import { env } from 'process';

import {
    ErrorHandler,
    HandlerInput,
    RequestHandler,
    SkillBuilders,
} from 'ask-sdk-core';
import {
    Response,
    SessionEndedRequest,
} from 'ask-sdk-model';

const LaunchRequestHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    async handle(handlerInput: HandlerInput): Promise<Response> {
        return handlerInput.responseBuilder
            .addDirective({
                type: 'Alexa.Presentation.HTML.Start',
                request: {
                    uri: `https://${env.WEBAPP_ORIGIN}`,
                    method: 'GET'
                },
                configuration: {
                    'timeoutInSeconds': 300
                }
            })
            .getResponse();
    },
};

const EchoIntentHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'EchoIntent');
    },
    async handle(handlerInput: HandlerInput): Promise<Response> {
        return handlerInput.responseBuilder
            .addDirective({
                'type': 'Alexa.Presentation.HTML.HandleMessage',
                'message': {
                    ...handlerInput.requestEnvelope.request
                }
            })
            .getResponse();
    }
};

const CancelAndStopIntentHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest' &&
            (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent' ||
                handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent');
    },
    async handle(handlerInput: HandlerInput): Promise<Response> {
        const { attributesManager } = handlerInput;
        attributesManager.setPersistentAttributes({ lastAccessedDate: Date.now(), lastAccessedIntent: 'Cancel or Stop Intent' });
        await attributesManager.savePersistentAttributes();
        const speechText = 'Goodbye!';
        return handlerInput.responseBuilder
            .speak(speechText)
            .withSimpleCard('Hello World', speechText)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const LoggingRequestHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === 'Alexa.Presentation.HTML.Message' &&
        handlerInput.requestEnvelope.request.message.messageType === 'LogMessage';
    },
    handle(handlerInput: HandlerInput): Response {
        const messages: any[] = (handlerInput.requestEnvelope.request as any).message.messageBody.messages;
        messages.forEach(value => {
            const message = value.message;
            const timestamp = value.timestamp;
            console.log(`UI Logger: ${timestamp}: ${JSON.stringify(message)}`);
        });
        return handlerInput.responseBuilder.getResponse();
    },
};

const SessionEndedRequestHandler: RequestHandler = {
    canHandle(handlerInput: HandlerInput): boolean {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput: HandlerInput): Response {
        console.log(`Session ended with reason: ${(handlerInput.requestEnvelope.request as SessionEndedRequest).reason}`);
        return handlerInput.responseBuilder.getResponse();
    },
};

const BasicErrorHandler: ErrorHandler = {
    canHandle(_handlerInput: HandlerInput, _error: Error): boolean {
        return true;
    },
    handle(handlerInput: HandlerInput, error: Error): Response {
        console.log(`Error handled: ${error.message}`);
        return handlerInput.responseBuilder
            .speak('Sorry, I can\'t understand the command. Please say again.')
            .reprompt('Sorry, I can\'t understand the command. Please say again.')
            .getResponse();
    },
};

const RequestInterceptor = {
    process(handlerInput: HandlerInput) {
        console.log(`Request: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};

const ResponseInterceptor = {
    process(handlerInput: HandlerInput) {
        console.log(`Response: ${JSON.stringify(handlerInput.requestEnvelope)}`);
    }
};

exports.handler = SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        EchoIntentHandler,
        LoggingRequestHandler,
        CancelAndStopIntentHandler,
        SessionEndedRequestHandler,
    )
    .addRequestInterceptors(RequestInterceptor, ResponseInterceptor)
    .addErrorHandlers(BasicErrorHandler)
    .lambda();
