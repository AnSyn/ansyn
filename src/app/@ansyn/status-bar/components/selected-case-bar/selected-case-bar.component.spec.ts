import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCaseBarComponent } from './selected-case-bar.component';

describe('SelectedCaseBarComponent', () => {
	let component: SelectedCaseBarComponent;
	let fixture: ComponentFixture<SelectedCaseBarComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [SelectedCaseBarComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(SelectedCaseBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
