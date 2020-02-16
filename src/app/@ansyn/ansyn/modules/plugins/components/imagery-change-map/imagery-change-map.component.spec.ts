import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { ImageryChangeMapComponent } from './imagery-change-map.component';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import {
	ChangeMainLayer,
	mapFeatureKey,
	MapReducer,
	selectMaps,
	selectMapStateById,
	selectMapTypeById
} from '@ansyn/map-facade';
import { MAP_PROVIDERS_CONFIG } from '@ansyn/imagery';
import { LoggerService } from '../../../core/services/logger.service';
import { LoggerConfig } from '../../../core/models/logger.config';

const SOURCETYPE = 'sourceType';
const MAPID = 'mapId';
describe('ImageryChangeMapComponent', () => {
	let component: ImageryChangeMapComponent;
	let fixture: ComponentFixture<ImageryChangeMapComponent>;
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
					provide: MAP_PROVIDERS_CONFIG,
					useValue: {}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryChangeMapComponent);
		component = fixture.componentInstance;
		component.mapId = MAPID;
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
		component.changeMap('sourceType');
		expect(store.dispatch).toHaveBeenCalledWith(new ChangeMainLayer({ id: MAPID, sourceType: SOURCETYPE }));
	})
});
