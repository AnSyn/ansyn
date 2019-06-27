import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectionConverterService } from '../../services/projection-converter.service';

import { ImageryMouseCoordinatesComponent } from './imagery-mouse-coordinates.component';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { mapFacadeConfig } from '../../models/map-facade.config';
import { IMapFacadeConfig } from '../../models/map-config.model';

describe('ImageryMouseCoordinatesComponent', () => {
	let component: ImageryMouseCoordinatesComponent;
	let fixture: ComponentFixture<ImageryMouseCoordinatesComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryMouseCoordinatesComponent],
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
