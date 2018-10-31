import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadsComponent } from './uploads.component';
import { AnsynFormsModule } from '@ansyn/core';
import { FormsModule } from '@angular/forms';

describe('UploadsComponent', () => {
	let component: UploadsComponent;
	let fixture: ComponentFixture<UploadsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [AnsynFormsModule, FormsModule],
			declarations: [UploadsComponent]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
