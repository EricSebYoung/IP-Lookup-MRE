import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import GetLocation from "./Functions/GetLocation";
import { JsonHandler } from "./JsonHandler";

/**
 * The structure of the User database.
 */
type UserDatabase = {
	[key: string]: UserDescriptor;
};

/**
 * The structure of a User entry in the User database.
 */
type UserDescriptor = {
	details: MRE.UserLike;
	locationData: LocationData;
	namesUsed: string[];
};

export type LocationData = {
	ip: string;
	country_code: string;
	country_name: string;
	region_code: string;
	region_name: string;
	city: string;
	zip_code: string;
	time_zone: string;
	latitude: number;
	longitude: number;
	metro_code: number;
}

const fileName = __dirname + '/../public/users.json';

export class UsersDatabase {
	/* eslint-disable @typescript-eslint/no-var-requires */
	private UserDatabase: UserDatabase = require('../public/users.json');

	constructor() {
		
	}

	/**
	 * Creates a User record and updates the JSON
	 * @param user The user being added
	 */
	public async addUserRecord(user: MRE.User) {
		const userId: string = user.id.toString();
		if (!this.userExists(userId)) {
			const userJSON = user.toJSON();
			const userLocationData = await GetLocation(user.toJSON().properties["remoteAddress"], user);
			const nameArray: string[] = [];
			nameArray.push(user.name);
			const joinedUser: UserDescriptor = {
				details: userJSON,
				locationData: userLocationData,
				namesUsed: nameArray
			};

			const joinedUserStr = JSON.stringify(joinedUser);
			const dataEntry = "\"" + userId + "\": " + joinedUserStr;

			const Handler: JsonHandler = new JsonHandler;
			const jsonRecord = Handler.returnAppendedJSONStr(this.UserDatabase, dataEntry);

			Handler.writeJSONStr(fileName, jsonRecord);
			this.UserDatabase[userId] = joinedUser;
		}
		if (!this.UserDatabase[userId].namesUsed.some(name => name === user.name)) {
			this.UserDatabase[userId].namesUsed.push(user.name);
			this.saveDatabase();
		}
	}
	/**
	 * Removes a User record to the program and updates the JSON
	 * @param User The user being removed
	 */
	public removeUserRecord(user: MRE.User) {
		const Handler: JsonHandler = new JsonHandler;
		const jsonRecord = Handler.returnRemovedJSONStr(this.UserDatabase, user.name);

		Handler.writeJSONStr(fileName, jsonRecord);
		delete this.UserDatabase[user.name]
	}

	/**
	 * Wipes the User JSON data clean.
	 */
	public writeCleanUserRecord() {
		const Handler: JsonHandler = new JsonHandler;
		for (const Id of Object.keys(this.UserDatabase)) {
			delete this.UserDatabase[Id];
		}

		Handler.cleanJSON(fileName);
		this.UserDatabase = require('../public/users.json');
	}

	/**
	 * Returns the keys of the records in the database.
	 * @returns The keys of all database records.
	 */
	public getDatabaseKeys() {
		return Object.keys(this.UserDatabase);
	}

	/**
	 * Returns the details of the requested User.
	 * @param UserId The id of the User
	 * @returns The details of the User
	 */
	public getUserDetails(UserId: string) {
		return this.UserDatabase[UserId].details;
	}

	public userExists(UserId: string) {
		let exists = false;
		if (this.UserDatabase[UserId]) {
			exists = true;
		}
		return exists;
	}
	
	private saveDatabase() {
		const Handler: JsonHandler = new JsonHandler;

		Handler.writeJSON(fileName, this.UserDatabase);
	}

	public startup() {
		console.log("Database starting up");
		
		//this.writeCleanUserRecord();
	}
}
