import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicAttributeControlComponent } from './dynamic-attribute-control.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

describe('DynamicAttributeControlComponent', () => {
	let component: DynamicAttributeControlComponent;
	let fixture: ComponentFixture<DynamicAttributeControlComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ DynamicAttributeControlComponent ],
			imports: [ ReactiveFormsModule ],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DynamicAttributeControlComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
