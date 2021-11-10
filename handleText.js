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
exports.makeParsableObj = void 0;
const groups_json_1 = __importDefault(require("./utils/groups.json"));
const NSFW_json_1 = __importDefault(require("./utils/NSFW.json"));
const help = __importStar(require("./utils/help.js"));
const handleMedia_1 = __importDefault(require("./handleMedia"));
const handleGroup_1 = __importDefault(require("./handleGroup"));
const inu_json_1 = require("./utils/inu.json");
const husbu_json_1 = __importDefault(require("./utils/husbu.json"));
const axios_1 = __importDefault(require("axios"));
const solenolyrics_1 = __importDefault(require("solenolyrics"));
const urban_dictionary_1 = __importDefault(require("urban-dictionary"));
const node_gtts_1 = __importDefault(require("node-gtts"));
const animeJS = __importStar(require("@freezegold/anime.js"));
const mal_scraper_1 = __importDefault(require("mal-scraper"));
const name_to_imdb_1 = __importDefault(require("name-to-imdb"));
const node_movie_1 = require("node-movie");
const reddit_grabber_1 = require("reddit-grabber");
const random_anime_1 = __importDefault(require("random-anime"));
const anime = random_anime_1.default.anime();
const nsfwanime = random_anime_1.default.nsfw();
const makeParsableObj = (a, b = {}) => {
    return {
        replyObj: a,
        optionsObj: b,
    };
};
exports.makeParsableObj = makeParsableObj;
exports.default = async (sock, msg) => {
    var _a;
    if (Object.keys(msg.message).includes("imageMessage") ||
        Object.keys(msg.message).includes("videoMessage") ||
        Object.keys(msg.message).includes("extendedTextMessage")) {
        let res = await (0, handleMedia_1.default)(sock, msg);
        if (res)
            return res;
        return (0, exports.makeParsableObj)(null);
    }
    let convo = msg.message.conversation;
    if (!convo)
        return (0, exports.makeParsableObj)(null);
    if (!convo.startsWith(".."))
        return (0, exports.makeParsableObj)(null);
    if (convo.startsWith(".. "))
        convo = ".." + convo.slice(2).trim();
    convo = convo.toLowerCase();
    let temp = convo.split(" ");
    const command = temp[0];
    const args = temp.slice(1);
    const isGroupMsg = msg.key.remoteJid.includes("-");
    let isGroupYes = groups_json_1.default[msg.key.remoteJid];
    let isNSFW = NSFW_json_1.default[msg.key.remoteJid];
    ;
    if (isGroupMsg) {
        //fs.writeFileSync("group.json", JSON.stringify(msg, undefined, 2));
        const res = await (0, handleGroup_1.default)(sock, msg, command, args);
        isGroupYes = groups_json_1.default[msg.key.remoteJid];
        isNSFW = NSFW_json_1.default[msg.key.remoteJid];
        if (res) {
            return res;
        }
    }
    if (isGroupMsg && !isGroupYes) {
        return (0, exports.makeParsableObj)(null);
    }
    switch (command) {
        case "..help":
            return (0, exports.makeParsableObj)({ text: help.help });
        case "..anihelp":
            return (0, exports.makeParsableObj)({ text: help.anihelp });
        case "..nsfwhelp":
            if (isGroupMsg && !isNSFW)
                return (0, exports.makeParsableObj)({ text: "🔞 NSFW not enabled!" });
            return (0, exports.makeParsableObj)({ text: help.nsfwhelp });
        case "..info":
            return (0, exports.makeParsableObj)({ text: help.info }, { detectLinks: true });
        case "..inu":
            return (0, exports.makeParsableObj)({
                image: { url: inu_json_1.inu[Math.floor(Math.random() * inu_json_1.inu.length)] },
                caption: "🐕",
            });
        case "..husbu":
            const rindIndix = Math.floor(Math.random() * husbu_json_1.default.length);
            const rindKiy = husbu_json_1.default[rindIndix];
            return (0, exports.makeParsableObj)({
                image: { url: rindKiy.image },
                caption: rindKiy.teks,
            });
        case "..neko":
            let q2 = Math.floor(Math.random() * 900) + 300;
            let q3 = Math.floor(Math.random() * 900) + 300;
            return (0, exports.makeParsableObj)({
                image: { url: "http://placekitten.com/" + q3 + "/" + q2 },
                caption: "🐈",
            });
        case "..quote":
            let resp;
            try {
                resp = await axios_1.default.get("https://api.quotable.io/random");
            }
            catch (e) { }
            if (!resp)
                return (0, exports.makeParsableObj)({ text: "Something Went wrong..." });
            return (0, exports.makeParsableObj)({
                text: `*${resp.data.content}*\n\t\t\t~${resp.data.author}`,
            });
        case "..lyrics":
            if (args.length === 0)
                return (0, exports.makeParsableObj)({
                    text: "Send command *!lyrics [song]*",
                });
            const song = convo.slice(9);
            const lirik = await solenolyrics_1.default.requestLyricsFor(song);
            return (0, exports.makeParsableObj)({ text: lirik });
        case "..wiki":
            if (args.length === 0)
                return (0, exports.makeParsableObj)({
                    text: "Use like this *!wiki [query]*\n",
                });
            const query_ = convo.slice(6);
            let wiki;
            try {
                wiki = await axios_1.default.get(`https://apis.ccbp.in/wiki-search?search=${query_}`);
            }
            catch (e) {
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            if (((_a = wiki.data.search_results) === null || _a === void 0 ? void 0 : _a.length) <= 1) {
                return (0, exports.makeParsableObj)({
                    text: "*Error ❗* Please try better keywords",
                });
            }
            else {
                return (0, exports.makeParsableObj)({
                    text: `➸ *Query* : ${query_}\n\n➸ *Result* : ${wiki.data.search_results[0].description}\n\n➸ *Query* : ${query_}\n\n➸ *Result* : ${wiki.data.search_results[1].description}`,
                });
            }
        case "..animequote":
            let q;
            try {
                q = await axios_1.default.get("https://animechan.vercel.app/api/random");
            }
            catch (e) {
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            return (0, exports.makeParsableObj)({
                text: `"${q.data.quote}" - *${q.data.character}*, _${q.data.anime}_`,
            });
        case "..insult":
            let insult;
            try {
                insult = await axios_1.default.get("https://evilinsult.com/generate_insult.php?lang=en&type=json");
            }
            catch (e) {
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            return (0, exports.makeParsableObj)({ text: insult.data.insult });
        case "..urban":
            if (args.length === 0)
                return (0, exports.makeParsableObj)({
                    text: "Send command *!urban [word]*",
                });
            const urbu = convo.slice(8);
            if (urbu.trim() == "random") {
                let udRe;
                try {
                    udRe = await urban_dictionary_1.default.random();
                }
                catch (e) { }
                if (!udRe) {
                    return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
                }
                else {
                    let objk = udRe.length;
                    let xyz = udRe[Math.floor(Math.random() * objk)];
                    return (0, exports.makeParsableObj)({
                        text: `➸ ${xyz.definition}\n\n"${xyz.example}"`,
                    });
                }
            }
            else {
                let udRes;
                try {
                    udRes = await urban_dictionary_1.default.define(urbu);
                }
                catch (e) { }
                if (!udRes) {
                    return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
                }
                else {
                    let objk = udRes.length;
                    let xyz = udRes[Math.floor(Math.random() * objk)];
                    return (0, exports.makeParsableObj)({
                        text: `➸ ${xyz.definition}\n\n"${xyz.example}"`,
                    });
                }
            }
        case "..def":
            let bod = convo.slice(5);
            if (bod.length == 0) {
                return (0, exports.makeParsableObj)({ text: "Send command *!def [word]*" });
            }
            const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${bod}`;
            let defy;
            try {
                defy = await axios_1.default.get(url);
            }
            catch (e) {
                return (0, exports.makeParsableObj)({ text: "Meaning not found..." });
            }
            return (0, exports.makeParsableObj)({
                text: defy.data[0].meanings[0].definitions[0].definition,
            });
        case "..tts":
            if (args.length === 0)
                return (0, exports.makeParsableObj)({
                    text: "Syntax *!tts [en, hi, jp,..] [text]*, try *!tts en Hello*\nwhere en=english, hi=hindi, jp=japanese, etc.",
                });
            const dataText = convo.slice(9);
            if (dataText === "")
                return (0, exports.makeParsableObj)({ text: "Didn't get you" });
            if (dataText.length > 500)
                return (0, exports.makeParsableObj)({ text: "❗ Text is too long!" });
            let dataBhs = args[0].toLowerCase();
            let tts2;
            try {
                tts2 = (0, node_gtts_1.default)(dataBhs);
                await tts2.save("./media/tts.mp3", dataText, function () {
                    return;
                });
                return (0, exports.makeParsableObj)({
                    audio: { url: "./media/tts.mp3" },
                    mimetype: "audio/mp4",
                    pttAudio: true,
                }, { url: "./media/tts.mp3", ptt: true });
            }
            catch (err) {
                return (0, exports.makeParsableObj)({ text: err.response.data.message });
            }
        case "..joke":
            let jo;
            try {
                jo = await (0, axios_1.default)({
                    method: "GET",
                    url: "https://dad-jokes.p.rapidapi.com/random/joke",
                    headers: {
                        "x-rapidapi-host": "dad-jokes.p.rapidapi.com",
                        "x-rapidapi-key": "a12c126f59msh3ed700a0cf162d8p1a58dejsn17edd60becf1",
                    },
                });
            }
            catch (e) {
                console.log(e);
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            return (0, exports.makeParsableObj)({
                text: `${jo.data.body[0].setup}\n*${jo.data.body[0].punchline}*`,
            });
        case "..dankjoke":
            if (isGroupMsg && !isNSFW)
                return (0, exports.makeParsableObj)({ text: "🔞 NSFW not enabled!" });
            let dank;
            try {
                dank = await axios_1.default.get("https://v2.jokeapi.dev/joke/dark");
            }
            catch (e) {
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            if (dank.data.setup) {
                return (0, exports.makeParsableObj)({
                    text: `${dank.data.setup}\n\n_${dank.data.delivery}_`,
                });
            }
            else {
                return (0, exports.makeParsableObj)({ text: dank.data.joke });
            }
        case "..manga":
            const mangasearch = convo.slice(8);
            let manga;
            try {
                manga = await animeJS.mangaSearch(mangasearch, "max");
            }
            catch (err) {
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            let data = manga[0].attributes;
            const messageMan = ` *➸ Title* - ${data.titles.en}\n\n *➸ Synopsis* - ${data.synopsis}\n\n *➸ Volumes* - ${data.volumeCount}\n\n *➸ Rated For* - ${data.ageRating}, ${data.ageRatingGuide}\n\n *➸ Rating* - ${data.averageRating}`;
            return (0, exports.makeParsableObj)({
                image: { url: data.posterImage.original },
                caption: messageMan,
            });
        case "..mal":
            if (args.length === 0)
                return (0, exports.makeParsableObj)({ text: "Send command *!mal [anime]*" });
            const anisearch = convo.slice(6);
            let MAL;
            try {
                MAL = await mal_scraper_1.default.getInfoFromName(anisearch);
            }
            catch (err) {
                return (0, exports.makeParsableObj)({
                    text: `❗ ${err.response.data.message}`,
                });
            }
            const messageMal = ` *➸ Title* - ${MAL.title}\n\n *➸ Synopsis* - ${MAL.synopsis}\n\n *➸ Episodes* - ${MAL.episodes}\n\n *➸ Rated For* - ${MAL.rating}\n\n *➸ Rating* - ${MAL.score}, ${MAL.scoreStats.slice(6)}\n\n _${MAL.genres.join(", ")}_\n\n *➸ Studios* - ${MAL.studios.join(", ")}`;
            return (0, exports.makeParsableObj)({
                image: { url: MAL.picture },
                caption: messageMal,
            });
        case "..animewall":
            let animewall;
            try {
                animewall = await animeJS.wallpaper();
            }
            catch (err) {
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
            return (0, exports.makeParsableObj)({ image: { url: animewall.url } });
        case "..anime":
            const urlAnime = anime;
            return (0, exports.makeParsableObj)({
                image: { url: urlAnime },
                caption: "Kawaii",
            });
        case "..nsfwanime":
            if (isGroupMsg && !isNSFW)
                return (0, exports.makeParsableObj)({ text: "🔞 NSFW not enabled!" });
            const urlAnimen = nsfwanime;
            return (0, exports.makeParsableObj)({
                image: { url: urlAnimen },
                caption: "Kawaii",
            });
        case "..nsfwgirl":
            if (isGroupMsg && !isNSFW)
                return (0, exports.makeParsableObj)({ text: "🔞 NSFW not enabled!" });
            let pon;
            try {
                pon = await axios_1.default.get("https://meme-api.herokuapp.com/gimme/nsfw");
                const { title, url } = pon.data;
                return (0, exports.makeParsableObj)({ image: { url }, caption: title });
            }
            catch (err) {
                console.log(err);
                return (0, exports.makeParsableObj)({ text: "Something went wrong..." });
            }
        case "..r":
        case "..meme":
        case "..wholesome":
        case "..dank":
        case "..waifu":
        case "..ecchi":
        case "..nsfw":
            let subr = "";
            if (command == "..meme")
                subr = "memes";
            else if (command == "..wholesome")
                subr = "wholesomememes";
            else if (command == "..dank")
                subr = "IndianDankMemes";
            else if (command == "..waifu")
                subr = "awwnime";
            else if (command == "..ecchi")
                subr = "ecchi";
            else if (command == "..r") {
                const como = convo.slice(4);
                if (como.length < 2) {
                    return (0, exports.makeParsableObj)({ text: "Enter valid sub" });
                }
                subr = como;
                console.log(como);
            }
            else if (command == "!nsfw") {
                if (isGroupMsg && !isNSFW)
                    return (0, exports.makeParsableObj)({ text: "🔞 NSFW not enabled!" });
                subr = "nsfwmemes";
            }
            let response;
            try {
                response = await (0, reddit_grabber_1.get)("Image", subr, true);
                //console.log(response);
                const { title, media } = response;
                return (0, exports.makeParsableObj)({
                    image: { url: media },
                    caption: title,
                });
            }
            catch (err) {
                return (0, exports.makeParsableObj)({ text: err });
            }
        case "..imdb":
            if (args.length === 0)
                return (0, exports.makeParsableObj)({
                    text: "Send command *!imdb [title]*",
                });
            const imdbsearch = convo.slice(7);
            try {
                await (0, name_to_imdb_1.default)(imdbsearch, function (err, res, inf) {
                    //console.log(res); // "tt0121955"
                    if (!res.startsWith("tt")) {
                        res = "waka";
                    }
                    else if (err) {
                        return -1;
                    }
                    try {
                        (0, node_movie_1.getByID)(res, async (datIMDB) => {
                            let outdata = ` *➸ Title:* ${datIMDB.Title}\n *➸ Year:* ${datIMDB.Year}\n *➸ Runtime:* ${datIMDB.Runtime}\n *➸ Plot:* ${datIMDB.Plot}\n *➸ Rating:* ${datIMDB.imdbRating}\n *➸ Genre:* ${datIMDB.Genre}\n *➸ Box Office:* ${datIMDB.BoxOffice}`;
                            if (datIMDB.Error) {
                                await sock.sendMessage(msg.key.remoteJid, {
                                    text: "❗ Could Not find details about it...",
                                }, { quoted: msg });
                                return (0, exports.makeParsableObj)(null);
                            }
                            await sock.sendMessage(msg.key.remoteJid, {
                                image: { url: datIMDB.Poster },
                                caption: outdata,
                            });
                            return (0, exports.makeParsableObj)(null);
                        });
                    }
                    catch (err) {
                        console.log(err);
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
            return (0, exports.makeParsableObj)(null);
        default:
            return (0, exports.makeParsableObj)({
                text: "Command not found!. Type *..help* to get all available commands.",
            });
    }
};
