import { inject, TestBed, waitForAsync } from '@angular/core/testing';
import { ImageryCommunicatorService, } from '@ansyn/imagery';
import {
	mapFeatureKey,
	MapReducer,
	mapStateSelector,
	selectMaps, SetActiveMapId,
	UpdateMapAction
} from '@ansyn/map-facade';
import { provideMockActions } from '@ngrx/effects/testing';
import { Store, StoreModule } from '@ngrx/store';
import { Observable, of } from 'rxjs';
import { overlayStatusFeatureKey, OverlayStatusReducer } from '../reducers/overlay-status.reducer';
import { OverlayStatusEffects } from './overlay-status.effects';
import { overlayStatusConfig } from "../config/overlay-status-config";
import {
	DisableImageProcessing,
	SetAutoImageProcessing,
	SetAutoImageProcessingSuccess
} from '../actions/overlay-status.actions';
import { cold, hot } from 'jasmine-marbles';
import { SelectCaseAction } from '../../../menu-items/cases/actions/cases.actions';
import { ICase } from '../../../menu-items/cases/models/case.model';


const fakeMaps = {
	mapId: {
		id: 'mapId',
		data: {
			position: {},
			isAutoImageProcessingActive: false
		}
	}
};

const fakeMapState: any = {
	entities: fakeMaps,
	activeMapId: 'mapId'
}

describe('OverlayStatusEffects', () => {
	let overlayStatusEffects: OverlayStatusEffects;
	let actions: Observable<any>;
	let store: Store<any>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer, [overlayStatusFeatureKey]: OverlayStatusReducer })
			],
			providers: [
				OverlayStatusEffects,
				provideMockActions(() => actions),
				ImageryCommunicatorService,
				{
					provide: overlayStatusConfig,
					useValue: {}
				}
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const fakeStore = new Map<any, any>([
			[selectMaps, fakeMaps],
			[mapStateSelector, fakeMapState]
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

		/*it('should be call to BackToWorldSuccess', () => {
			actions = hot('--a--', { a: new BackToWorldView({ mapId: 'mapId' }) });
			const communicator = {
				id: 'mapId',
				setActiveMap: () => Promise.resolve(true),
				loadInitialMapSource: () => Promise.resolve(true),
				activeMapName: OpenlayersMapName
			};

			spyOn(imageryCommunicatorService, 'provide').and.callFake(() => communicator);
			spyOn(communicator, 'loadInitialMapSource').and.callFake(() => Promise.resolve(true));
			overlayStatusEffects.backToWorldView$.subscribe((result) => {
				expect(result).toBeObservable(new BackToWorldSuccess({ mapId: 'mapId' }));
			});
			expect(communicator.loadInitialMapSource).toHaveBeenCalled();
		});*/
	});

	it('onSelectCase$ should raise DisableImageProcessing', () => {
		actions = hot('--a--', { a: new SelectCaseAction({} as ICase) });
		const expectedResults = cold('--b--', { b: new DisableImageProcessing() });
		expect(overlayStatusEffects.onSelectCase$).toBeObservable(expectedResults);
	});

	it('toggleAutoImageProcessing$ should raise SetAutoImageProcessingSuccess', () => {
		actions = hot('--a--', { a: new SetAutoImageProcessing({ mapId: 'mapId' }) });
		const expectedResults = cold('--(abc)--', {
			a: new SetActiveMapId('mapId'),
			b: new UpdateMapAction({
				id: 'mapId',
				changes: {
					data: {
						position: {},
						isAutoImageProcessingActive: true
					}}
			}),
			c: new SetAutoImageProcessingSuccess({ value: true, fromUI: true })
		});
		expect(overlayStatusEffects.toggleAutoImageProcessing$).toBeObservable(expectedResults);
	});

});

