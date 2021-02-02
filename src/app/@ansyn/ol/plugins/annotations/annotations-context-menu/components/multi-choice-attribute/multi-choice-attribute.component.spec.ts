import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiChoiceAttributeComponent } from './multi-choice-attribute.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';

describe('MultiChoiceAttributeComponent', () => {
	let component: MultiChoiceAttributeComponent;
	let fixture: ComponentFixture<MultiChoiceAttributeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ MultiChoiceAttributeComponent ],
			imports: [ ReactiveFormsModule, MatChipsModule, MatFormFieldModule, MatMenuModule, TranslateModule.forRoot() ],
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
