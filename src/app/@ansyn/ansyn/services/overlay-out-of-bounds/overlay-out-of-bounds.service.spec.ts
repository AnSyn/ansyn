import { inject, TestBed } from '@angular/core/testing';
import { OverlayOutOfBoundsService } from './overlay-out-of-bounds.service';
import { Store, StoreModule } from "@ngrx/store";
import { geometry } from "@turf/turf";
import { of } from "rxjs";
import { bboxFromGeoJson, ImageryCommunicatorService } from "@ansyn/imagery";
import { cloneDeep } from "lodash";
import { IMapState, initialMapState, mapStateSelector } from "@ansyn/map-facade";

describe('OverlayOutOfBoundsService', () => {
	let service: OverlayOutOfBoundsService;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;
	const mapState: IMapState = cloneDeep(initialMapState);

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({})],
			providers: [ImageryCommunicatorService]
		});
		service = TestBed.inject(OverlayOutOfBoundsService);
	});

	beforeEach(inject([ImageryCommunicatorService, Store], (_imageryCommunicatorService: ImageryCommunicatorService, _store: Store<any>) => {
		imageryCommunicatorService = _imageryCommunicatorService;
		store = _store;
		const fakeStore = new Map<any, any>([[mapStateSelector, mapState]]);
		spyOn(store, 'select').and.callFake((selector) => of(fakeStore.get(selector)));
	}));

	it('should be created', () => {
		expect(service).toBeTruthy();
	});

	it('backToExtent should calc extent and call fitToExtent', () => {
		const mapSettings = <any>{
			id: 'mapId',
			data: { overlay: { footprint: geometry('Polygon', [[[0, 0], [1, 1], [2, 2], [0, 0]]]) } }
		};
		const activeMapId = 'mapId';
		const ActiveMap = jasmine.createSpyObj({ fitToExtent: of(true) });
		spyOn(imageryCommunicatorService, 'provide').and.returnValue(<any>{ ActiveMap, mapSettings });
		service.backToExtent();
		const extent = bboxFromGeoJson(imageryCommunicatorService.provide(activeMapId).mapSettings.data.overlay.footprint);
		expect(ActiveMap.fitToExtent).toHaveBeenCalledWith(extent);
	});

});
