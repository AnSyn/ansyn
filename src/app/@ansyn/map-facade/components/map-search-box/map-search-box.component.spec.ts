import { async, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MapSearchBoxComponent } from './map-search-box.component';
import { FormsModule } from '@angular/forms';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { GeocoderService } from '@ansyn/map-facade/services/geocoder.service';
import { asyncData } from '@ansyn/core/test/async-observable-helpers';

describe('MapSearchBoxComponent', () => {
	let component: MapSearchBoxComponent;
	let fixture: ComponentFixture<MapSearchBoxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MapSearchBoxComponent],
			imports: [FormsModule],
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
						}
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MapSearchBoxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('onSubmit', () => {
		let geocoderService;

		beforeEach(() => {
			geocoderService = TestBed.get(GeocoderService);
		});

		it('should call getLocation$() and then setCenter()', fakeAsync(() => {
			component.searchString = 'hehe';
			spyOn(geocoderService, 'getLocation$').and.returnValue(asyncData('blablabla'));
			component.onSubmit();
			expect(component._communicator).toBeDefined();
			spyOn(component._communicator, 'setCenter').and.returnValue(asyncData({}));
			tick();
			expect(geocoderService.getLocation$).toHaveBeenCalledWith('hehe');
			expect(component._communicator.setCenter).toHaveBeenCalledWith('blablabla');
		}));

		it('should halt the flow, when given an empty string', fakeAsync(() => {
			component.searchString = '';
			component.onSubmit();
			expect(component._communicator).toBeDefined();
			spyOn(component._communicator, 'setCenter').and.returnValue(asyncData({}));
			tick();
			expect(component._communicator.setCenter).not.toHaveBeenCalled();
		}));

		it('should signal when the requested location was not found', fakeAsync(() => {
			component.error = false;
			component.searchString = 'hehe';
			spyOn(geocoderService, 'getLocation$').and.returnValue(asyncData(null));
			component.onSubmit();
			expect(component._communicator).toBeDefined();
			spyOn(component._communicator, 'setCenter').and.returnValue(asyncData({}));
			tick();
			expect(geocoderService.getLocation$).toHaveBeenCalledWith('hehe');
			expect(component._communicator.setCenter).not.toHaveBeenCalled();
			expect(component.error).toBeTruthy();
		}));
	});
});
