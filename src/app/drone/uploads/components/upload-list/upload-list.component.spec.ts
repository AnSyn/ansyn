import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadListComponent } from './upload-list.component';
import { UploadProgressBarComponent } from '@ansyn/core';
import { MatProgressBar } from '@angular/material';
import { StoreModule } from '@ngrx/store';

describe('UploadListComponent', () => {
	let component: UploadListComponent;
	let fixture: ComponentFixture<UploadListComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({})],
			declarations: [UploadListComponent, UploadProgressBarComponent, MatProgressBar]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadListComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
