import { inject, TestBed } from '@angular/core/testing';
import { OverlayOutOfBoundsService } from './overlay-out-of-bounds.service';
import { geometry } from "@turf/turf";
import { of } from "rxjs";
import { bboxFromGeoJson, ImageryCommunicatorService } from "@ansyn/imagery";

describe('OverlayOutOfBoundsService', () => {
	let service: OverlayOutOfBoundsService;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ImageryCommunicatorService]
		});
		service = TestBed.inject(OverlayOutOfBoundsService);
	});

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService: ImageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
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
		const extent = bboxFromGeoJson(imageryCommunicatorService.provide(activeMapId).mapSettings.data.overlay.footprint);
		service.backToExtent(activeMapId, extent);
		expect(ActiveMap.fitToExtent).toHaveBeenCalledWith(extent);
	});

});
