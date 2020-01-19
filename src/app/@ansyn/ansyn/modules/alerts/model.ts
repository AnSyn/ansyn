export enum AlertMsgTypesEnum {
	OverlaysOutOfBounds = 'overlaysOutOfBounds',
	overlayIsNotPartOfQuery = 'overlayIsNotPartOfQuery'
}
type OverlayId = string;

export type AlertMsgTypes = AlertMsgTypesEnum | string;

export type AlertMsg = Map<OverlayId, Set<AlertMsgTypes>>;
