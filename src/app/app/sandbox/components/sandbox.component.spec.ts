import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SandboxComponent } from './sandbox.component';
import { AnsynApi, OverlayReducer, overlaysFeatureKey } from '@ansyn/ansyn';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { StoreModule } from '@ngrx/store';

describe('SandboxComponent', () => {
	let component: SandboxComponent;
	let fixture: ComponentFixture<SandboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SandboxComponent],
			providers: [
				ImageryCommunicatorService,
				{
					provide: AnsynApi,
					useValue: {}
				}
			],
			imports: [
				StoreModule.forRoot({
					[overlaysFeatureKey]: OverlayReducer
				})
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SandboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
