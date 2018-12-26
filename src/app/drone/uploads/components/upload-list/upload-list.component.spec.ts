import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadListComponent } from './upload-list.component';
import { MatProgressBar } from '@angular/material';
import { StoreModule } from '@ngrx/store';
import { UploadItemComponent } from '../upload-item/upload-item.component';

describe('UploadListComponent', () => {
	let component: UploadListComponent;
	let fixture: ComponentFixture<UploadListComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [StoreModule.forRoot({})],
			declarations: [UploadListComponent, UploadItemComponent, MatProgressBar]
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
