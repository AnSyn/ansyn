import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { DynamicMetadataFormComponent } from './dynamic-metadata-form.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


describe('DynamicMetadataFormComponent', () => {
	let component: DynamicMetadataFormComponent;
	let fixture: ComponentFixture<DynamicMetadataFormComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [DynamicMetadataFormComponent],
			imports: [		
				ReactiveFormsModule,
				TranslateModule.forRoot()
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
