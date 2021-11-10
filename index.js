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
const fs_1 = require("fs");
const pino_1 = __importDefault(require("pino"));
const baileys_md_1 = __importStar(require("@adiwajshing/baileys-md"));
const handleText_1 = __importDefault(require("./handleText"));
const establishConnection = async () => {
    let sock = undefined;
    // load authentication state from a file
    const loadState = () => {
        let state = undefined;
        try {
            const value = JSON.parse((0, fs_1.readFileSync)("./auth_info_multi.json", { encoding: "utf-8" }), baileys_md_1.BufferJSON.reviver);
            state = {
                creds: value.creds,
                // stores pre-keys, session & other keys in a JSON object
                // we deserialize it here
                keys: (0, baileys_md_1.initInMemoryKeyStore)(value.keys),
            };
        }
        catch (_a) { }
        return state;
    };
    // save the authentication state to a file
    const saveState = (state) => {
        console.log("saving pre-keys");
        state = state || (sock === null || sock === void 0 ? void 0 : sock.authState);
        (0, fs_1.writeFileSync)("./auth_info_multi.json", 
        // BufferJSON replacer utility saves buffers nicely
        JSON.stringify(state, baileys_md_1.BufferJSON.replacer, 2));
    };
    // start a connection
    const startSock = () => {
        const sock = (0, baileys_md_1.default)({
            logger: (0, pino_1.default)({ level: "silent" }),
            auth: loadState(),
            printQRInTerminal: true,
        });
        sock.ev.on("messages.upsert", async (m) => {
            const msg = m.messages[0];
            if (!msg.key.fromMe && m.type === "notify") {
                //console.log(JSON.stringify(m, undefined, 2));
                let word = msg.message.conversation ||
                    msg.message[Object.keys(msg.message)[0]].text ||
                    msg.message[Object.keys(msg.message)[0]].caption ||
                    "Audio Message";
                console.log(`Message Recieved from ${msg.pushName} - ${word}`);
                let { replyObj, optionsObj } = await (0, handleText_1.default)(sock, msg);
                if (!replyObj)
                    return;
                console.log("replying to", msg.key.remoteJid);
                sendMessageWTyping(msg, optionsObj, replyObj, msg.key.remoteJid);
            }
        });
        //sock.ev.on("messages.update", (m) => console.log(m));
        //sock.ev.on("chats.update", (m) => console.log(m));
        return sock;
    };
    const sendMessageWTyping = async (m, options, msg, jid) => {
        if (msg == null)
            return;
        await sock.presenceSubscribe(jid);
        await (0, baileys_md_1.delay)(500);
        await sock.sendPresenceUpdate("composing", jid);
        /* await delay(2000);

        await sock.sendPresenceUpdate("paused", jid); */
        await sock.sendMessage(jid, msg, { quoted: m, ...options });
    };
    sock = startSock();
    sock.ev.on("connection.update", (update) => {
        var _a, _b;
        const { connection, lastDisconnect } = update;
        if (connection === "close") {
            // reconnect if not logged out
            if (((_b = (_a = lastDisconnect.error) === null || _a === void 0 ? void 0 : _a.output) === null || _b === void 0 ? void 0 : _b.statusCode) !==
                baileys_md_1.DisconnectReason.loggedOut) {
                sock = startSock();
            }
            else {
                console.log("connection closed");
            }
        }
        console.log("connection update", update);
    });
    // listen for when the auth state is updated
    // it is imperative you save this data, it affects the signing keys you need to have conversations
    sock.ev.on("auth-state.update", () => saveState());
};
// For Deployment: Keep Alive
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.static(path_1.default.join(__dirname, "media")));
app.use(express_1.default.static(path_1.default.join(__dirname, "utils")));
app.use(express_1.default.static(path_1.default.join(__dirname, "static", "venus")));
app.use(express_1.default.static(path_1.default.join(__dirname, "static", "venus", "dist")));
app.get("/", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "static", "venus", "index.html"));
});
app.get("/group", (req, res) => {
    res.sendFile(path_1.default.join(__dirname, "utils", "groups.json"));
});
app.listen(process.env.PORT || 5002, function (err) {
    if (err)
        console.log(err);
    console.log("Server listening on PORT", process.env.PORT || 5002);
});
establishConnection();
