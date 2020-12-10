import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MapSearchBoxComponent } from './map-search-box.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { GeocoderService } from '../../services/geocoder.service';
import { asyncData } from '../../test/async-observable-helpers';
import { TranslateModule } from '@ngx-translate/core';
import { StoreModule } from "@ngrx/store";
import { mapFeatureKey, MapReducer } from "../../reducers/map.reducer";
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Point } from 'geojson';


describe('MapSearchBoxComponent', () => {
	let component: MapSearchBoxComponent;
	let fixture: ComponentFixture<MapSearchBoxComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [MapSearchBoxComponent],
			imports: [
				FormsModule,
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				TranslateModule.forRoot(),
				MatInputModule,
				MatAutocompleteModule,
				ReactiveFormsModule
			],
			providers: [
				{
					provide: ImageryCommunicatorService, useValue: {
						provide: () => ({
							setCenter: () => {
							}
						})
					}
				},
				{
					provide: GeocoderService, useValue: {
						getLocation$: () => {
						},
						isCoordinates: () => false,
						createPoint: () => {}
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MapSearchBoxComponent);
		component = fixture.componentInstance;
		component.mapId = 'testMapId';
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onSubmit', () => {
		let geocoderService;

		beforeEach(fakeAsync(() => {
			geocoderService = TestBed.inject(GeocoderService);
			component.goToLocation(undefined);
			tick();
		}));

		it('should call getLocation$() and then setCenter()', fakeAsync(() => {
			const point: Point = {
				coordinates: [0, 0],
				type: 'Point'
			};
			spyOn(geocoderService, 'getLocation$').and.returnValue(asyncData([{ name: 'blablabla', point }]));
			component.control.setValue('hehe');
			tick();
			spyOn(component._communicator, 'setCenter').and.returnValue(asyncData(true));
			component.onSubmit();
			tick();
			expect(geocoderService.getLocation$).toHaveBeenCalledWith('hehe');
			expect(component._communicator.setCenter).toHaveBeenCalledWith(point, true);
		}));

		it('should halt the flow, when given an empty string', fakeAsync(() => {
			component.control.setValue('');
			component.onSubmit();
			spyOn(component._communicator, 'setCenter').and.returnValue(asyncData(true));
			tick();
			expect(component._communicator.setCenter).not.toHaveBeenCalled();
		}));

		it('should halt the flow, when the requested location was not found', fakeAsync(() => {
			component.error = null;
			spyOn(geocoderService, 'getLocation$').and.returnValue(asyncData([{
				name: 'No results',
				point: undefined
			}]));
			component.control.setValue('hehe');
			component.onSubmit();
			spyOn(component._communicator, 'setCenter').and.returnValue(asyncData(true));
			tick();
			expect(geocoderService.getLocation$).toHaveBeenCalledWith('hehe');
			expect(component._communicator.setCenter).not.toHaveBeenCalled();
		}));
	});
});
