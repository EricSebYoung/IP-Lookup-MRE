import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import App from "./app";

export class WorldTrackingHandler {
	private TimeSaveMap = new Map<string, Date>();

	constructor(private app: App) {

	}

	private updateRecord(userId: string, worldId: string) {
		if (this.TimeSaveMap.has(userId)) {
			const startTime = this.TimeSaveMap.get(userId);
			this.app.WorldTrackingDatabase.updateWorldRecord(userId, worldId, startTime);
			this.TimeSaveMap.delete(userId);
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

	private saveTime(userId: string) {
		const currentTime = new Date();
		this.TimeSaveMap.set(userId, currentTime);
	}

	public startup(user: MRE.User) {
		//const id = this.getAltSpaceId(user);
		this.saveTime(user.id.toString());
	}

	public cleanup(user: MRE.User) {
		const userId = user.id.toString();
		const worldId = this.getAltSpaceId(user);
		this.updateRecord(userId, worldId);
	}
}
