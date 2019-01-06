import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SendboxComponent } from './sendbox.component';
import { AnsynApi } from '@ansyn/ansyn';

describe('SendboxComponent', () => {
	let component: SendboxComponent;
	let fixture: ComponentFixture<SendboxComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SendboxComponent],
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
		fixture = TestBed.createComponent(SendboxComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
