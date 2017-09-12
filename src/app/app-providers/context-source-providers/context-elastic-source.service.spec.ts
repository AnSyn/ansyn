// import { TestBed, inject } from '@angular/core/testing';
// import { ContextElasticSource } from './context-elastic-source.service';
// import { ContextConfig } from '@ansyn/context/context.module';
//
// describe('ContextElasticSource', () => {
// 	let contextElasticSource: ContextElasticSource;
// 	beforeEach(() => {
// 		TestBed.configureTestingModule({
// 			providers: [
// 				ContextElasticSource,
// 				{ provide: ContextConfig, useValue: { uri: '', log: '', auth: '' } }
// 			]
// 		});
// 	});
//
// 	beforeEach(inject([ContextElasticSource], (_contextElasticSource: ContextElasticSource) => {
// 		contextElasticSource = _contextElasticSource;
// 	}));
//
// 	it('check that the module is initialized ', () => {
// 		expect(contextElasticSource).toBeTruthy();
// 	});
//
// 	it('should make sure client is initialized', () => {
// 		expect(contextElasticSource.client).not.toBeUndefined();
// 	});
// });
