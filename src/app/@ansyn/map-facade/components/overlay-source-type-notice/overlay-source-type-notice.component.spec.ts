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
							sourceTypeNotices: {
								'SRC_TYPE_1': {
									Default: 'DDD',
									'SENSOR_TYPE_1': 'blublublu'
								}
							}
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
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('should not find the title for the overlay', () => {
		component.overlay = {
			sourceType: 'SRC_TYPE_5'
		} as any;
		fixture.detectChanges();
		expect(component.title).toBeFalsy();
	});

	it('should find the title for the overlay, default value for source type', () => {
		component.overlay = {
			sourceType: 'SRC_TYPE_1'
		} as any;
		fixture.detectChanges();
		expect(component.title).toEqual('DDD');
	});

	it('should find the title for the overlay, value for sensor type', () => {
		component.overlay = {
			sourceType: 'SRC_TYPE_1',
			sensorType: 'SENSOR_TYPE_1'
		} as any;
		fixture.detectChanges();
		expect(component.title).toEqual('blublublu');
	});

});
