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

const UserDatabaseFilename = __dirname + '/../public/users.json';

export class UsersDatabase {
	/* eslint-disable @typescript-eslint/no-var-requires */
	private UserDatabase: UserDatabase = require('../public/users.json');

	constructor() {
		
	}

	/**
	 * Creates a User record and updates the JSON
	 * @param user The string with the User's name
	 */
	public async addUserRecord(user: MRE.User) {
		if (!this.userExists(user.name)) {
			const userJSON = user.toJSON();
			const userLocationData = await GetLocation(user.toJSON().properties["remoteAddress"], user);
			const joinedUser: UserDescriptor = {
				details: userJSON,
				locationData: userLocationData,
			};

			const joinedUserStr = JSON.stringify(joinedUser);
			const dataEntry = "\"" + user.name + "\": " + joinedUserStr;

			const Handler: JsonHandler = new JsonHandler;
			const jsonRecord = Handler.returnAppendedJSONStr(this.UserDatabase, dataEntry);

			Handler.writeJSONStr(UserDatabaseFilename, jsonRecord);
			this.UserDatabase[user.name] = joinedUser;
		}
	}
	/**
	 * Removes a User record to the program and updates the JSON
	 * @param User The string with the User's name.
	 */
	public removeUserRecord(user: MRE.User) {
		const Handler: JsonHandler = new JsonHandler;
		const jsonRecord = Handler.returnRemovedJSONStr(this.UserDatabase, user.name);

		Handler.writeJSONStr(UserDatabaseFilename, jsonRecord);
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

		Handler.cleanJSON(UserDatabaseFilename);
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
	 * @param UserName The name of the User
	 * @returns The details of the User
	 */
	public getUserDetails(UserName: string) {
		return this.UserDatabase[UserName].details;
	}

	public userExists(UserName: string) {
		let exists = false;
		if (this.UserDatabase[UserName]) {
			exists = true;
		}
		return exists;
	}
	
	public startup() {
		console.log("Database starting up");
		
		//this.writeCleanUserRecord();
	}
}
