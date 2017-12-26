import { async, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable } from 'rxjs/Rx';
import { provideMockActions } from '@ngrx/effects/testing';
import { CoreAppEffects } from './core.app.effects';

describe('CoreAppEffects', () => {
	let coreAppEffects: CoreAppEffects;
	let actions: Observable<any>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({})
			],
			providers: [
				CoreAppEffects,
				provideMockActions(() => actions)
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	beforeEach(inject([CoreAppEffects], (_coreAppEffects: CoreAppEffects) => {
		coreAppEffects = _coreAppEffects;
	}));

	it('should be defined', () => {
		expect(coreAppEffects).toBeDefined();
	});

});
