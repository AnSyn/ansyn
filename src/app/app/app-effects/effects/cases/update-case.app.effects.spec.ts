import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs/Observable';
import { UpdateCaseAppEffects } from './update-case.app.effects';

describe('UpdateCaseAppEffects', () => {
	let updateCaseAppEffects: UpdateCaseAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
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
