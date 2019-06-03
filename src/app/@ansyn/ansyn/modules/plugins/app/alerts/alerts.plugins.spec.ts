import { AddAlertMsg, RemoveAlertMsg } from '../../../overlays/overlay-status/actions/overlay-status.actions';
import { AlertsPlugin } from './alerts.plugin';
import { Store, StoreModule } from '@ngrx/store';
import { inject, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { AlertMsgTypes } from '../../../alerts/model';

describe('AlertsPlugin', () => {
	let alertsPlugin: AlertsPlugin;
	let store: Store<any>;
	let actions: Observable<any>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				provideMockActions(() => actions),
				AlertsPlugin
			],
			imports: [StoreModule.forRoot({})]
		});
	});

	beforeEach(inject([Store, AlertsPlugin], (_store: Store<any>, _alertsPlugin: AlertsPlugin) => {
		store = _store;
		alertsPlugin = _alertsPlugin;
	}));

	it('should be defined', () => {
		expect(alertsPlugin).toBeDefined();
	});

	describe('setOverlaysNotInCase', () => {
		it('should add alert if not null and not include on drops)', () => {
			const drops: any = [{ id: 1 }, { id: 2 }, { id: 3 }];
			const map: any = { id: 'mapId', data: { overlay: { id: 4 } } };
			const result = alertsPlugin.setOverlaysNotInCase([drops, map]);
			expect(result).toEqual(new AddAlertMsg({
				key: AlertMsgTypes.overlayIsNotPartOfQuery,
				value: 'mapId'
			}));
		});

		describe('should remove alert if null or include on drops', () => {
			it('not include', () => {
				const drops: any = [{ id: 1 }, { id: 2 }, { id: 3 }];
				const map: any = { id: 'mapId', data: { overlay: { id: 3 } } };
				const result = alertsPlugin.setOverlaysNotInCase([drops, map]);
				expect(result).toEqual(new RemoveAlertMsg({
					key: AlertMsgTypes.overlayIsNotPartOfQuery,
					value: 'mapId'
				}));
			});

			it('null', () => {
				const drops: any = [{ id: 1 }, { id: 2 }, { id: 3 }];
				const map: any = { id: 'mapId', data: { overlay: null } };
				const result = alertsPlugin.setOverlaysNotInCase([drops, map]);
				expect(result).toEqual(new RemoveAlertMsg({
					key: AlertMsgTypes.overlayIsNotPartOfQuery,
					value: 'mapId'
				}));
			});

		});
	});

});
