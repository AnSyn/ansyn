import { BoldPipe } from './bold.pipe';
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

	it('will return bold text', () => {
		const option = 'bold';
		const input = 'ol';
		const output = '<span>b<strong>ol</strong>d</span>';
		expect(boldPipe.transform(option, input)).toEqual(output);
	});

	it('will return the same text', () => {
		const option = 'bold';
		const input = 'e';
		expect(boldPipe.transform(option, input)).toEqual(option);
	})
});
