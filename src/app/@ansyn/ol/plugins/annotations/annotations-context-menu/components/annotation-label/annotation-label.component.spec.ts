import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationLabelComponent } from './annotation-label.component';

describe('AnnotationLabelComponent', () => {
	let component: AnnotationLabelComponent;
	let fixture: ComponentFixture<AnnotationLabelComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationLabelComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationLabelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
