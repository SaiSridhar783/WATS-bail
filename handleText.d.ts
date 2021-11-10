import { AnyMessageContent, MiscMessageGenerationOptions, WASocket } from "@adiwajshing/baileys-md";
export declare const makeParsableObj: (a: AnyMessageContent | null, b?: MiscMessageGenerationOptions | object) => {
    replyObj: AnyMessageContent;
    optionsObj: object | MiscMessageGenerationOptions;
};
declare const _default: (sock: WASocket, msg: any) => Promise<{
    replyObj: AnyMessageContent;
    optionsObj: object | MiscMessageGenerationOptions;
}>;
export default _default;
