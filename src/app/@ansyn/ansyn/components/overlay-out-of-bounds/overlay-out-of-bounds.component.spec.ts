import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayOutOfBoundsComponent } from './overlay-out-of-bounds.component';
import { bboxFromGeoJson, ImageryCommunicatorService } from '@ansyn/imagery';
import { of } from 'rxjs';
import { geometry } from '@turf/turf';

describe('OverlayOutOfBoundsComponent', () => {
	let component: OverlayOutOfBoundsComponent;
	let fixture: ComponentFixture<OverlayOutOfBoundsComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ImageryCommunicatorService],
			declarations: [OverlayOutOfBoundsComponent],
		})
			.compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService: ImageryCommunicatorService) => {
		fixture = TestBed.createComponent(OverlayOutOfBoundsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		imageryCommunicatorService = _imageryCommunicatorService;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('backToExtent should calc extent and call fitToExtent', () => {
		const mapSettings = <any>{
			id: 'mapId',
			data: { overlay: { footprint: geometry('Polygon', [[[0, 0], [1, 1], [2, 2], [0, 0]]]) } }
		};
		component.mapId = 'mapId';
		const ActiveMap = jasmine.createSpyObj({ fitToExtent: of(true) });
		spyOn(imageryCommunicatorService, 'provide').and.returnValue(<any>{ ActiveMap, mapSettings });
		component.backToExtent();
		const extent = bboxFromGeoJson(imageryCommunicatorService.provide(component.mapId).mapSettings.data.overlay.footprint);
		expect(ActiveMap.fitToExtent).toHaveBeenCalledWith(extent);
	});

});
