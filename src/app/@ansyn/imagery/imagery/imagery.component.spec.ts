import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { BaseMapSourceProvider } from '../model/base-map-source-provider';
import { ConfigurationToken } from '../model/configuration.token';
import { VisualizersConfig } from '@ansyn/core/tokens/visualizers-config.token';
import { Store } from '@ngrx/store';
import { CacheService } from '@ansyn/imagery/cache-service/cache.service';
import { PLUGINS_COLLECTIONS } from '@ansyn/imagery/model/plugins-collection';
import { IMAGERY_MAP_COMPONENTS } from '@ansyn/imagery/model/imagery-map-component';

class SourceProviderMock1 extends BaseMapSourceProvider {
	public supported =  ['mapType1'];
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

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [],
			declarations: [ImageryComponent],
			providers: [
				{ provide: CacheService, useValue: null },
				{ provide: PLUGINS_COLLECTIONS, useValue: []},
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1, multi: true },
				{ provide: VisualizersConfig, useValue: {} },
				{ provide: Store, useValue: null },
				{ provide: IMAGERY_MAP_COMPONENTS, useValue: [] },
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
					}],
					"maxCachedLayers": 100
				}
				},
				ImageryCommunicatorService]
		}).compileComponents();
	}));

	beforeEach(inject([ImageryCommunicatorService], (_imageryCommunicatorService) => {
		imageryCommunicatorService = _imageryCommunicatorService;
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
