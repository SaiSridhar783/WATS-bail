import { readFileSync, writeFileSync } from "fs";
import P from "pino";
import { Boom } from "@hapi/boom";
import makeWASocket, {
	WASocket,
	AuthenticationState,
	DisconnectReason,
	AnyMessageContent,
	BufferJSON,
	initInMemoryKeyStore,
	delay,
} from "@adiwajshing/baileys-md";
import handleText from "./handleText";

const establishConnection = async () => {
	let sock: WASocket | undefined = undefined;
	// load authentication state from a file
	const loadState = () => {
		let state: AuthenticationState | undefined = undefined;
		try {
			const value = JSON.parse(
				readFileSync("./auth_info_multi.json", { encoding: "utf-8" }),
				BufferJSON.reviver
			);
			state = {
				creds: value.creds,
				// stores pre-keys, session & other keys in a JSON object
				// we deserialize it here
				keys: initInMemoryKeyStore(value.keys),
			};
		} catch {}
		return state;
	};
	// save the authentication state to a file
	const saveState = (state?: any) => {
		console.log("saving pre-keys");
		state = state || sock?.authState;
		writeFileSync(
			"./auth_info_multi.json",
			// BufferJSON replacer utility saves buffers nicely
			JSON.stringify(state, BufferJSON.replacer, 2)
		);
	};
	// start a connection
	const startSock = () => {
		const sock = makeWASocket({
			logger: P({ level: "silent" }),
			auth: loadState(),
			printQRInTerminal: true,
		});
		sock.ev.on("messages.upsert", async (m) => {
			const msg = m.messages[0];
			if (!msg.key.fromMe && m.type === "notify") {
				//console.log(JSON.stringify(m, undefined, 2));
				let word =
					msg.message.conversation ||
					msg.message[Object.keys(msg.message)[0]].text ||
					msg.message[Object.keys(msg.message)[0]].caption ||
					"Audio Message";
				console.log(`Message Recieved from ${msg.pushName} - ${word}`);
				let { replyObj, optionsObj } = await handleText(sock, msg);

				if (!replyObj) return;

				console.log("replying to", msg.key.remoteJid);
				sendMessageWTyping(
					msg,
					optionsObj,
					replyObj,
					msg.key.remoteJid!
				);
			}
		});

		//sock.ev.on("messages.update", (m) => console.log(m));
		//sock.ev.on("chats.update", (m) => console.log(m));
		return sock;
	};

	const sendMessageWTyping = async (
		m: any,
		options: object | null,
		msg: AnyMessageContent | null,
		jid: string
	) => {
		if (msg == null) return;

		await sock.presenceSubscribe(jid);
		await delay(500);

		await sock.sendPresenceUpdate("composing", jid);
		/* await delay(2000);

		await sock.sendPresenceUpdate("paused", jid); */
		await sock.sendMessage(jid, msg, { quoted: m, ...options });
	};

	sock = startSock();
	sock.ev.on("connection.update", (update) => {
		const { connection, lastDisconnect } = update;
		if (connection === "close") {
			// reconnect if not logged out
			if (
				(lastDisconnect.error as Boom)?.output?.statusCode !==
				DisconnectReason.loggedOut
			) {
				sock = startSock();
			} else {
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

import express from "express";
import path from "path";
const app = express();

app.use(express.static(path.join(__dirname, "media")));
app.use(express.static(path.join(__dirname, "utils")));
app.use(express.static(path.join(__dirname, "static", "venus")));
app.use(express.static(path.join(__dirname, "static", "venus", "dist")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "static", "venus", "index.html"));
});

app.get("/group", (req, res) => {
	res.json(path.join(__dirname, "groups.json"));
});

app.listen(process.env.PORT || 5002, function (err) {
	if (err) console.log(err);
	console.log("Server listening on PORT", process.env.PORT || 5002);
});

establishConnection();
