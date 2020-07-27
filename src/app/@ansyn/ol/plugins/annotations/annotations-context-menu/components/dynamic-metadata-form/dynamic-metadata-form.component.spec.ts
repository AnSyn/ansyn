import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DynamicMetadataFormComponent } from './dynamic-metadata-form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule, MatIconModule, MatMenuModule, MatFormFieldModule } from '@angular/material';

describe('MetadataFormComponent', () => {
	let component: DynamicMetadataFormComponent;
	let fixture: ComponentFixture<DynamicMetadataFormComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [DynamicMetadataFormComponent],
			imports: [		
				ReactiveFormsModule
			],
			schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
		}).compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(DynamicMetadataFormComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
