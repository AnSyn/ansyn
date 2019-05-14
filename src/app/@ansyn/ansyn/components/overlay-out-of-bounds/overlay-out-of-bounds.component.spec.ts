import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { mapFeatureKey, MapReducer, selectMaps } from "@ansyn/map-facade";
import { casesStateSelector } from "../../modules/menu-items/cases/reducers/cases.reducer";
import { layersStateSelector } from "../../modules/menu-items/layers-manager/reducers/layers.reducer";
import { OverlayOutOfBoundsComponent } from './overlay-out-of-bounds.component';
import { ImageryCommunicatorService, extentFromGeojson } from '@ansyn/imagery';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import { geometry } from '@turf/turf';
import { StoreModule, Store } from '@ngrx/store';

describe('OverlayOutOfBoundsComponent', () => {
	let component: OverlayOutOfBoundsComponent;
	let fixture: ComponentFixture<OverlayOutOfBoundsComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			providers: [ImageryCommunicatorService],
			declarations: [OverlayOutOfBoundsComponent],
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer })]
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
		component.mapId = 'mapId';
		component.mapState = <any> { id: 'mapId' , data: { overlay: { footprint: geometry('Polygon', [[[0, 0], [1, 1], [2, 2], [0, 0]]]) } } };
		const ActiveMap = jasmine.createSpyObj({ fitToExtent: of(true) });
		spyOn(imageryCommunicatorService, 'provide').and.returnValue({ ActiveMap });
		component.backToExtent();
		const extent = extentFromGeojson(component.mapState.data.overlay.footprint);
		expect(ActiveMap.fitToExtent).toHaveBeenCalledWith(extent);
	});

});
