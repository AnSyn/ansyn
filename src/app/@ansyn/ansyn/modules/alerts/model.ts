export enum AlertMsgTypesEnum {
	OverlaysOutOfBounds = 'overlaysOutOfBounds',
	overlayIsNotPartOfQuery = 'overlayIsNotPartOfQuery'
}

export type AlertMsgTypes = AlertMsgTypesEnum | string;

export type AlertMsg = Map<AlertMsgTypes, Set<string>>;
