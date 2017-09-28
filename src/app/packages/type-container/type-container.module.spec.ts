import { TypeContainerService } from './services/type-container.service';
import { inject, TestBed } from '@angular/core/testing';
import { TypeContainerModule } from './type-container.module';


abstract class MockBaseClass {
	abstract sourceType: string;

	abstract get (query: any);
}

class Class1 extends MockBaseClass {
	sourceType = 'sourceType1';

	get (query: any): any {
		return { id: '123456' };
	}
}

class Class2 extends MockBaseClass {
	sourceType = 'sourceType2';

	get (query: any): any {
		return { id: '654321' };
	}
}

class Class3 extends MockBaseClass {
	sourceType = 'sourceType3';

	get (query: any): any {
		return { id: '162534' };
	}
}

describe('TypeContainerModule', () => {
	let typeContainerService: TypeContainerService;
	beforeEach(() => {
		TestBed.configureTestingModule({
			imports: [
				TypeContainerModule.register({
					baseType: MockBaseClass,
					type: Class1
				}),
				TypeContainerModule.register({
					baseType: MockBaseClass,
					type: Class2
				})
			],
			providers: [
				TypeContainerService
			]
		});
	});

	beforeEach(
		inject([TypeContainerService],
			(_typeContainerService: TypeContainerService) => {
				typeContainerService = _typeContainerService;
			}));

	it('should be defined', () => {
		expect(typeContainerService).toBeDefined();
	});

	it('should have two MockBaseClass', () => {
		expect(typeContainerService.resolve(MockBaseClass).length).toEqual(2);
	});

	it('should resolve Class1', () => {
		expect(typeContainerService.resolve(MockBaseClass)[0]).toEqual(new Class1());
	});

	it('should register new class derived from MockBaseClass', () => {
		let expectedValue = new Class3();
		typeContainerService.register(MockBaseClass, Class3);
		expect(typeContainerService.resolve(MockBaseClass)[2]).toEqual(expectedValue);
	});

	it('should remove Class1', () => {
		typeContainerService.unregister(MockBaseClass, Class1);
		expect(typeContainerService.resolve(MockBaseClass).length).toEqual(1);
	});

	it('should resolve all MockBaseClass', () => {
		expect(typeContainerService.resolve(MockBaseClass).length).toEqual(2);
	});
});
