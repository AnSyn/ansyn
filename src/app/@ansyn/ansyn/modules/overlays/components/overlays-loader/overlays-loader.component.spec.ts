import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { OverlaysLoaderComponent } from './overlays-loader.component';
import { OverlayReducer, overlaysFeatureKey } from '../../reducers/overlays.reducer';
import { StoreModule } from '@ngrx/store';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('OverlaysLoaderComponent', () => {
	let component: OverlaysLoaderComponent;
	let fixture: ComponentFixture<OverlaysLoaderComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [OverlaysLoaderComponent],
			imports: [StoreModule.forRoot({ [overlaysFeatureKey]: OverlayReducer }), BrowserAnimationsModule]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaysLoaderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
