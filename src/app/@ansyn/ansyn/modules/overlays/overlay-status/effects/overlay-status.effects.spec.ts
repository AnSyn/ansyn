import { async, inject, TestBed } from '@angular/core/testing';
import { ImageryCommunicatorService, } from '@ansyn/imagery';
import { mapFeatureKey, MapReducer, selectMaps } from '@ansyn/map-facade';
import { OpenlayersMapName } from '@ansyn/ol';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { of, ReplaySubject } from 'rxjs';
import { BackToWorldSuccess, BackToWorldView } from '../actions/overlay-status.actions';
import { OverlayStatusEffects } from './overlay-status.effects';


const fakeMaps = {
	mapId: {
		data: {
			position: {}
		}
	}
};
describe('OverlayStatusEffects', () => {
	let overlayStatusEffects: OverlayStatusEffects;
	let actions: ReplaySubject<any>;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({[mapFeatureKey]: MapReducer})
			],
			providers: [
				OverlayStatusEffects,
				provideMockActions(() => actions),
				ImageryCommunicatorService
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const fakeStore = new Map<any, any>([
			[selectMaps, fakeMaps]
		]);
		spyOn(store, 'select').and.callFake(type => of(fakeStore.get(type)));
	}));

	beforeEach(inject([OverlayStatusEffects, ImageryCommunicatorService], (_overlayStatusEffects: OverlayStatusEffects, _imageryCommunicatorService: ImageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
		overlayStatusEffects = _overlayStatusEffects;
	}));

	describe('backToWorldView$', () => {

		it('should be defined', () => {
			expect(overlayStatusEffects.backToWorldView$).toBeDefined();
		});

		it('should be call to BackToWorldSuccess', () => {
			actions = new ReplaySubject(1);
			actions.next(new BackToWorldView({mapId: 'mapId'}))
			const communicator = {
				id: 'mapId',
				setActiveMap: () => Promise.resolve(true),
				loadInitialMapSource: () => Promise.resolve(true),
				activeMapName: OpenlayersMapName
			};

			spyOn(imageryCommunicatorService, 'provide').and.returnValues(communicator);
			spyOn(communicator, 'loadInitialMapSource').and.callFake(() => Promise.resolve(true));
			overlayStatusEffects.backToWorldView$.subscribe((result) => {
				expect(result).toBeObservable(new BackToWorldSuccess({mapId: 'mapId'}));
			});
			expect(communicator.loadInitialMapSource).toHaveBeenCalled();
		});
	});

});

