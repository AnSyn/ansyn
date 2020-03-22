import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { OverlayOutOfBoundsComponent } from './overlay-out-of-bounds.component';
import { bboxFromGeoJson, ImageryCommunicatorService } from '@ansyn/imagery';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { geometry } from '@turf/turf';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';

describe('OverlayOutOfBoundsComponent', () => {
	let component: OverlayOutOfBoundsComponent;
	let fixture: ComponentFixture<OverlayOutOfBoundsComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ImageryCommunicatorService],
			declarations: [OverlayOutOfBoundsComponent],
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer }), TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, Store], (_imageryCommunicatorService: ImageryCommunicatorService, _store: Store<any>) => {
		fixture = TestBed.createComponent(OverlayOutOfBoundsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		imageryCommunicatorService = _imageryCommunicatorService;
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click on button should call "backToExtent"', () => {
		spyOn(component, 'backToExtent');
		const button = fixture.debugElement.query(By.css('button'));
		button.triggerEventHandler('click', {});
		expect(component.backToExtent).toHaveBeenCalled();
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
