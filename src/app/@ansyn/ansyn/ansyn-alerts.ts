import { IAlert } from '@ansyn/core/alerts/alerts.model';

export const ansynAlerts: IAlert[] = [
	{
		key: 'noGeoRegistration',
		background: '#a70b0b',
		text: 'This Image Has No Geo-Registration'
	},
	{
		key: 'overlayIsNotPartOfCase',
		background: '#27B2CF',
		text: 'This Overlay Is Not a Part of the Case'
	},
	{
		key: 'overlaysOutOfBounds',
		background: '#80c5d4',
		text: 'Image is out of bounds'
	}
];
