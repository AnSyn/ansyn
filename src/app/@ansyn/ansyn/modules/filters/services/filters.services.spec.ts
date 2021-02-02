import { filtersConfig, FiltersService } from './filters.service';
import { inject, TestBed } from '@angular/core/testing';
import { HttpClientModule } from '@angular/common/http';

describe('FiltersService', () => {

	let filtersService: FiltersService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			providers: [FiltersService, { provide: filtersConfig, useValue: { filters: null } }]
		});
	});

	beforeEach(inject([FiltersService], (_filtersService: FiltersService) => {
		filtersService = _filtersService;
	}));

	it('should be defined', () => {
		expect(filtersService).toBeDefined();
	});

});
