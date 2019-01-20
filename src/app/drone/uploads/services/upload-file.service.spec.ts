import { inject, TestBed } from '@angular/core/testing';
import { UploadFileService } from './upload-file.service';
import { HttpClientModule } from '@angular/common/http';

describe('UploadFileService', () => {
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [UploadFileService]
		});
	});

	it('should be created', inject([UploadFileService], (service: UploadFileService) => {
		expect(service).toBeTruthy();
	}));
});
