import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { BaseMapSourceProvider, MAP_SOURCE_PROVIDERS_CONFIG } from '../model/base-map-source-provider';
import { CacheService } from '../cache-service/cache.service';
import { PLUGINS_COLLECTIONS } from '../providers/plugins-collection';
import { IMAGERY_MAPS } from '../providers/imagery-map-collection';
import { ImageryMapSource } from '../decorators/map-source-provider';
import { IMapSettings } from '../model/map-settings';
import { GetProvidersMapsService } from '../services/get-providers-maps/get-providers-maps.service';
import { of } from 'rxjs';
import { LoggerService } from '../../ansyn/modules/core/services/logger.service';

@ImageryMapSource({
	sourceType: 'sourceType1',
	supported: <any>['mapType1']
})
class SourceProviderMock1 extends BaseMapSourceProvider {
	create(metaData: any): Promise<any> {
		return Promise.resolve(true);
	}

	createAsync(metaData: IMapSettings): Promise<any> {
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

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [],
			declarations: [ImageryComponent],
			providers: [
				{ provide: CacheService, useValue: null },
				{ provide: PLUGINS_COLLECTIONS, useValue: [] },
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1, multi: true },
				{
					provide: MAP_SOURCE_PROVIDERS_CONFIG,
					useValue: {}
				},
				{
					provide: GetProvidersMapsService,
					useValue: {
						getAllSourceForType: () => of(),
						getDefaultProviderByType: () => of(),
						getMapProviderByTypeAndSource: () => of()
					}
				},
				{ provide: IMAGERY_MAPS, useValue: {} },
				ImageryCommunicatorService,
				{ provide: LoggerService, useValue: {} }
			]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		component.communicator = <any>{
			ngOnInit: () => {
			}
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
