import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnnotationsControlComponent } from './annotations-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';
import { noUndefined } from '@angular/compiler/src/util';
import { AnnotationVisualizerAgentAction, SetAnnotationMode } from '../../actions/tools.actions';


describe('AnnotationsControlComponent', () => {
	let component: AnnotationsControlComponent;
	let fixture: ComponentFixture<AnnotationsControlComponent>;
	let store: Store<any>;


	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsControlComponent],
			imports: [FormsModule, StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer })],
			/*	providers: [{
						provide: 'DOCUMENT',  useClass: MockDocument
					}]*/
		})
			.compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		spyOn(_store, 'dispatch');
		store = _store;
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationsControlComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('open line width selection', () => {
		spyOn(component.lineWidthSelection.nativeElement, 'focus');
		spyOn(component, 'createInteraction');

		component.mode = 'Point';
		component.openLineWidthSelection();
		expect(component.createInteraction).toHaveBeenCalled();

		component.createInteraction['calls'].reset();
		component.mode = undefined;
		component.openLineWidthSelection();
		expect(component.createInteraction).not.toHaveBeenCalled();

		component.lineWidthTrigger = true;
		component.openLineWidthSelection();
		expect(component.lineWidthTrigger).toBe(false);

		component.openLineWidthSelection();
		expect(component.lineWidthSelection.nativeElement.focus).toHaveBeenCalled();

	});

	it('Function setModeStyle', () => {
		component.setModeStyle('value');
		expect(component.mode).toBe('value');
	})

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

	describe('Function toggleColorSelection', () => {
		const $event = jasmine.createSpyObj('$event', ['stopPropagation']);
		it('Check click outside functionality', () => {
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
			expect(component.clickOutside).toHaveBeenCalledTimes(0);
			expect(component.subscriber.unsubscribe).toHaveBeenCalled();

		});

		it('check if mode is undefined /defined', () => {
			spyOn(component, 'createInteraction');
			component.mode = 'Point';
			component.toggleColorSelection($event);
			expect(component.createInteraction).toHaveBeenCalled();

			component.createInteraction['calls'].reset();
			component.mode = undefined;
			component.toggleColorSelection($event);
			expect(component.createInteraction).not.toHaveBeenCalled();
		})
	})


	xit('click outside', () => {

	});

	it('createInteraction', () => {
		component.mode = undefined;
		component.createInteraction('Point');

		const args = store.dispatch['calls'].allArgs();

		expect(store.dispatch).toHaveBeenCalledTimes(2);

		expect(args[0][0].payload.type).toBe('Point');
		expect(args[0][0].payload.maps).toBe('active');

		expect(args[1][0].payload).toEqual('Point');
	});

	it('createInteraction with mode set', () => {
		component.mode = 'Point';
		component.createInteraction('Point');
		const args = store.dispatch['calls'].allArgs();
		expect(args[1][0].payload).toEqual(undefined);
	});

	it('open color input', () => {
		const element = jasmine.createSpyObj(['getElementsByTagName'])
		const closest = jasmine.createSpy('closest').and.returnValue(element);
		element.getElementsByTagName.and.returnValue([{click : () => {}}]);
		const $event = {
			target: {
				closest
			}
		};

		component.openColorInput($event);
		expect(element.getElementsByTagName).toHaveBeenCalledWith('input');

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

	it('check ngOnDestrory', () => {
		const action = new AnnotationVisualizerAgentAction({
			action: 'removeLayer',
			value: this.colorOptionsStroke,
			maps: 'all'
		});
		component.ngOnDestroy();
		expect(store.dispatch).toHaveBeenCalledWith(action);
	})

});
