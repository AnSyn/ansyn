import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { OverlayStatusComponent } from './overlay-status.component';
import { Store, StoreModule } from '@ngrx/store';
import {
	imageryStatusFeatureKey,
	ImageryStatusReducer,
	mapFacadeConfig,
	mapFeatureKey,
	MapReducer
} from '@ansyn/map-facade';
import { overlayStatusFeatureKey, OverlayStatusReducer } from './reducers/overlay-status.reducer';
import { TranslateModule } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { provideMockActions } from '@ngrx/effects/testing';
import { FormsModule } from '@angular/forms';
import { MockComponent } from "../../core/test/mock-component";
import { ImageProcessingControlComponent } from "./components/image-processing-control/image-processing-control.component";

describe('OverlayStatusComponent', () => {
	let component: OverlayStatusComponent;
	let  fixture: ComponentFixture<OverlayStatusComponent>;
	let store: Store<any>;
	let actions: Observable<any>;

	const mockImageManualProcessing = MockComponent({
		selector: 'ansyn-image-processing-control'
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayStatusComponent, ImageProcessingControlComponent],
			providers: [provideMockActions(() => actions),
				{ provide: mapFacadeConfig, useValue: {} },
			],
			imports: [
				FormsModule,
				StoreModule.forRoot({
					[mapFeatureKey]: MapReducer,
					[imageryStatusFeatureKey]: ImageryStatusReducer,
					[overlayStatusFeatureKey]: OverlayStatusReducer
				}),
				TranslateModule.forRoot(),
			]
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
	
});
