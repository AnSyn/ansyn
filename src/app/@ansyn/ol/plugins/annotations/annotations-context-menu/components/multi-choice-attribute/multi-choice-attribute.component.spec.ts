import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiChoiceAttributeComponent } from './multi-choice-attribute.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule, MatMenuModule, MatFormFieldModule, MatAutocompleteModule, MatButtonModule } from '@angular/material';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('MultiChoiceAttributeComponent', () => {
	let component: MultiChoiceAttributeComponent;
	let fixture: ComponentFixture<MultiChoiceAttributeComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ MultiChoiceAttributeComponent ],
			imports: [ NoopAnimationsModule, ReactiveFormsModule, MatChipsModule, MatFormFieldModule, MatMenuModule,MatAutocompleteModule, MatButtonModule, TranslateModule.forRoot() ],
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
