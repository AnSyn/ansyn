import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapSearchBoxComponent } from './map-search-box.component';
import { FormsModule } from '@angular/forms';
import { ImageryCommunicatorService } from '@ansyn/imagery/communicator-service/communicator.service';
import { GeocoderService } from '@ansyn/core/services/geocoder.service';

describe('MapSearchBoxComponent', () => {
	let component: MapSearchBoxComponent;
	let fixture: ComponentFixture<MapSearchBoxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MapSearchBoxComponent],
			imports: [FormsModule],
			providers: [
				{ provide: ImageryCommunicatorService, useValue: {}},
				{ provide: GeocoderService, useValue: {}}
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
});
