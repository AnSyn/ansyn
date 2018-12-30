import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ImageryComponent } from './imagery.component';
import { ImageryCommunicatorService } from '../communicator-service/communicator.service';
import { BaseMapSourceProvider } from '../model/base-map-source-provider';
import { CacheService } from '../cache-service/cache.service';
import { PLUGINS_COLLECTIONS } from '../providers/plugins-collection';
import { IMAGERY_MAPS } from '../providers/imagery-map-collection';
import { ICaseMapState, MAP_SOURCE_PROVIDERS_CONFIG } from '@ansyn/core';
import { ImageryMapSource } from '../public_api';
import { StoreModule } from '@ngrx/store';

@ImageryMapSource({
	sourceType: 'sourceType1',
	supported: <any> ['mapType1']
})
class SourceProviderMock1 extends BaseMapSourceProvider {
	create(metaData: any): any {
		return true;
	}

	createAsync(metaData: ICaseMapState): Promise<any> {
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
			imports: [StoreModule.forRoot({})],
			declarations: [ImageryComponent],
			providers: [
				{ provide: CacheService, useValue: null },
				{ provide: PLUGINS_COLLECTIONS, useValue: [] },
				{ provide: BaseMapSourceProvider, useClass: SourceProviderMock1, multi: true },
				{
					provide: MAP_SOURCE_PROVIDERS_CONFIG,
					useValue: {}
				},
				{ provide: IMAGERY_MAPS, useValue: {} },
				ImageryCommunicatorService]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryComponent);
		component = fixture.componentInstance;
		component.communicator = <any> { ngOnInit: () => {} };
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
