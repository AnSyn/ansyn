import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnnotationsControlComponent } from './annotations-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { ToolsReducer } from '../../reducers/tools.reducer';


describe('AnnotationsControlComponent', () => {
	let component: AnnotationsControlComponent;
	let fixture: ComponentFixture<AnnotationsControlComponent>;
	let store: Store<any>;


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsControlComponent],
			imports: [FormsModule, StoreModule.provideStore({ tools: ToolsReducer })],
			/*	providers: [{
						provide: 'DOCUMENT',  useClass: MockDocument
					}]*/
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationsControlComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<any>) => {
		spyOn(_store, 'dispatch');
		store = _store;

	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('open line width selection', () => {
		spyOn(component.lineWidthSelection.nativeElement, 'focus');

		component.lineWidthTrigger = true;
		component.openLineWidthSelection();
		expect(component.lineWidthTrigger).toBe(false);

		component.openLineWidthSelection();

		expect(component.lineWidthSelection.nativeElement.focus).toHaveBeenCalled();


	});

	it('close line width selection', () => {
		spyOn(component.lineWidthSelection.nativeElement, 'blur');

		component.closeLineWidthSelection();

		expect(component.lineWidthTrigger).toBeFalsy();
		expect(component.lineWidthSelection.nativeElement.blur).not.toHaveBeenCalled();


		// component.document.activeElement = ;
		spyOnProperty(component.document, 'activeElement', 'get').and.returnValue(component.lineWidthSelection.nativeElement);

		expect(component.document.activeElement).toEqual(component.lineWidthSelection.nativeElement);


		component.closeLineWidthSelection();
		expect(component.lineWidthTrigger).toBe(true);
		expect(component.lineWidthSelection.nativeElement.blur).toHaveBeenCalled();

	});

	it('toggle color selection', () => {
		const $event = jasmine.createSpyObj('$event', ['stopPropagation']);

		component.subscriber = {
			unsubscribe: function () {
			}
		};

		spyOn(component, 'clickOutside');

		component.subscriber = jasmine.createSpyObj('subscriber', ['unsubscribe']);

		this.colorSelectionTrigger = false;
		component.toggleColorSelection($event);
		fixture.detectChanges();
		let result = component.colorSelection.nativeElement.classList.contains('open');
		expect(result).toBe(true);
		expect(component.clickOutside).toHaveBeenCalled();
		expect(component.subscriber.unsubscribe).not.toHaveBeenCalled();

		component.clickOutside['calls'].reset();

		component.toggleColorSelection($event);
		fixture.detectChanges();
		result = component.colorSelection.nativeElement.classList.contains('open');
		expect(result).toBe(false);
		expect(component.clickOutside['calls'].count()).toBe(0);
		expect(component.subscriber.unsubscribe).toHaveBeenCalled();

	});

	it('click outside', () => {

	});

	it('open me', () => {

	});

	it('createInteraction', () => {
		component.createInteraction('Point');
		const args = store.dispatch['calls'].mostRecent().args;
		expect(args[0].payload.type).toBe('Point');
		expect(args[0].payload.maps).toBe('active');
	});

	it('select line width', () => {
		component.selectLineWidth({ target: { dataset: { index: 5 } } });
		const args = store.dispatch['calls'].mostRecent().args;
		expect(args[0].payload.value).toBe(5);

	});

	it('change stroke color', () => {
		component.colorOptionsStroke = 'tmp';
		component.changeStrokeColor();
		const args = store.dispatch['calls'].mostRecent().args;
		expect(args[0].payload.value).toBe('tmp');

	});

	it('change fill color', () => {
		component.colorOptionsFill = 'tmp';
		component.changeFillColor();
		const args = store.dispatch['calls'].mostRecent().args;
		expect(args[0].payload.value).toBe('tmp');
	});


});
