import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlayStatusComponent } from './overlay-status.component';
import { IOverlaysState, OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
import { Store, StoreModule } from '@ngrx/store';

describe('OverlayStatusComponent', () => {
	let component: OverlayStatusComponent;
	let fixture: ComponentFixture<OverlayStatusComponent>;
	let store: Store<IOverlaysState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayStatusComponent],
			imports: [
				StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer })
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayStatusComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
