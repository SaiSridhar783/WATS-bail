import groups from "./utils/groups.json";
import nsfw_ from "./utils/NSFW.json";
import * as fs from "fs";
import { makeParsableObj } from "./handleText";

export default async function handleGroup(
	sock: any,
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

	return;
}
