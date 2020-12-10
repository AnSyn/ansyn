import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AnnotationsWeightComponent } from './annotations-weight.component';

describe('AnnotationsWeightComponent', () => {
	let component: AnnotationsWeightComponent;
	let fixture: ComponentFixture<AnnotationsWeightComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsWeightComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationsWeightComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
