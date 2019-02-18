import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SandboxComponent } from './sandbox.component';
import { AnsynApi } from '@ansyn/ansyn';

describe('SandboxComponent', () => {
	let component: SandboxComponent;
	let fixture: ComponentFixture<SandboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SandboxComponent],
			providers: [
				{
					provide: AnsynApi,
					useValue: {}
				}
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
