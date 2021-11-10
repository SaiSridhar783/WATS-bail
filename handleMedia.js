"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const baileys_md_1 = require("@adiwajshing/baileys-md");
const handleText_1 = require("./handleText");
const promises_1 = require("fs/promises");
const remove_bg_1 = require("remove.bg");
const saucenao_1 = __importDefault(require("saucenao"));
const wa_sticker_formatter_1 = require("wa-sticker-formatter");
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");
const ffmpeg = require("fluent-ffmpeg")()
    .setFfprobePath(ffprobe.path)
    .setFfmpegPath(ffmpegInstaller.path);
function getPath(file) {
    return path_1.default.resolve(__dirname, "media", file);
}
const webpify = async (image, type = "full") => {
    let sticker;
    try {
        sticker = await (0, wa_sticker_formatter_1.createSticker)(image, {
            type: type,
            pack: "chimichangas",
            author: "Nagachika",
            categories: ["😅🤗😊😄🤓😂"],
        });
    }
    catch (e) {
        console.log(e);
    }
    return sticker;
};
exports.default = async (sock, msg) => {
    var _a, _b, _c, _d;
    let convo = (_a = msg.message.extendedTextMessage) === null || _a === void 0 ? void 0 : _a.text;
    if (!convo)
        return;
    if (!convo.startsWith(".."))
        return (0, handleText_1.makeParsableObj)(null);
    if (convo.startsWith(".. "))
        convo = ".." + convo.slice(2).trim();
    convo = convo.toLowerCase();
    let temp = convo.split(" ");
    const command = temp[0];
    const args = temp.slice(1);
    let media = msg;
    temp = (_c = (_b = msg.message.extendedTextMessage) === null || _b === void 0 ? void 0 : _b.contextInfo) === null || _c === void 0 ? void 0 : _c.quotedMessage;
    if (!temp)
        return;
    if (Object.keys(msg.message).includes("extendedTextMessage")) {
        if (temp.imageMessage)
            media = temp.imageMessage;
        else if (temp.videoMessage)
            media = temp.videoMessage;
        else
            return;
    }
    let buffer = Buffer.from([]);
    if (temp.imageMessage) {
        const stream = await (0, baileys_md_1.downloadContentFromMessage)(temp.imageMessage, "image");
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        // save to file
        await (0, promises_1.writeFile)("./media/media.jpeg", buffer);
    }
    else if (temp.videoMessage) {
        const stream = await (0, baileys_md_1.downloadContentFromMessage)(temp.videoMessage, "video");
        for await (const chunk of stream) {
            buffer = Buffer.concat([buffer, chunk]);
        }
        // save to file
        await (0, promises_1.writeFile)("./media/media.mp4", buffer);
    }
    switch (command) {
        case "..sticker":
        case "..stiker":
        case "..st":
            let typ = "full";
            let bufferSt;
            let result;
            if (args.includes("crop"))
                typ = "crop";
            if (temp.imageMessage) {
                if (args.includes("nobg")) {
                    const localFile = getPath("media.jpeg");
                    const outputFile = getPath("rem.png");
                    try {
                        result = await (0, remove_bg_1.removeBackgroundFromImageFile)({
                            path: localFile,
                            apiKey: process.env.removeBgAPIKey,
                            size: "regular",
                            type: "auto",
                            scale: "100%",
                            outputFile,
                        });
                        bufferSt = await webpify(getPath("rem.png"), typ);
                        return (0, handleText_1.makeParsableObj)({ sticker: bufferSt });
                    }
                    catch (e) {
                        return (0, handleText_1.makeParsableObj)({ text: e.message });
                    }
                }
                bufferSt = await webpify(getPath("media.jpeg"), typ);
                return (0, handleText_1.makeParsableObj)({ sticker: bufferSt });
            }
            else if (temp.videoMessage) {
                try {
                    ffmpeg
                        .input(getPath("media.mp4"))
                        .noAudio()
                        .setSize("512x512")
                        .output(getPath("sticker.webp"))
                        .on("end", async () => {
                        console.log("Finished");
                        return sock.sendMessage(msg.key.remoteJid, {
                            sticker: { url: getPath("sticker.webp") },
                        });
                    })
                        .on("error", (e) => console.log(e))
                        .run();
                    return;
                }
                catch (err) {
                    console.log(err);
                    return (0, handleText_1.makeParsableObj)({
                        text: "❗ Video too big, try reducing the duration",
                    });
                }
            }
            else {
                return (0, handleText_1.makeParsableObj)({
                    text: "[❗] Write *!sticker* in reply (quoted) to an image/gif with the command.",
                });
            }
        case "..saucenao":
            let mySauce = new saucenao_1.default("0cd9285c8d3eef58611adf19baa3e6acdccda450");
            let arrSauce = [];
            if (!temp.imageMessage) {
                return (0, handleText_1.makeParsableObj)({ text: "Only Images are allowed!" });
            }
            let sauceResp;
            try {
                sauceResp = await mySauce("./media/media.jpeg").then((resp, err) => resp.json);
            }
            catch (err) {
                return (0, handleText_1.makeParsableObj)({
                    text: `❗ ${err.response.data.message}`,
                });
            }
            const fetchedResults = sauceResp.results;
            for (let item of fetchedResults) {
                if (item.data.source) {
                    arrSauce.push(`${item.data.source} - ${item.header.similarity}%`);
                }
            }
            if (arrSauce) {
                return (0, handleText_1.makeParsableObj)({ text: `${arrSauce.join("\n")}` });
            }
            else {
                return (0, handleText_1.makeParsableObj)({ text: `No Results Found!` });
            }
        case "..delete":
            if (!msg.message.extendedTextMessage)
                return;
            await sock.sendMessage(msg.key.remoteJid, {
                delete: {
                    remoteJid: msg.key.remoteJid,
                    id: msg.message.extendedTextMessage.contextInfo.stanzaId,
                    fromMe: msg.message.extendedTextMessage.contextInfo
                        .participant == "917760317149@s.whatsapp.net",
                    participant: ((_d = msg.key) === null || _d === void 0 ? void 0 : _d.participant) || null,
                },
            });
            return;
        default:
            return;
    }
};
