import { inject, TestBed } from '@angular/core/testing';

import { UploadFileService } from './upload-file.service';
import { UploadsConfig } from '../config/uploads-config';
import { HttpClientModule } from '@angular/common/http';

describe('UploadFileService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [UploadFileService,
				{provide: UploadsConfig, useValue: {}}
				]
		});
	});

	it('should be created', inject([UploadFileService], (service: UploadFileService) => {
		expect(service).toBeTruthy();
	}));
});
