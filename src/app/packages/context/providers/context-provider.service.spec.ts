import { TestBed, inject } from '@angular/core/testing';
import { ContextProviderService } from './context-provider.service';
import { IContextSource } from '../context.interface';
import { Observable } from 'rxjs/Observable';
import { isEqual } from 'lodash';

describe('Context Provider Service', () => {
	let contextProviderService: ContextProviderService;
	const mockContextSourceObject: IContextSource = {
		find: () => Observable.of([{ 'title': 'tmp' }]),
		remove: () => Observable.of({}),
		create: () => Observable.of({}),
		update: () => Observable.of({}),
		providerType: 'demo',
		parseToSource: data => data,
		parseFromSource: data => data
	};

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [ContextProviderService]
		});
	});


	beforeEach(inject([ContextProviderService], (_contextProviderService: ContextProviderService) => {
		contextProviderService = _contextProviderService;
	}));

	it('check that the module is initialized ', () => {
		expect(contextProviderService).toBeTruthy();
	});

	it('Func Name: register', () => {
		contextProviderService.register('demo', mockContextSourceObject);
		expect(contextProviderService.keys().length).toBe(1);
	});

	it('Func Name: provide', () => {
		contextProviderService.register('demo', mockContextSourceObject);
		const result = contextProviderService.provide('demo');
		expect(result).toBeTruthy();
	});

	it('Func Name keys', () => {
		contextProviderService.register('demo', mockContextSourceObject);
		contextProviderService.register('demo2', mockContextSourceObject);
		expect(isEqual(contextProviderService.keys(), ['demo', 'demo2'])).toBe(true);
	});
});
