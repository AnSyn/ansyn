import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { mapFeatureKey, MapReducer, selectActiveMapId } from '@ansyn/map-facade';
import { selectIsMeasureToolActive, toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';

import { MeasureControlComponent } from './measure-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { TranslateModule } from '@ngx-translate/core';
import { UpdateMeasureDataOptionsAction } from '../../actions/tools.actions';

const mockStore = new Map<any, any>([
	[selectActiveMapId, 'mapId']
]);

describe('MeasureControlComponent', () => {
	let component: MeasureControlComponent;
	let fixture: ComponentFixture<MeasureControlComponent>;
	let store: Store<any>;
	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [MeasureControlComponent],
			imports: [
				StoreModule.forRoot({
					[toolsFeatureKey]: ToolsReducer,
					[mapFeatureKey]: MapReducer
				}),
				TranslateModule.forRoot()
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MeasureControlComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('show should be false', () => {
		mockStore.set(selectIsMeasureToolActive, false);
		spyOn(store, 'select');
		fixture.detectChanges();
		expect(component.show).toBeFalsy();
	})

	describe('toggleShowLayer()', () => {
		it('should dispatch UpdateMeasureDataOptionsAction', () => {
			spyOn(store, 'dispatch');
			component.measureData = <any>{
				isLayerShowed: true
			};
			component.toggleShowLayer();
			expect(store.dispatch).toHaveBeenCalledWith(new UpdateMeasureDataOptionsAction({
				mapId: 'mapId',
				options: { isLayerShowed: false },
				fromUI: true
			}));
		});
	});
});
