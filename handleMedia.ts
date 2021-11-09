import { WASocket, downloadContentFromMessage } from "@adiwajshing/baileys-md";
import { makeParsableObj } from "./handleText";
import { writeFile } from "fs/promises";
import { removeBackgroundFromImageFile } from "remove.bg";
import SauceNAO from "saucenao";
import { createSticker } from "wa-sticker-formatter";
import path from "path";
import dotenv from 'dotenv';
dotenv.config();

const ffmpegInstaller = require("@ffmpeg-installer/ffmpeg");
const ffprobe = require("@ffprobe-installer/ffprobe");

const ffmpeg = require("fluent-ffmpeg")()
	.setFfprobePath(ffprobe.path)
	.setFfmpegPath(ffmpegInstaller.path);

function getPath(file) {
	return path.resolve(__dirname, "media", file);
}

const webpify = async (image, type = "full") => {
	let sticker;
	try {
		sticker = await createSticker(image, {
			type: type, //can be full or crop
			pack: "chimichangas",
			author: "Nagachika", // @ts-ignore
			categories: ["😅🤗😊😄🤓😂"],
		});
	} catch (e) {
		console.log(e);
	}
	return sticker;
};

export default async (sock: WASocket, msg: any) => {
	let convo = msg.message.extendedTextMessage?.text;
	if (!convo) return;
	if (!convo.startsWith("..")) return makeParsableObj(null);
	if (convo.startsWith(".. ")) convo = ".." + convo.slice(2).trim();
	convo = convo.toLowerCase();
	let temp = convo.split(" ");
	const command = temp[0];
	const args = temp.slice(1);

	let media = msg;
	temp = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
	if (!temp) return;

	if (Object.keys(msg.message).includes("extendedTextMessage")) {
		if (temp.imageMessage) media = temp.imageMessage;
		else if (temp.videoMessage) media = temp.videoMessage;
		else return;
	}

	let buffer = Buffer.from([]);

	if (temp.imageMessage) {
		const stream = await downloadContentFromMessage(
			temp.imageMessage,
			"image"
		);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		// save to file
		await writeFile("./media/media.jpeg", buffer);
	} else if (temp.videoMessage) {
		const stream = await downloadContentFromMessage(
			temp.videoMessage,
			"video"
		);
		for await (const chunk of stream) {
			buffer = Buffer.concat([buffer, chunk]);
		}
		// save to file
		await writeFile("./media/media.mp4", buffer);
	}

	switch (command) {
		case "..sticker":
		case "..stiker":
		case "..st":
			let typ = "full";
			let bufferSt: Buffer;
			let result: any;
			if (args.includes("crop")) typ = "crop";
			if (temp.imageMessage) {
				if (args.includes("nobg")) {
					const localFile = getPath("media.jpeg");
					const outputFile = getPath("rem.png");

					try {
						result = await removeBackgroundFromImageFile({
							path: localFile,
							apiKey: process.env.removeBgAPIKey,
							size: "regular",
							type: "auto",
							scale: "100%",
							outputFile,
						});

						bufferSt = await webpify(getPath("rem.png"), typ);
						return makeParsableObj({ sticker: bufferSt });
					} catch (e) {
						return makeParsableObj({ text: e.message });
					}
				}

				bufferSt = await webpify(getPath("media.jpeg"), typ);
				return makeParsableObj({ sticker: bufferSt });
			} else if (temp.videoMessage) {
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
				} catch (err) {
					console.log(err);
					return makeParsableObj({
						text: "❗ Video too big, try reducing the duration",
					});
				}
			} else {
				return makeParsableObj({
					text: "[❗] Write *!sticker* in reply (quoted) to an image/gif with the command.",
				});
			}

		case "..saucenao":
			let mySauce = new SauceNAO(
				"0cd9285c8d3eef58611adf19baa3e6acdccda450"
			);

			let arrSauce = [];

			if (!temp.imageMessage) {
				return makeParsableObj({ text: "Only Images are allowed!" });
			}

			let sauceResp: any;

			try {
				sauceResp = await mySauce("./media/media.jpeg").then(
					(resp, err) => resp.json
				);
			} catch (err) {
				return makeParsableObj({
					text: `❗ ${err.response.data.message}`,
				});
			}

			const fetchedResults = sauceResp.results;

			for (let item of fetchedResults) {
				if (item.data.source) {
					arrSauce.push(
						`${item.data.source} - ${item.header.similarity}%`
					);
				}
			}

			if (arrSauce) {
				return makeParsableObj({ text: `${arrSauce.join("\n")}` });
			} else {
				return makeParsableObj({ text: `No Results Found!` });
			}

		case "..delete":
			if (!msg.message.extendedTextMessage) return;

			await sock.sendMessage(msg.key.remoteJid, {
				delete: {
					remoteJid: msg.key.remoteJid,
					id: msg.message.extendedTextMessage.contextInfo.stanzaId,
					fromMe:
						msg.message.extendedTextMessage.contextInfo
							.participant == "917760317149@s.whatsapp.net",
					participant: msg.key?.participant || null,
				},
			});
			return;

		default:
			return;
	}
};
