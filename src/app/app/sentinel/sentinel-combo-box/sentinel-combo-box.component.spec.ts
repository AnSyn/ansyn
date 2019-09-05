import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { mapFeatureKey, MapReducer, selectMaps } from '@ansyn/map-facade';
import { Store, StoreModule } from '@ngrx/store';
import { of } from 'rxjs';
import { SetSentinelLayerOnMap } from '../actions/sentinel.actions';
import {
	selectSentinelLayers,
	selectSentinelselectedLayers,
	sentinelFeatureKey,
	SentinelReducer
} from '../reducers/sentinel.reducer';

import { SentinelComboBoxComponent } from './sentinel-combo-box.component';

describe('SentinelComboBoxComponent', () => {
	let component: SentinelComboBoxComponent;
	let fixture: ComponentFixture<SentinelComboBoxComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SentinelComboBoxComponent],
			imports: [FormsModule,
				StoreModule.forRoot({
					[sentinelFeatureKey]: SentinelReducer,
					[mapFeatureKey]: MapReducer
				})]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(SentinelComboBoxComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		fixture.detectChanges();
		store = _store;

		const mockStore = new Map<any, any>([
			[selectSentinelLayers, ['TRUE_COLOR', 'NDVI']],
			[selectSentinelselectedLayers, 'TRUE_COLOR'],
			[selectMaps, {
				mapId: {
					id: 'mapId', data: {
						overlay: {
							sensorType: 'SENTINEL'
						}
					}
				}
			}]
		]);

		spyOn(store, 'select').and.callFake(selector => of(mockStore.get(selector)))
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('changeLayer must fire SetSentinelLayerOnMap action', () => {
		spyOn(store, 'dispatch');
		const layer = 'TRUE_COLOR';
		component.changeLayer(layer);
		expect(store.dispatch).toHaveBeenCalledWith(new SetSentinelLayerOnMap({ id: component.mapId, layer }));
	})
});
