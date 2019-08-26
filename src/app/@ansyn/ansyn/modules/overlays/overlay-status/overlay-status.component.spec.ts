import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';
import { OverlayStatusComponent } from './overlay-status.component';
import { StoreModule, Store } from '@ngrx/store';
import { imageryStatusFeatureKey, ImageryStatusReducer, mapFeatureKey, MapReducer } from '@ansyn/map-facade';
import { overlayStatusFeatureKey, OverlayStatusReducer } from './reducers/overlay-status.reducer';
import { TranslateModule } from '@ngx-translate/core';
import { ImageryCommunicatorService } from '@ansyn/imagery';

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
			TranslateModule.forRoot()],
			providers: [ImageryCommunicatorService]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayStatusComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		component.overlay = <any>{id: 'overlayId' };
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('check click on toggleFavorite', () => {
		fixture.nativeElement.querySelector('button.set-favorite').click();
		expect(component.toggleFavorite).toHaveBeenCalled();
	});

	it('check click on togglePreset', () => {
		fixture.nativeElement.querySelector('button.set-preset').click();
		expect(component.togglePreset).toHaveBeenCalled();
	});
});
