import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { mapFeatureKey, MapReducer, selectActiveMapId } from '@ansyn/map-facade';
import { selectIsMeasureToolActive, toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';

import { MeasureControlComponent } from './measure-control.component';
import { StoreModule, Store } from '@ngrx/store';

const mockStore = new Map<any, any>([
	[selectActiveMapId, 'mapId']
]);
describe('MeasureControlComponent', () => {
	let component: MeasureControlComponent;
	let fixture: ComponentFixture<MeasureControlComponent>;
	let store: Store<any>;
	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [MeasureControlComponent],
			imports: [
				StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer,
				[mapFeatureKey]: MapReducer})
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
});
