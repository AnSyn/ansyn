import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiChoiceAttributeComponent } from './multi-choice-attribute.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule, MatMenuModule, MatFormFieldModule } from '@angular/material';

describe('MultiChoiceAttributeComponent', () => {
	let component: MultiChoiceAttributeComponent;
	let fixture: ComponentFixture<MultiChoiceAttributeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ MultiChoiceAttributeComponent ],
			imports: [ ReactiveFormsModule, MatChipsModule, MatFormFieldModule, MatMenuModule ],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(MultiChoiceAttributeComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
