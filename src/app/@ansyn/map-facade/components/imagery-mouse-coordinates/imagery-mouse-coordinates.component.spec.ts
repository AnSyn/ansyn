import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ProjectionConverterService } from '../../services/projection-converter.service';
import { GeoHolderComponent } from './holders/geo-holder/geo-holder.component';
import { UtmHolderComponent } from './holders/utm-holder/utm-holder.component';

import { ImageryMouseCoordinatesComponent } from './imagery-mouse-coordinates.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { IMapFacadeConfig } from '../../models/map-config.model';

describe('ImageryMouseCoordinatesComponent', () => {
	let component: ImageryMouseCoordinatesComponent;
	let fixture: ComponentFixture<ImageryMouseCoordinatesComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryMouseCoordinatesComponent, GeoHolderComponent, UtmHolderComponent],
			imports: [],
			providers: [
				ImageryCommunicatorService,
				ProjectionConverterService,
				{
					provide: mapFacadeConfig,
					useValue: <IMapFacadeConfig>{
						floatingPositionSuffix: 'test sufix'
					}
				}
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryMouseCoordinatesComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
