import { Action } from '@ngrx/store';
import { ILogMessage } from '../../../core/models/logger.model';

export const CredentialsActionTypes = {
	LOG_OPEN_PERMISSIONS_SITE: 'LOG_OPEN_PERMISSIONS_SITE',
	LOG_DOWNLOAD_PERMISSIONS_GUIDE: 'LOG_DOWNLOAD_PERMISSIONS_GUIDE'
};

export class LogOpenPermissionsSite implements Action, ILogMessage {
	type = CredentialsActionTypes.LOG_OPEN_PERMISSIONS_SITE;

	constructor(public payload?: any) {
	}

	logMessage() {
		return `Opening permissions site`
	}
}

export class LogDownloadPermissionsGuide implements Action, ILogMessage {
	type = CredentialsActionTypes.LOG_DOWNLOAD_PERMISSIONS_GUIDE;

	constructor(public payload?: any) {
	}

	logMessage() {
		return `Downloading permissions guide`
	}
}
