import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlaySourceTypeNoticeComponent } from './overlay-source-type-notice.component';
import { OverlaysService } from '@ansyn/overlays/services/overlays.service';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

describe('OverlaySourceTypeNoticeComponent', () => {
	let component: OverlaySourceTypeNoticeComponent;
	let fixture: ComponentFixture<OverlaySourceTypeNoticeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				StoreModule.forRoot({}),
				EffectsModule.forRoot([])
			],
			declarations: [OverlaySourceTypeNoticeComponent],
			providers: [
				{
					provide: OverlaysService, useValue: {
						config: {
							sourceTypeNotices: [{
								key: 'KKK',
								value: 'VVV'
							}]
						}
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlaySourceTypeNoticeComponent);
		component = fixture.componentInstance;
		component.overlay = {
			sourceType: 'KKK'
		} as any;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should find the title for the overlay', () => {
		expect(component.title).toEqual('VVV');
	});

});
