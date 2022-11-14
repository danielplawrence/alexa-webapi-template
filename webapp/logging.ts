import { Client } from "./interfaces";

export const ScreenLogger = (debugElement?: HTMLElement) => ({
    log(text: string): void {
        const textElement = document.createTextNode(`\n${JSON.stringify(text)}`);
        debugElement?.appendChild(textElement);
    }
});

// eslint-disable-next-line object-shorthand
export const SkillLogger = (client?: Client) => ({
    messages: [] as any[],
    timer: NaN,
    log(text: string): void {
        if (!client) {
            return;
        }
        this.messages.push({
            timestamp: new Date().toISOString(),
            message: text
        });
        if (!this.timer) {
            this.timer = window.setInterval(() => {
                if (this.messages.length) {
                    client.skill.sendMessage({
                        messageType: 'LogMessage',
                        messageBody: {
                            messages: this.messages
                        }
                    });
                    this.messages = [];
                }
            }, 1000);
        }
    }
});

export const Logger = (client?: Client, debugElement?: HTMLElement) => {
    const skillLogger = SkillLogger(client);
    const screenLogger = ScreenLogger(debugElement);
    return {
        log(text: string): void {
            screenLogger.log(text);
            skillLogger.log(text);
        }
    };
};
