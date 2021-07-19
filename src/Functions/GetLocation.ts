import * as MRE from "@microsoft/mixed-reality-extension-sdk";
import { LocationData } from "../UsersDatabase";
import { AsyncOKCancelPrompt } from "./UserPrompts";

/**
 * Asks a user if they want to share their location.
 * @param user The user that is being prompted.
 * @returns A boolean for if the user allows for location data collection.
 */
async function LocationSharePrompt(user: MRE.User) {
	const message = "This space wishes to collect location data. Press 'OK' to allow or 'Cancel' to refuse.";
	const allow = await AsyncOKCancelPrompt(user, message);

	return allow;
}

/**
 * Retrieves location data from freegeoip.
 * @param ip The IP Address to lookup
 * @param user The user that is being looked up
 * @returns A LocationData JSON.
 */
export default async function GetLocation(ip: string, user: MRE.User) {
	let locationJSON: LocationData = null;

	if (await LocationSharePrompt(user)) {
		//Change this if you need to use a new API.
		const URL = 'https://freegeoip.app/json/' + ip

		/* eslint-disable @typescript-eslint/no-var-requires */
		const http = require("https");

		const requestCall = new Promise((resolve, reject) => {
			http.get(URL, (response: any) => {
				const chunksOfData: Uint8Array[] = [];
		
				response.on('data', (fragments: Uint8Array) => {
					chunksOfData.push(fragments);
				});
		
				response.on('end', () => {
					const responseBody = Buffer.concat(chunksOfData);
					
					// promise resolved on success
					resolve(responseBody.toString());
				});
		
				response.on('error', (error: any) => {
					// promise rejected on error
					reject(error);
				});
			});
		});

		// promise resolved or rejected asynchronously
		await requestCall.then((response: any) => {
			//console.log(response);
			locationJSON = JSON.parse(response);
		}).catch((error: any) => {
			console.log(error);
		});
	}

	return locationJSON;
}
