import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadItemComponent } from './upload-item.component';
import { MatProgressBar } from '@angular/material';
import { UploadFileService } from '../../services/upload-file.service';

describe('UploadItemComponent', () => {
	let component: UploadItemComponent;
	let fixture: ComponentFixture<UploadItemComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [UploadItemComponent, MatProgressBar],
			providers: [
				{
					provide: UploadFileService,
					useValue: {
						cutName: (a) => a
					}
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(UploadItemComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
