import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayCopyrightNoticeComponent } from './overlay-copyright-notice.component';
import { SetWasOverlayCopyrightNoticeShownFlagAction } from '@ansyn/core';
import { OverlaysModule } from '@ansyn/overlays';
import { EffectsModule } from '@ngrx/effects';
import { mapFeatureKey, MapReducer } from '@ansyn/map-facade/reducers/map.reducer';
import { StoreModule } from '@ngrx/store';

fdescribe('OverlayCopyrightNoticeComponent', () => {
	let component: OverlayCopyrightNoticeComponent;
	let fixture: ComponentFixture<OverlayCopyrightNoticeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({}),
				EffectsModule.forRoot([]),
				OverlaysModule
			],
			declarations: [OverlayCopyrightNoticeComponent],
			providers: []
		})
			.compileComponents();
	}));

	describe('basic', () => {
		beforeEach(() => {
			fixture = TestBed.createComponent(OverlayCopyrightNoticeComponent);
			component = fixture.componentInstance;
			fixture.detectChanges();
		});

		it('should create', () => {
			expect(component).toBeTruthy();
		});
	});

});
