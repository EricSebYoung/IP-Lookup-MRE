import * as MRE from '@microsoft/mixed-reality-extension-sdk';
import { UsersDatabase } from './UsersDatabase';
import { WorldsTrackingDatabase } from './WorldsTrackingDatabase';
import { WorldTrackingHandler } from './WorldTrackingHandler';


export default class App {

	private _UserDatabase: UsersDatabase;
	private _WorldTrackingDatabase: WorldsTrackingDatabase;
	private _WorldTrackingHandler: WorldTrackingHandler;
	private _assets: MRE.AssetContainer;

	public get assetContainer() { return this._assets; }
	public get context() { return this._context; }
	public get UserDatabase() { return this._UserDatabase; }
	public get WorldTrackingHandler() { return this._WorldTrackingHandler; }
	public get WorldTrackingDatabase() { return this._WorldTrackingDatabase; }
	
	constructor(private _context: MRE.Context) {
		this._assets = new MRE.AssetContainer(_context);

		//outside classes
		this._UserDatabase = new UsersDatabase();
		this._WorldTrackingHandler = new WorldTrackingHandler(this);
		this._WorldTrackingDatabase = new WorldsTrackingDatabase();

		this._context.onStarted(() => this.started());
		this._context.onUserJoined(user => this.userJoined(user));
		this._context.onUserLeft(user => this.userLeft(user));
	}
	
	//initializes the app once context is "started"
	private async started() {
		this.UserDatabase.startup();
		console.log("Started");
		
		// Check whether code is running in a debuggable watched filesystem
		// environment and if so delay starting the app by 1 second to give
		// the debugger time to detect that the server has restarted and reconnect.
		// The delay value below is in milliseconds so 1000 is a one second delay.
		// You may need to increase the delay or be able to decrease it depending
		// on the speed of your PC.
		const delay = 1000;
		const argv = process.execArgv.join();
		const isDebug = argv.includes('inspect') || argv.includes('debug');

		// // version to use with non-async code
		// if (isDebug) {
		// 	setTimeout(this.startedImpl, delay);
		// } else {
		// 	this.startedImpl();
		// }

		// version to use with async code
		if (isDebug) {
			await new Promise(resolve => setTimeout(resolve, delay));
			await this.startedImpl();
		} else {
			await this.startedImpl();
		}
	}

	private startedImpl = async () => {
		
	}

	/**
	 * Runs through all necessary methods for when a user joins.
	 * @param user The user that has joined the application
	 */
	private async userJoined(user: MRE.User) {
		const userName = user.name;
		console.log(userName + ' has joined the server');	

		await this.UserDatabase.addUserRecord(user);
		this.WorldTrackingHandler.startup(user);
	}
	
	/**
	 * Runs through all necessary methods for when a user has left.
	 * @param user The user that has left the application
	 */
	private userLeft(user: MRE.User) {
		const userName = user.name;
		console.log(userName + ' has left the server');

		this.WorldTrackingHandler.cleanup(user);
	}
}

