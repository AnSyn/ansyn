import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { Store, StoreModule } from '@ngrx/store';
import { ImageryRotationComponent } from './imagery-rotation.component';
import { EffectsModule } from '@ngrx/effects';
import { ImageryCommunicatorService, toRadians } from '@ansyn/imagery';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { PointToImageOrientationAction, PointToRealNorthAction } from '../../actions/map.actions';

describe('ImageryRotationComponent', () => {
	let component: ImageryRotationComponent;
	let fixture: ComponentFixture<ImageryRotationComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				StoreModule.forRoot({
					[mapFeatureKey]: MapReducer
				}),
				EffectsModule.forRoot([]),
				TranslateModule.forRoot()
			],
			providers: [ImageryCommunicatorService],
			declarations: [
				ImageryRotationComponent
			]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
		fixture = TestBed.createComponent(ImageryRotationComponent);
		component = fixture.componentInstance;
		component.mapState = {
			id: 'mapId',
			data: {
				position: {
					projectedState: {
						rotation: 0
					}
				},
				overlay: { id: 'testOverlay'}
			}
		} as any;
		fixture.detectChanges();
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('toggleNorth should raise PointToRealNorthAction when no overlay is displayed', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(3));
		component.mapState.data.overlay = null;
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToRealNorthAction(component.mapState.id));
	});

	it('toggleNorth should raise PointToRealNorthAction if rotation is 354 deg', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(354));
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToRealNorthAction(component.mapState.id));
	});

	it('toggleNorth should raise PointToRealNorthAction if rotation is -6 deg', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(-6));
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToRealNorthAction(component.mapState.id));
	});

	it('toggleNorth should raise PointToRealNorthAction if rotation is 6 deg', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(6));
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToRealNorthAction(component.mapState.id));
	});

	it('toggleNorth should raise PointToImageOrientationAction if rotation is 3 deg', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(3));
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToImageOrientationAction({ mapId: component.mapState.id, overlay: component.mapState.data.overlay}));
	});

	it('toggleNorth should raise PointToImageOrientationAction if rotation is 357 deg', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(357));
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToImageOrientationAction({ mapId: component.mapState.id, overlay: component.mapState.data.overlay}));
	});

	it('toggleNorth should raise PointToImageOrientationAction if rotation is -3 deg', () => {
		spyOn(store, 'dispatch');
		spyOnProperty(component, 'rotationAngle', 'get').and.returnValue(toRadians(-3));
		component.toggleNorth();
		expect(store.dispatch).toHaveBeenCalledWith(new PointToImageOrientationAction({ mapId: component.mapState.id, overlay: component.mapState.data.overlay}));
	});
});
