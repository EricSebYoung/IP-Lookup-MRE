import { AddTime, GetCurrentTime, GetTimeDifferenceMap, NewTimeMap } from "./Functions/TimeFunctions";
import { JsonHandler } from "./JsonHandler";

/**
 * The structure of the Location Time Tracking database.
 */
type WorldTrackingDatabase = {
	[key: string]: WorldDescriptor;
};

/**
 * The structure of the record of a location.
 */
type WorldDescriptor = {
	[key: string]: TimeData;
};

type TimeData = {
	numberOfVisits: number;
	daysSpent: number;
	hoursSpent: number;
	minutesSpent: number;
	secondsSpent: number;
};

const fileName = '../public/worldTracking.json'
const filePath = __dirname + '/' + fileName;

export class WorldsTrackingDatabase {
	/* eslint-disable @typescript-eslint/no-var-requires */
	private WorldTrackingDatabase: WorldTrackingDatabase = require('../public/worldTracking.json');

	constructor() {
		
	}

	public addNewUser(user: string) {
		this.WorldTrackingDatabase[user] = {};
	}

	/**
	 * Creates a location record and updates the JSON
	 * @param user The string with the User's id
	 * @param worldId The id of the world
	 */
	public addNewWorld(user: string, worldId: string) {
		const timeData: TimeData = {
			numberOfVisits: 0,
			daysSpent: 0,
			hoursSpent: 0,
			minutesSpent: 0,
			secondsSpent: 0
		};

		this.WorldTrackingDatabase[user][worldId] = timeData;
	}

	public updateWorldRecord(user: string, worldId: string, startTime: Date) {
		if (!this.userExists(user)) {
			this.addNewUser(user);
		}

		if (!this.worldExists(user, worldId)) {
			this.addNewWorld(user, worldId);
		}

		const endTime = GetCurrentTime();
		const timeSpent = GetTimeDifferenceMap(startTime, endTime);

		const timeData = this.WorldTrackingDatabase[user][worldId];
		timeData.numberOfVisits += 1;

		const currentTimeMap = NewTimeMap(timeData.secondsSpent, 
			timeData.minutesSpent, 
			timeData.hoursSpent, 
			timeData.daysSpent);
		
		const newTimeMap = AddTime(currentTimeMap, timeSpent);
		timeData.secondsSpent = newTimeMap.get("Seconds");
		timeData.minutesSpent = newTimeMap.get("Minutes");
		timeData.hoursSpent = newTimeMap.get("Hours");
		timeData.daysSpent = newTimeMap.get("Days");

		this.saveDatabase();
	}

	private saveDatabase() {
		const Handler: JsonHandler = new JsonHandler;

		Handler.writeJSON(filePath, this.WorldTrackingDatabase);
	}

	private userExists(user: string) {
		let exists = false;
		if (this.WorldTrackingDatabase[user]) {
			exists = true;
		}
		return exists;
	}

	private worldExists(user: string, worldId: string) {
		let exists = false;
		if (this.WorldTrackingDatabase[user][worldId]) {
			exists = true;
		}
		return exists;
	}
}
