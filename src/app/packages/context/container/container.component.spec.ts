import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { ContextProviderService } from '@ansyn/context';

import { ContainerComponent } from './container.component';
import { Observable } from 'rxjs/Observable';
import { IContextSource } from '../context.interface';

describe('ContainerComponent', () => {
	let component: ContainerComponent;
	let fixture: ComponentFixture<ContainerComponent>;
	let contextProviderService: ContextProviderService;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [ContainerComponent],
			imports: [FormsModule],
			providers: [ContextProviderService]
		})
			.compileComponents();

	}));

	beforeEach(inject([ContextProviderService], (_contextProviderService: ContextProviderService) => {
		console.log('t');
		contextProviderService = _contextProviderService;
		const proxyObject: IContextSource = {
			find: () => Observable.of([{ 'title': 'tmp' }]),
			remove: () => Observable.of({}),
			create: () => Observable.of({}),
			update: () => Observable.of({}),
			providerType: 'demo',
			parseToSource: data => data,
			parseFromSource: data => data
		};

		contextProviderService.register('demo', proxyObject);
		// spyOn(proxyObject,'find').and.returnValue(Observable.empty());
		spyOn(contextProviderService, 'provide').and.returnValue(proxyObject);
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(ContainerComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});


	it('should be created', () => {
		expect(component).toBeTruthy();
	});
});
