import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import App from "./app";

export class WorldTrackingHandler {
	private TimeSaveMap = new Map<string, Date>();

	constructor(private app: App) {

	}

	private updateRecord(name: string, id: string) {
		if (this.TimeSaveMap.has(name)) {
			const startTime = this.TimeSaveMap.get(name);
			this.app.WorldTrackingDatabase.updateWorldRecord(name, id, startTime);
			this.TimeSaveMap.delete(name);
		}
	}

	private getAltSpaceId(user: MRE.User) {
		let altSpaceId: string;

		if (user.properties['altspacevr-event-id']) {
			altSpaceId = user.properties['altspacevr-event-id'];
		} else {
			altSpaceId = user.properties['altspacevr-space-id'];
		}

		return altSpaceId;
	}

	private saveTime(name: string) {
		const currentTime = new Date();
		this.TimeSaveMap.set(name, currentTime);
	}

	public startup(user: MRE.User) {
		//const id = this.getAltSpaceId(user);
		this.saveTime(user.name);
	}

	public cleanup(user: MRE.User) {
		const id = this.getAltSpaceId(user);
		this.updateRecord(user.name, id);
	}
}
