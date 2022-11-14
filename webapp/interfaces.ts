export interface AlexaClientFactory {
    create(args: any): Promise<any>;
}
type AnyFunction = (...args: any[]) => any;
export interface Skill {
    onMessage(messageReceivedCallback: AnyFunction): void;
    sendMessage(message: any): void;
}
export interface Client {
    skill: Skill;
}
