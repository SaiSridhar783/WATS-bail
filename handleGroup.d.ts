import { WASocket } from "@adiwajshing/baileys-md";
export default function handleGroup(sock: WASocket, msg: any, command: string, args: string[]): Promise<{
    replyObj: import("@adiwajshing/baileys-md").AnyMessageContent;
    optionsObj: object | import("@adiwajshing/baileys-md").MiscMessageGenerationOptions;
}>;
