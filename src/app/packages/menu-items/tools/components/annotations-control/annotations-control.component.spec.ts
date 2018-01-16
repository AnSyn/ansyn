import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnnotationsControlComponent } from './annotations-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';
import {
	AnnotationSetProperties,
	SetAnnotationMode
} from '../../actions/tools.actions';

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


	describe('toggleSelection should toggle selectionBox', () => {
		it('select', () => {
			component.selectedBox = undefined;
			component.toggleSelection(component.SelectionBoxes.lineWidth);
			expect(component.selectedBox).toEqual(component.SelectionBoxes.lineWidth);
		});

		it('unselect', () => {
			component.selectedBox = component.SelectionBoxes.colorPicker;
			component.toggleSelection(component.SelectionBoxes.colorPicker);
			expect(component.selectedBox).toBeUndefined();
		});
	});

	it('setAnnotationMode', () => {
		component.mode = undefined;
		component.setAnnotationMode('Point');
		expect(store.dispatch).toHaveBeenCalledWith(new SetAnnotationMode('Point'));
	});

	it('setAnnotationMode with mode set', () => {
		component.mode = 'Point';
		component.setAnnotationMode('Point');
		expect(store.dispatch).toHaveBeenCalledWith(new SetAnnotationMode());
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
		const strokeWidth = 5;
		component.selectLineWidth(strokeWidth);
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties( {
			strokeWidth
		}));
	});

	it('change stroke color', () => {
		const strokeColor = 'white';
		component.changeStrokeColor(strokeColor);
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties( {
			strokeColor
		}));
	});

	it('change fill color', () => {
		const fillColor = 'black';
		component.changeFillColor(fillColor);
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties( {
			fillColor
		}));
	});

});
