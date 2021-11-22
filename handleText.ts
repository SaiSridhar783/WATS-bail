import {
	AnyMessageContent,
	MiscMessageGenerationOptions,
	WASocket,
	WA_DEFAULT_EPHEMERAL,
} from "@adiwajshing/baileys-md";
import * as fs from "fs";
import groups from "./utils/groups.json";
import nsfw_ from "./utils/NSFW.json";
import * as help from "./utils/help.js";
import handleMedia from "./handleMedia";
import handleGroup from "./handleGroup";
import { inu } from "./utils/inu.json";
import husbu from "./utils/husbu.json";
import axios from "axios";
import solenolyrics from "solenolyrics";
import ud from "urban-dictionary";
import tts from "node-gtts";
import * as animeJS from "@freezegold/anime.js";
import malScraper from "mal-scraper";
import nameToImdb from "name-to-imdb";
import { getByID } from "node-movie";
import { get } from "reddit-grabber";
import randomanime from "random-anime";
const anime = randomanime.anime();
const nsfwanime = randomanime.nsfw();

export const makeParsableObj = (
	a: AnyMessageContent | null,
	b: MiscMessageGenerationOptions | object = {}
) => {
	return {
		replyObj: a,
		optionsObj: b,
	};
};

export default async (sock: WASocket, msg: any) => {
	if (
		Object.keys(msg.message).includes("imageMessage") ||
		Object.keys(msg.message).includes("videoMessage") ||
		Object.keys(msg.message).includes("extendedTextMessage")
	) {
		let res = await handleMedia(sock, msg);
		if (res) return res;

		return makeParsableObj(null);
	}

	let convo = msg.message.conversation;
	if (!convo) return makeParsableObj(null);
	if (!convo.startsWith("..")) return makeParsableObj(null);
	if (convo.startsWith(".. ")) convo = ".." + convo.slice(2).trim();
	convo = convo.toLowerCase();
	let temp = convo.split(" ");
	const command = temp[0];
	const args = temp.slice(1);

	const isGroupMsg = msg.key.remoteJid.includes("-");
	let isGroupYes = groups[msg.key.remoteJid];
	let isNSFW = nsfw_[msg.key.remoteJid];

	if (isGroupMsg) {
		//fs.writeFileSync("group.json", JSON.stringify(msg, undefined, 2));
		const res = await handleGroup(sock, msg, command, args);
		isGroupYes = groups[msg.key.remoteJid];
		isNSFW = nsfw_[msg.key.remoteJid];
		if (res) {
			return res;
		}
	}

	if (isGroupMsg && !isGroupYes) {
		return makeParsableObj(null);
	}

	switch (command) {
		case "..help":
			return makeParsableObj({ text: help.help });

		case "..anihelp":
			return makeParsableObj({ text: help.anihelp });

		case "..nsfwhelp":
			if (isGroupMsg && !isNSFW)
				return makeParsableObj({ text: "🔞 NSFW not enabled!" });
			return makeParsableObj({ text: help.nsfwhelp });

		case "..info":
			return makeParsableObj({ text: help.info }, { detectLinks: true });

		case "..inu":
			return makeParsableObj({
				image: { url: inu[Math.floor(Math.random() * inu.length)] },
				caption: "🐕",
			});

		case "..husbu":
			const rindIndix = Math.floor(Math.random() * husbu.length);
			const rindKiy = husbu[rindIndix];
			return makeParsableObj({
				image: { url: rindKiy.image },
				caption: rindKiy.teks,
			});

		case "..neko":
			let q2 = Math.floor(Math.random() * 900) + 300;
			let q3 = Math.floor(Math.random() * 900) + 300;

			return makeParsableObj({
				image: { url: "http://placekitten.com/" + q3 + "/" + q2 },
				caption: "🐈",
			});

		case "..quote":
			let resp: any;
			try {
				resp = await axios.get("https://api.quotable.io/random");
			} catch (e) {}

			if (!resp)
				return makeParsableObj({ text: "Something Went wrong..." });

			return makeParsableObj({
				text: `*${resp.data.content}*\n\t\t\t~${resp.data.author}`,
			});

		case "..lyrics":
			if (args.length === 0)
				return makeParsableObj({
					text: "Send command *!lyrics [song]*",
				});
			const song = convo.slice(9);

			const lirik = await solenolyrics.requestLyricsFor(song);
			return makeParsableObj({ text: lirik });

		case "..wiki":
			if (args.length === 0)
				return makeParsableObj({
					text: "Use like this *!wiki [query]*\n",
				});

			const query_ = convo.slice(6);
			let wiki: any;
			try {
				wiki = await axios.get(
					`https://apis.ccbp.in/wiki-search?search=${query_}`
				);
			} catch (e) {
				return makeParsableObj({ text: "Something went wrong..." });
			}

			if (wiki.data.search_results?.length <= 1) {
				return makeParsableObj({
					text: "*Error ❗* Please try better keywords",
				});
			} else {
				return makeParsableObj({
					text: `➸ *Query* : ${query_}\n\n➸ *Result* : ${wiki.data.search_results[0].description}\n\n➸ *Query* : ${query_}\n\n➸ *Result* : ${wiki.data.search_results[1].description}`,
				});
			}

		case "..animequote":
			let q: any;
			try {
				q = await axios.get("https://animechan.vercel.app/api/random");
			} catch (e) {
				return makeParsableObj({ text: "Something went wrong..." });
			}

			return makeParsableObj({
				text: `"${q.data.quote}" - *${q.data.character}*, _${q.data.anime}_`,
			});

		case "..insult":
			let insult: any;
			try {
				insult = await axios.get(
					"https://evilinsult.com/generate_insult.php?lang=en&type=json"
				);
			} catch (e) {
				return makeParsableObj({ text: "Something went wrong..." });
			}

			return makeParsableObj({ text: insult.data.insult });

		case "..urban":
			if (args.length === 0)
				return makeParsableObj({
					text: "Send command *!urban [word]*",
				});
			const urbu = convo.slice(8);

			if (urbu.trim() == "random") {
				let udRe: any;
				try {
					udRe = await ud.random();
				} catch (e) {}

				if (!udRe) {
					return makeParsableObj({ text: "Something went wrong..." });
				} else {
					let objk = udRe.length;
					let xyz = udRe[Math.floor(Math.random() * objk)];
					return makeParsableObj({
						text: `➸ ${xyz.definition}\n\n"${xyz.example}"`,
					});
				}
			} else {
				let udRes: any;
				try {
					udRes = await ud.define(urbu);
				} catch (e) {}

				if (!udRes) {
					return makeParsableObj({ text: "Something went wrong..." });
				} else {
					let objk = udRes.length;
					let xyz = udRes[Math.floor(Math.random() * objk)];
					return makeParsableObj({
						text: `➸ ${xyz.definition}\n\n"${xyz.example}"`,
					});
				}
			}

		case "..def":
			let bod = convo.slice(5);
			if (bod.length == 0) {
				return makeParsableObj({ text: "Send command *!def [word]*" });
			}

			const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${bod}`;

			let defy: any;
			try {
				defy = await axios.get(url);
			} catch (e) {
				return makeParsableObj({ text: "Meaning not found..." });
			}

			return makeParsableObj({
				text: defy.data[0].meanings[0].definitions[0].definition,
			});

		case "..tts":
			if (args.length === 0)
				return makeParsableObj({
					text: "Syntax *!tts [en, hi, jp,..] [text]*, try *!tts en Hello*\nwhere en=english, hi=hindi, jp=japanese, etc.",
				});

			const dataText = convo.slice(9);
			if (dataText === "")
				return makeParsableObj({ text: "Didn't get you" });
			if (dataText.length > 500)
				return makeParsableObj({ text: "❗ Text is too long!" });
			let dataBhs = args[0].toLowerCase();
			let tts2: any;

			try {
				tts2 = tts(dataBhs);
				await tts2.save("./media/tts.mp3", dataText, function () {
					return;
				});
				return makeParsableObj(
					{
						audio: { url: "./media/tts.mp3" },
						mimetype: "audio/mp4",
						pttAudio: true,
					},
					{ url: "./media/tts.mp3", ptt: true }
				);
			} catch (err) {
				return makeParsableObj({ text: err.response.data.message });
			}

		case "..joke":
			let jo: any;

			try {
				jo = await axios({
					method: "GET",
					url: "https://dad-jokes.p.rapidapi.com/random/joke",
					headers: {
						"x-rapidapi-host": "dad-jokes.p.rapidapi.com",
						"x-rapidapi-key":
							"a12c126f59msh3ed700a0cf162d8p1a58dejsn17edd60becf1",
					},
				});
			} catch (e) {
				console.log(e);
				return makeParsableObj({ text: "Something went wrong..." });
			}

			return makeParsableObj({
				text: `${jo.data.body[0].setup}\n*${jo.data.body[0].punchline}*`,
			});

		case "..dankjoke":
			if (isGroupMsg && !isNSFW)
				return makeParsableObj({ text: "🔞 NSFW not enabled!" });

			let dank: any;
			try {
				dank = await axios.get("https://v2.jokeapi.dev/joke/dark");
			} catch (e) {
				return makeParsableObj({ text: "Something went wrong..." });
			}

			if (dank.data.setup) {
				return makeParsableObj({
					text: `${dank.data.setup}\n\n_${dank.data.delivery}_`,
				});
			} else {
				return makeParsableObj({ text: dank.data.joke });
			}

		case "..manga":
			const mangasearch = convo.slice(8);
			let manga: any;
			try {
				manga = await animeJS.mangaSearch(mangasearch, "max");
			} catch (err) {
				return makeParsableObj({ text: "Something went wrong..." });
			}

			let data = manga[0].attributes;
			const messageMan = ` *➸ Title* - ${data.titles.en}\n\n *➸ Synopsis* - ${data.synopsis}\n\n *➸ Volumes* - ${data.volumeCount}\n\n *➸ Rated For* - ${data.ageRating}, ${data.ageRatingGuide}\n\n *➸ Rating* - ${data.averageRating}`;

			return makeParsableObj({
				image: { url: data.posterImage.original },
				caption: messageMan,
			});

		case "..mal":
			if (args.length === 0)
				return makeParsableObj({ text: "Send command *!mal [anime]*" });
			const anisearch = convo.slice(6);

			let MAL: any;
			try {
				MAL = await malScraper.getInfoFromName(anisearch);
			} catch (err) {
				return makeParsableObj({
					text: `❗ ${err.response.data.message}`,
				});
			}

			const messageMal = ` *➸ Title* - ${MAL.title}\n\n *➸ Synopsis* - ${
				MAL.synopsis
			}\n\n *➸ Episodes* - ${MAL.episodes}\n\n *➸ Rated For* - ${
				MAL.rating
			}\n\n *➸ Rating* - ${MAL.score}, ${MAL.scoreStats.slice(
				6
			)}\n\n _${MAL.genres.join(
				", "
			)}_\n\n *➸ Studios* - ${MAL.studios.join(", ")}`;

			return makeParsableObj({
				image: { url: MAL.picture },
				caption: messageMal,
			});

		case "..animewall":
			let animewall: any;
			try {
				animewall = await animeJS.wallpaper();
			} catch (err) {
				return makeParsableObj({ text: "Something went wrong..." });
			}

			return makeParsableObj({ image: { url: animewall.url } });

		case "..anime":
			const urlAnime = anime;

			return makeParsableObj({
				image: { url: urlAnime },
				caption: "Kawaii",
			});

		case "..nsfwanime":
			if (isGroupMsg && !isNSFW)
				return makeParsableObj({ text: "🔞 NSFW not enabled!" });

			const urlAnimen = nsfwanime;

			return makeParsableObj({
				image: { url: urlAnimen },
				caption: "Kawaii",
				viewOnce: true,
			});

		case "..nsfwgirl":
			if (isGroupMsg && !isNSFW)
				return makeParsableObj({ text: "🔞 NSFW not enabled!" });

			let pon: any;
			try {
				pon = await axios.get(
					"https://meme-api.herokuapp.com/gimme/nsfw"
				);
				const { title, url } = pon.data;
				return makeParsableObj({
					image: { url },
					caption: title,
					viewOnce: true,
				});
			} catch (err) {
				console.log(err);
				return makeParsableObj({ text: "Something went wrong..." });
			}

		case "..r":
		case "..meme":
		case "..wholesome":
		case "..dank":
		case "..waifu":
		case "..ecchi":
		case "..nsfw":
			let subr = "";
			let ops = {};
			if (command == "..meme") subr = "memes";
			else if (command == "..wholesome") subr = "wholesomememes";
			else if (command == "..dank") subr = "IndianDankMemes";
			else if (command == "..waifu") subr = "awwnime";
			else if (command == "..ecchi") {
				subr = "ecchi";
				ops = { viewOnce: true };
			} else if (command == "..r") {
				const como = convo.slice(4);
				if (como.length < 2) {
					return makeParsableObj({ text: "Enter valid sub" });
				}
				subr = como;
				console.log(como);
			} else if (command == "!nsfw") {
				if (isGroupMsg && !isNSFW)
					return makeParsableObj({ text: "🔞 NSFW not enabled!" });
				subr = "nsfwmemes";
			}

			let response: any;
			try {
				response = await get("Image", subr, true);
				//console.log(response);
				const { title, media } = response;
				return makeParsableObj({
					image: { url: media },
					caption: title,
					...ops,
				});
			} catch (err) {
				return makeParsableObj({ text: err });
			}

		case "..imdb":
			if (args.length === 0)
				return makeParsableObj({
					text: "Send command *!imdb [title]*",
				});

			const imdbsearch = convo.slice(7);

			try {
				await nameToImdb(imdbsearch, function (err, res, inf) {
					//console.log(res); // "tt0121955"
					if (!res.startsWith("tt")) {
						res = "waka";
					} else if (err) {
						return -1;
					}
					try {
						getByID(res, async (datIMDB) => {
							let outdata = ` *➸ Title:* ${datIMDB.Title}\n *➸ Year:* ${datIMDB.Year}\n *➸ Runtime:* ${datIMDB.Runtime}\n *➸ Plot:* ${datIMDB.Plot}\n *➸ Rating:* ${datIMDB.imdbRating}\n *➸ Genre:* ${datIMDB.Genre}\n *➸ Box Office:* ${datIMDB.BoxOffice}`;

							if (datIMDB.Error) {
								await sock.sendMessage(
									msg.key.remoteJid,
									{
										text: "❗ Could Not find details about it...",
									},
									{ quoted: msg }
								);
								return makeParsableObj(null);
							}

							await sock.sendMessage(msg.key.remoteJid, {
								image: { url: datIMDB.Poster },
								caption: outdata,
							});
							return makeParsableObj(null);
						});
					} catch (err) {
						console.log(err);
					}
				});
			} catch (err) {
				console.log(err);
			}

			return makeParsableObj(null);

		default:
			return makeParsableObj({
				text: "Command not found!. Type *..help* to get all available commands.",
			});
	}
};
