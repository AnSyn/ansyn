import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UtmHolderComponent } from './utm-holder.component';

describe('UtmHolderComponent', () => {
	let component: UtmHolderComponent;
	let fixture: ComponentFixture<UtmHolderComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [UtmHolderComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UtmHolderComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
