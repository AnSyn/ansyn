import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadProgressBarComponent } from './upload-progress-bar.component';
import { MatProgressBar } from '@angular/material';

describe('UploadProgressBarComponent', () => {
	let component: UploadProgressBarComponent;
	let fixture: ComponentFixture<UploadProgressBarComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UploadProgressBarComponent, MatProgressBar]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadProgressBarComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
