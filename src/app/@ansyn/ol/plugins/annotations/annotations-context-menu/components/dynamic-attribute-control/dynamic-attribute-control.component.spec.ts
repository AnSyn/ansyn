import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicAttributeControlComponent } from './dynamic-attribute-control.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

describe('DynamicAttributeControlComponent', () => {
	let component: DynamicAttributeControlComponent;
	let fixture: ComponentFixture<DynamicAttributeControlComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ DynamicAttributeControlComponent ],
			imports: [ ReactiveFormsModule, TranslateModule.forRoot() ],
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
