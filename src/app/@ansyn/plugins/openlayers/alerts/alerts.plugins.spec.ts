import { AlertsPlugin } from './alerts.plugin';
import { Store, StoreModule } from '@ngrx/store';
import { inject, TestBed } from '@angular/core/testing';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';

fdescribe('AlertsPlugin', () => {
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

});
