export class CoreSessionState {
	wasWelcomeNotificationShown?: boolean;

	constructor() {
		this.wasWelcomeNotificationShown = false;
	}
}

export function sessionData(): CoreSessionState {
	const coreState: CoreSessionState = JSON.parse(sessionStorage.getItem('coreState'));
	return coreState ? coreState : new CoreSessionState();
}

export function updateSession(data: CoreSessionState) {
	const sessionState = sessionData();
	const updatedSessionState = JSON.stringify({ ...sessionState, ...data });
	sessionStorage.setItem('coreState', updatedSessionState);
}
