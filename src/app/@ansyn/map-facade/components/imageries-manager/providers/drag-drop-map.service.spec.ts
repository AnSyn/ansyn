import { TestBed } from '@angular/core/testing';

import { DragDropMapService } from './drag-drop-map.service';
import { StoreModule } from '@ngrx/store';
import { DOCUMENT } from '@angular/common';

describe('DragDropMapService', () => {
	beforeEach(() => TestBed.configureTestingModule({
		imports: [StoreModule.forRoot({})],
		providers: [
			DragDropMapService,
			{
				provide: DOCUMENT,
				useValue: document
			}
		]
	}));

	it('should be created', () => {
		const service: DragDropMapService = TestBed.get(DragDropMapService);
		expect(service).toBeTruthy();
	});
});
