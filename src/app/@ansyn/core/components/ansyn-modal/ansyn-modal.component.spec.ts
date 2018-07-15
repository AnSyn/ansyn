import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynModalComponent } from './ansyn-modal.component';

describe('AnsynModalComponent', () => {
	let component: AnsynModalComponent;
	let fixture: ComponentFixture<AnsynModalComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynModalComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynModalComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
