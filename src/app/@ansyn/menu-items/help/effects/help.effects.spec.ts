import { Observable } from 'rxjs';
import { async, inject, TestBed } from '@angular/core/testing';
import { StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { HelpEffects } from '../effects/help.effects';
import { menuFeatureKey, MenuReducer } from '@ansyn/menu';

describe('HelpEffects', () => {
	let helpEffects: HelpEffects;
	let actions: Observable<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[menuFeatureKey]: MenuReducer
				})
			],
			providers: [
				HelpEffects,
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([HelpEffects], (_helpEffects: HelpEffects) => {
		helpEffects = _helpEffects;
	}));

});
