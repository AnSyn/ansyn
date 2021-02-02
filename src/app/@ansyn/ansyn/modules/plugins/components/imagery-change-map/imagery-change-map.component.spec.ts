import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ImageryChangeMapComponent } from './imagery-change-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import {
	ReplaceMainLayer,
	mapFeatureKey,
	MapReducer,
	selectMaps,
	selectMapStateById,
	selectMapTypeById
} from '@ansyn/map-facade';
import { GetProvidersMapsService, ImageryCommunicatorService } from '@ansyn/imagery';
import { LoggerService } from '../../../core/services/logger.service';
import { LoggerConfig } from '../../../core/models/logger.config';

const SOURCETYPE = 'sourceType';
const MAPID = 'mapId';
describe('ImageryChangeMapComponent', () => {
	let component: ImageryChangeMapComponent;
	let fixture: ComponentFixture<ImageryChangeMapComponent>;
	let imageryCommunicatorService: ImageryCommunicatorService;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryChangeMapComponent],
			imports: [StoreModule.forRoot({ [mapFeatureKey]: MapReducer }),
				TranslateModule.forRoot()],
			providers: [
				{ provide: LoggerConfig, useValue: {} },
				{ provide: LoggerService, useValue: { info: (some) => null } },
				{
					provide: GetProvidersMapsService,
					useValue: {
						getDefaultProviderByType: () => of(''),
						getAllSourceForType: () => of([])
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryChangeMapComponent);
		component = fixture.componentInstance;
		component.mapId = MAPID;
		component.currentSourceType = `other${SOURCETYPE}`;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		const mockStore = new Map<any, any>([
			[selectMaps, {}],
			[selectMapStateById, {}],
			[selectMapTypeById, 'mapType']

		]);
		spyOn(store, 'select').and.callFake(type => of(mockStore.get(type)));
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should fire ChangeMainLayer action', () => {
		spyOn(store, 'dispatch');
		component.changeMap(SOURCETYPE);
		expect(store.dispatch).toHaveBeenCalledWith(new ReplaceMainLayer({id: MAPID, sourceType: SOURCETYPE}));
	})
});
