export enum AlertMsgTypes {
	OverlaysOutOfBounds = 'overlaysOutOfBounds',
	overlayIsNotPartOfQuery = 'overlayIsNotPartOfQuery',
	anaglyphSensor = 'anaglyphSensor'
}

// export type AlertMsgTypes = AlertMsgTypesEnum | string;

export type AlertMsg = Map<AlertMsgTypes, Set<string>>;
