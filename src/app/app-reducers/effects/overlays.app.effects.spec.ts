import { inject, TestBed } from '@angular/core/testing';
import { EffectsRunner, EffectsTestingModule } from '@ngrx/effects/testing';
import { Action, Store, StoreModule } from '@ngrx/store';
import { CasesReducer } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { CasesService } from '@ansyn/menu-items/cases/services/cases.service';
import { OverlaysAppEffects } from './overlays.app.effects';
import { Observable } from 'rxjs/Observable';
import { LoadOverlaysSuccessAction, OverlaysActionTypes } from '@ansyn/overlays/actions/overlays.actions';

describe('OverlaysAppEffects',()=> {
	let overlaysAppEffects: OverlaysAppEffects;
	let effectsRunner: EffectsRunner;
	let store: Store<any>;
	let casesService: CasesService;
	let cases: any[];

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				EffectsTestingModule,
				StoreModule.provideStore({ cases: CasesReducer}),

			],
			providers:[
				OverlaysAppEffects,
				{
					provide: CasesService,
					useValue: {
						getOverlaysMarkup: () => null
					}
				}
			]

		}).compileComponents();
	});

	beforeEach(inject([Store,CasesService,EffectsRunner,OverlaysAppEffects],(_store: Store<any>,_casesService:CasesService,_effectsRunner:EffectsRunner,_overalysAppEffects:OverlaysAppEffects) => {
		store = _store,
		casesService = _casesService;
		overlaysAppEffects = _overalysAppEffects;
		effectsRunner = _effectsRunner;
		spyOn(store,'select').and.callFake( type => {
			switch(type){
				case "cases":
					return Observable.of(cases);
				default:
					return Observable.empty();
			}

		});
	}));

	it('should be defined', () => {
		expect(overlaysAppEffects).toBeTruthy();
	});

	it("onOverlaysMarkupsChanged$",() => {
		spyOn(casesService,'getOverlaysMarkup').and.returnValue({});
		const action = new LoadOverlaysSuccessAction({} as any);
		effectsRunner.queue(action);
		let count = 0;
		overlaysAppEffects.onOverlaysMarkupsChanged$.subscribe((_result:Action) => {
			count++;
			expect(_result.type).toEqual(OverlaysActionTypes.OVERLAYS_MARKUPS);
			expect(casesService.getOverlaysMarkup).toHaveBeenCalledTimes(1);
		});
		expect(count).toBe(1);
	})
});
