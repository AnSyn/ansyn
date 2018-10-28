import { ShowMorePipe } from './show-more.pipe';
import { inject, TestBed } from '@angular/core/testing';

describe('ShowMorePipe', () => {
	let showMorePipe;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: filtersConfig,
					useValue: {}
				},
				ShowMorePipe
			]
		});
	});

	beforeEach(inject([ShowMorePipe], _showMorePipe => {
		showMorePipe = _showMorePipe;
	}));


	it('create an instance', () => {
		expect(showMorePipe).toBeTruthy();
	});
});
