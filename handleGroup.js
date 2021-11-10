"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const groups_json_1 = __importDefault(require("./utils/groups.json"));
const NSFW_json_1 = __importDefault(require("./utils/NSFW.json"));
const fs = __importStar(require("fs"));
const handleText_1 = require("./handleText");
async function handleGroup(sock, msg, command, args) {
    if (command == "..bot") {
        if (args[0] == "enable") {
            groups_json_1.default[msg.key.remoteJid] = true;
        }
        else if (args[0] == "disable") {
            delete groups_json_1.default[msg.key.remoteJid];
        }
        else {
            return (0, handleText_1.makeParsableObj)({
                text: "Invalid! Send enable or disable.",
            });
        }
        fs.writeFileSync("./utils/groups.json", JSON.stringify(groups_json_1.default, null, 2));
        if (groups_json_1.default[msg.key.remoteJid]) {
            return (0, handleText_1.makeParsableObj)({ text: "Bot enabled in this group!" });
        }
        else {
            return (0, handleText_1.makeParsableObj)({ text: "Bot disabled in this group!" });
        }
    }
    else if (command == "..togglensfw") {
        if (NSFW_json_1.default[msg.key.remoteJid]) {
            delete NSFW_json_1.default[msg.key.remoteJid];
        }
        else {
            NSFW_json_1.default[msg.key.remoteJid] = true;
        }
        fs.writeFileSync("./utils/NSFW.json", JSON.stringify(NSFW_json_1.default, null, 2));
        if (NSFW_json_1.default[msg.key.remoteJid])
            return (0, handleText_1.makeParsableObj)({ text: "NSFW enabled in this group!" });
        else
            return (0, handleText_1.makeParsableObj)({ text: "NSFW disabled in this group!" });
    }
    else {
        switch (command) {
            case "..invite":
                const code = await sock.groupInviteCode(msg.key.remoteJid);
                return (0, handleText_1.makeParsableObj)({
                    text: `https://chat.whatsapp.com/${code}`,
                });
            case "..add":
                await sock.groupParticipantsUpdate(msg.key.remoteJid, args.map((part) => `${part}@s.whatsapp.net`), "add");
                return (0, handleText_1.makeParsableObj)(null);
            case "..kick":
                await sock.groupParticipantsUpdate(msg.key.remoteJid, args.map((part) => `${part}@s.whatsapp.net`), "remove");
                return (0, handleText_1.makeParsableObj)(null);
            case "..makeadmin":
                await sock.groupParticipantsUpdate(msg.key.remoteJid, args.map((part) => `${part}@s.whatsapp.net`), "promote");
                return (0, handleText_1.makeParsableObj)(null);
            case "..unadmin":
                await sock.groupParticipantsUpdate(msg.key.remoteJid, args.map((part) => `${part}@s.whatsapp.net`), "demote" // replace this parameter with "remove", "demote" or "promote"
                );
                return (0, handleText_1.makeParsableObj)(null);
            default:
                return null;
        }
    }
}
exports.default = handleGroup;
