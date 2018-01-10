import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnnotationsControlComponent } from './annotations-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';
import { AnnotationVisualizerAgentAction } from '../../actions/tools.actions';

describe('AnnotationsControlComponent', () => {
	let component: AnnotationsControlComponent;
	let fixture: ComponentFixture<AnnotationsControlComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsControlComponent],
			imports: [FormsModule, StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer })]
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


	describe('toggleColorSelection', () => {
		it('should toggle colorSelectionExpand value', () => {
			component.colorSelectionExpand = false;
			component.toggleColorSelection();
			expect(component.colorSelectionExpand).toBeTruthy();
		});

		it('should change lineWidthSelectionExpand to false', () => {
			component.toggleColorSelection();
			expect(component.lineWidthSelectionExpand).toBeFalsy();
		});

	});

	it('toggleDrawInteraction', () => {
		component.mode = undefined;
		component.createInteraction('Point');

		const args = store.dispatch['calls'].allArgs();

		expect(store.dispatch).toHaveBeenCalledTimes(2);

		expect(args[0][0].payload.mode).toBe('Point');
		expect(args[0][0].payload.relevantMaps).toBe('active');

		expect(args[1][0].payload).toEqual('Point');
	});

	it('createInteraction with mode set', () => {
		component.mode = 'Point';
		component.createInteraction('Point');
		const args = store.dispatch['calls'].allArgs();
		expect(args[1][0].payload).toEqual(undefined);
	});

	it('open color input', () => {
		const element = jasmine.createSpyObj(['getElementsByTagName']);
		const closest = jasmine.createSpy('closest').and.returnValue(element);
		element.getElementsByTagName.and.returnValue([{
			click: () => {
			}
		}
		]);
		const $event = {
			target: {
				closest
			}
		};

		component.openColorInput($event);
		expect(element.getElementsByTagName).toHaveBeenCalledWith('input');

	});

	it('select line width', () => {
		component.selectLineWidth(5);
		expect(component.selectedStrokeWidthIndex).toEqual(5);
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationVisualizerAgentAction({
			operation: 'changeLine',
			value: component.lineWidthList[5].width,
			relevantMaps: 'active'
		}))
	});

	it('change stroke color', () => {
		component.selectedStrokeColor = 'tmp';
		component.changeStrokeColor();
		const args = store.dispatch['calls'].mostRecent().args;
		expect(args[0].payload.value).toBe('tmp');

	});

	it('change fill color', () => {
		component.selectedFillColor = 'tmp';
		component.changeFillColor();
		const args = store.dispatch['calls'].mostRecent().args;
		expect(args[0].payload.value).toBe('tmp');
	});

});
