import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayStatusComponent } from './overlay-status.component';
import { Store, StoreModule } from '@ngrx/store';
import { imageryStatusFeatureKey, ImageryStatusReducer, mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { overlayStatusFeatureKey, OverlayStatusReducer } from './reducers/overlay-status.reducer';
import { TranslateModule } from '@ngx-translate/core';


describe('OverlayStatusComponent', () => {
	let component: OverlayStatusComponent;
	let fixture: ComponentFixture<OverlayStatusComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayStatusComponent],
			imports: [StoreModule.forRoot({
				[mapFeatureKey]: MapReducer,
				[imageryStatusFeatureKey]: ImageryStatusReducer,
				[overlayStatusFeatureKey]: OverlayStatusReducer
			}),
				TranslateModule.forRoot()]
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;

	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayStatusComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		component.overlay = <any>{ id: 'overlayId' };
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check click on toggleFavorite', () => {
		component.overlay = <any>{ id: 'overlayId' };
		fixture.detectChanges();
		spyOn(component, 'toggleFavorite');
		fixture.nativeElement.querySelector('.set-favorite').click();
		expect(component.toggleFavorite).toHaveBeenCalled();
	});

	it('check click on togglePreset', () => {
		component.overlay = <any>{ id: 'overlayId' };
		fixture.detectChanges();
		spyOn(component, 'togglePreset');
		fixture.debugElement.nativeElement.querySelector('.set-preset').click();
		expect(component.togglePreset).toHaveBeenCalled();
	});
});
