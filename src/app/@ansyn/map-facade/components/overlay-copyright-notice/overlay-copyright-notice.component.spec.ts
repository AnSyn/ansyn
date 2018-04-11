import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayCopyrightNoticeComponent } from './overlay-copyright-notice.component';
import { OverlaysModule } from '@ansyn/overlays';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

describe('OverlayCopyrightNoticeComponent', () => {
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
