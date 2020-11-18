import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CasesContainerComponent } from './cases-container.component';

describe('CasesContainerComponent', () => {
	let component: CasesContainerComponent;
	let fixture: ComponentFixture<CasesContainerComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CasesContainerComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasesContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
