import { GenericTypeResolver, InjectionResolverFilter } from './generic-type-resolver';
import { inject, TestBed } from '@angular/core/testing';
import { Injector } from '@angular/core';

abstract class MockBaseClass {
	field1;
	field2;
}

class Class1 extends MockBaseClass {
	field1 = 'Class1:field1';
	field2 = 'Class1:field2';
	field3 = 'Class1:field3';
}

class Class2 extends MockBaseClass {
	field1 = 'Class2:field1';
	field2 = 'Class2:field2';
	field4 = 'Class2:field4';
}

describe('GenericTypeResolver non multi', () => {
	let _injector: Injector;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: MockBaseClass,
					useClass: Class1
				}
			]
		});
	});

	beforeEach(
		inject([Injector],
			(injector: Injector) => {
				_injector = injector;
			}));

	it('resolveMultiInjection with non multi injection should just return the given class', () => {
		const resolvedValue: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, null);
		expect(resolvedValue instanceof Class1).toBeTruthy();
	});

	it('resolveMultiInjection with non multi injection and singelton should return the same instace', () => {
		const resolvedValue1: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, null, true);
		const resolvedValue2: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, null, true);
		expect(resolvedValue1 === resolvedValue2).toBeTruthy();
	});

	it('resolveMultiInjection with non multi injection and non singelton should return other instace', () => {
		const resolvedValue1: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, null, false);
		const resolvedValue2: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, null, false);
		expect(resolvedValue1 === resolvedValue2).toBeFalsy();
	});

});

describe('GenericTypeResolver multi', () => {
	let _injector: Injector;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{
					provide: MockBaseClass,
					useClass: Class1,
					multi: true
				},
				{
					provide: MockBaseClass,
					useClass: Class2,
					multi: true
				}
			]
		});
	});

	beforeEach(
		inject([Injector],
			(injector: Injector) => {
				_injector = injector;
			}));

	it('resolveMultiInjection with multi injection should return the class by the filter function', () => {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			const field1 = 'Class1:field1';

			return function resolverFilteringFunction(mockBaseClasses: MockBaseClass[]): MockBaseClass {
				return mockBaseClasses.find((item) => item.field1 === field1);
			};
		})();

		const resolvedValue: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, resolveFilterFunction);
		expect(resolvedValue instanceof Class1).toBeTruthy();
	});

	it('resolveMultiInjection with multi injection should and singelton should return the same instace', () => {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			const field1 = 'Class1:field1';

			return function resolverFilteringFunction(mockBaseClasses: MockBaseClass[]): MockBaseClass {
				return mockBaseClasses.find((item) => item.field1 === field1);
			};
		})();

		const resolvedValue1: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, resolveFilterFunction, true);
		const resolvedValue2: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, resolveFilterFunction, true);
		expect(resolvedValue1 === resolvedValue2).toBeTruthy();
	});

	it('resolveMultiInjection with multi injection should and singelton should return the same instace', () => {
		const resolveFilterFunction: InjectionResolverFilter = (function wrapperFunction() {
			const field1 = 'Class1:field1';

			return function resolverFilteringFunction(mockBaseClasses: MockBaseClass[]): MockBaseClass {
				return mockBaseClasses.find((item) => item.field1 === field1);
			};
		})();

		const resolvedValue1: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, resolveFilterFunction, false);
		const resolvedValue2: MockBaseClass = GenericTypeResolver.resolveMultiInjection(_injector, MockBaseClass, resolveFilterFunction, false);
		expect(resolvedValue1 === resolvedValue2).toBeFalsy();
	});

});
