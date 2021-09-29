import { WASocket } from "./Baileys/lib";
import { makeParsableObj } from "./handleText";

export default async (sock: WASocket, msg: any) => {
	console.log(msg.message)
	return makeParsableObj(null);
};
