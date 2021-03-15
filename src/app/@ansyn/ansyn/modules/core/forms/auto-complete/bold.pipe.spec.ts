import { BoldPipe } from './bold.pipe';
import { filtersConfig } from '../../../filters/services/filters.service';
import { ShowMorePipe } from '../../../filters/pipes/show-more.pipe';
import { TestBed, inject } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

describe('BoldPipe', () => {
	let boldPipe;
	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: DomSanitizer,
					useValue: {
						bypassSecurityTrustHtml: (string) => string
					}
				}
			]
		});
	});

	beforeEach(inject([DomSanitizer], _domSanitizer => {
		boldPipe = new BoldPipe(_domSanitizer);
	}));

	it('create an instance', () => {
		expect(boldPipe).toBeTruthy();
	});
});
