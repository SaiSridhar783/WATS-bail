function help() {
	return `◄ Group Commands ►

┠❥ *..add 9185xxxxxxxx ...*
┠❥ *..kick 9185xxxxxxxx ...*
┠❥ *..makeAdmin 9185xxxxxxxx ...*
┠❥ *..unadmin 9185xxxxxxxx ...*
┠❥ *..invite*
┠❥ *..toggleNSFW*
┠❥ *..bot [enable|disable]*
╰╼

◄ Others Commands ►

┠❥ *..delete* (delete quoted bot message)
┠❥ *..anihelp* (for weebs)
┠❥ *..sticker* / *..st* [nobg] [crop]
┠❥ *..meme*
┠❥ *..wholesome*
┠❥ *..joke*
┠❥ *..quote*
┠❥ *..def [word]* Dictionary
┠❥ *..nsfwhelp*
┠❥ *..neko* (random cat pics)
┠❥ *..inu* (random dog pics)
┠❥ *..tts [lang code] [text]* (text to speech) (code like *en=english, hi=hindi, ja=japanese*)
┠❥ *..wiki [query]*
┠❥ *..imdb [title]*
┠❥ *..urban [word]* (search urban dictionary)
┠❥ *..urban random* (random urban word)
┠❥ *..insult*
┠❥ *..lyrics [songName]*
┠❥ *..info*
╿
╰╼❥ Have fun !!`;
}

function anihelp() {
	return `◄ Commands ►
╽
┠❥ *..mal [anime title]* Search MyAnimeList for the anime
┠❥ *..manga [manga title]* Details about the manga.
┠❥ *..animewall* Anime related wallpaper.
┠❥ *..animequote* Random anime quotes.
┠❥ *..husbu*
┠❥ *..waifu*
┠❥ *..anime* (kawaii character)
┠❥ *..nsfwanime* (random anime nsfw)
┠❥ *..ecchi*
┠❥ *..saucenao* (beta) (search for anime from image)
╿
╰╼❥ Have fun !!
  `;
}

function nsfwhelp() {
	return `◄ Commands ►
╽
┠❥ *..nsfwgirl*
┠❥ *..dank*
┠❥ *..dankjoke*
┠❥ *..r [subreddit]* (get random image from subreddit)
╿
╰╼❥ Have fun !!
  `;
}

exports.help = help();
exports.anihelp = anihelp();
exports.nsfwhelp = nsfwhelp();

function info() {
	return `This bot is made in Node.js / TypeScript
Source code bot : https://github.com/SaiSridhar783/Bailey-WATS
Owner Bot : wa.me/917760317149
Author : Akula Sai Sridhar`;
}
exports.info = info();
