import { Observable } from 'rxjs';
import { async, inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';

import { menuFeatureKey, MenuReducer } from '@ansyn/menu';

describe('PluginsEffects', () => {
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[menuFeatureKey]: MenuReducer
				})
			],
			providers: [
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

});
