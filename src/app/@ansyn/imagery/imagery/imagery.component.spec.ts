import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { BaseMapSourceProvider } from '../model/base-map-source-provider';
import { VisualizersConfig } from '../model/visualizers-config.token';
import { CacheService } from '../cache-service/cache.service';
import { PLUGINS_COLLECTIONS } from '../providers/plugins-collection';
import { IMAGERY_MAP_COMPONENTS } from '../model/imagery-map-component';

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
				{ provide: IMAGERY_MAP_COMPONENTS, useValue: [] },
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
