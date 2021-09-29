const axios = require("axios");
const animeJS = require("@freezegold/anime.js")


async function test() {
	dank = await animeJS.mangaSearch("berserk", "max")
	console.log(dank[0]);
}

test();
