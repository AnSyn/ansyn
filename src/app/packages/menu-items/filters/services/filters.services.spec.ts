import { filtersConfig, FiltersService } from './filters.service';
import { HttpModule } from '@angular/http';
import { inject, TestBed } from '@angular/core/testing';

describe('FiltersService', () => {

	let filtersService: FiltersService;

	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [HttpModule],
			providers: [FiltersService, {provide: filtersConfig, useValue: {filters: null}}]
		});
	});

	beforeEach(inject([FiltersService], (_filtersService: FiltersService) => {
		filtersService = _filtersService;
	}));

	it('should be defined', () => {
		expect(filtersService).toBeDefined();
	});

});
