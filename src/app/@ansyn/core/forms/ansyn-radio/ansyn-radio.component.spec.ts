import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynRadioComponent } from './ansyn-radio.component';

describe('AnsynRadioComponent', () => {
	let component: AnsynRadioComponent;
	let fixture: ComponentFixture<AnsynRadioComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynRadioComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynRadioComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
