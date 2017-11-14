import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { ImageryComponentSettings } from '../model/imagery-component-settings';
import { ImageryProviderService } from '../provider-service/provider.service';
import { BaseMapSourceProvider } from '../model/base-source-provider.model';
import { ConfigurationToken } from '../configuration.token';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';

class SourceProviderMock1 implements BaseMapSourceProvider {
	mapType = 'mapType1';
	sourceType = 'sourceType1';

	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: any): Promise<any> {
		return Promise.resolve();
	}

	startTimingLog(key) {

	}

	endTimingLog(key) {

	}
}

describe('ImageryComponent', () => {
	let component: ImageryComponent;
	let fixture: ComponentFixture<ImageryComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let imageryProviderService: ImageryProviderService;

	const geoPoint: GeoJSON.Point = {
		type: 'Point',
		coordinates: [15.7, 37.9]
	};

	const imageryData: ImageryComponentSettings = {
		id: 'imagery1',
		mapType: 'openLayersMap',
		progress: 0,
		data: { position: { center: geoPoint, zoom: 0 } }
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [],
			declarations: [ImageryComponent],
			providers: [
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1, multi: true },
				{ provide: VisualizersConfig, useValue: {} },
				{
					provide: ConfigurationToken, useValue: {
					'geoMapsInitialMapSource': [{
						'mapType': 'openLayersMap',
						'mapSource': 'BING',
						'mapSourceMetadata': {
							'key': 'AsVccaM44P5n-GYKXaV0oVGdTI665Qx_sMgYBSYRxryH2pLe92iVxUgEtwIt8des',
							'styles': ['Aerial']
						}
					}, {
						'mapType': 'cesiumMap',
						'mapSource': 'OSM',
						'mapSourceMetadata': null
					}]
				}
				},
				ImageryCommunicatorService, ImageryProviderService]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService, ImageryProviderService], (_imageryCommunicatorService, _imageryProviderService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
		imageryProviderService = _imageryProviderService;
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
