import groups from "./utils/groups.json";
import nsfw_ from "./utils/NSFW.json";
import * as fs from "fs";
import { makeParsableObj } from "./handleText";
import { WASocket } from "./Baileys";

export default async function handleGroup(
	sock: WASocket,
	msg: any,
	command: string,
	args: string[]
) {
	if (command == "..bot") {
		if (args[0] == "enable") {
			groups[msg.key.remoteJid] = true;
		} else if (args[0] == "disable") {
			delete groups[msg.key.remoteJid];
		} else {
			return makeParsableObj({
				text: "Invalid! Send enable or disable.",
			});
		}

		fs.writeFileSync(
			"./utils/groups.json",
			JSON.stringify(groups, null, 2)
		);

		if (groups[msg.key.remoteJid]) {
			return makeParsableObj({ text: "Bot enabled in this group!" });
		} else {
			return makeParsableObj({ text: "Bot disabled in this group!" });
		}
	} else if (command == "..togglensfw") {
		if (nsfw_[msg.key.remoteJid]) {
			delete nsfw_[msg.key.remoteJid];
		} else {
			nsfw_[msg.key.remoteJid] = true;
		}

		fs.writeFileSync("./utils/NSFW.json", JSON.stringify(nsfw_, null, 2));

		if (nsfw_[msg.key.remoteJid])
			return makeParsableObj({ text: "NSFW enabled in this group!" });
		else return makeParsableObj({ text: "NSFW disabled in this group!" });
	}

	switch (command) {
		case "..invite":
			const code = await sock.groupInviteCode(msg.key.remoteJid);
			return makeParsableObj({
				text: `https://chat.whatsapp.com/${code}`,
			});

		case "..add":
			await sock.groupParticipantsUpdate(
				msg.key.remoteJid,
				args.map((part) => `${part}@s.whatsapp.net`),
				"add"
			);
			return makeParsableObj(null);

		case "..kick":
			await sock.groupParticipantsUpdate(
				msg.key.remoteJid,
				args.map((part) => `${part}@s.whatsapp.net`),
				"remove"
			);
			return makeParsableObj(null);

		case "..makeadmin":
			await sock.groupParticipantsUpdate(
				msg.key.remoteJid,
				args.map((part) => `${part}@s.whatsapp.net`),
				"promote"
			);
			return makeParsableObj(null);

		case "..unadmin":
			await sock.groupParticipantsUpdate(
				msg.key.remoteJid,
				args.map((part) => `${part}@s.whatsapp.net`),
				"demote" // replace this parameter with "remove", "demote" or "promote"
			);
			return makeParsableObj(null);

		default:
			return;
	}
}
