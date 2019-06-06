import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ImageryCommunicatorService } from '@ansyn/imagery';

import { ImageryExportComponent } from './imagery-export.component';
import { DOCUMENT } from '@angular/common';

describe('ImageryExportComponent', () => {
	let component: ImageryExportComponent;
	let fixture: ComponentFixture<ImageryExportComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ImageryExportComponent],
			imports: [ImageryCommunicatorService],
			providers: [
				{
					provide: DOCUMENT,
					useValue: document
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ImageryExportComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
