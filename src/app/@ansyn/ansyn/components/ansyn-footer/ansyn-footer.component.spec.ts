import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnsynFooterComponent } from './ansyn-footer.component';

describe('AnsynFooterComponent', () => {
	let component: AnsynFooterComponent;
	let fixture: ComponentFixture<AnsynFooterComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnsynFooterComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnsynFooterComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
