import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer
} from '../../../modules/overlays/overlay-status/reducers/overlay-status.reducer';
import { UpdateCaseAppEffects } from './update-case.app.effects';
import { casesFeatureKey, CasesReducer } from '../../../modules/menu-items/cases/reducers/cases.reducer';

describe('UpdateCaseAppEffects', () => {
	let updateCaseAppEffects: UpdateCaseAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({
					[casesFeatureKey]: CasesReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				})
			],
			providers: [
				UpdateCaseAppEffects,
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([UpdateCaseAppEffects], (_updateCaseAppEffects: UpdateCaseAppEffects) => {
		updateCaseAppEffects = _updateCaseAppEffects;
	}));

	it('should be defined', () => {
		expect(updateCaseAppEffects).toBeDefined();
	});
});
