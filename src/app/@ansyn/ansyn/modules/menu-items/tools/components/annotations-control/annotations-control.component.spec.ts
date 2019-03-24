import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnnotationsControlComponent } from './annotations-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';
import { AnnotationSetProperties, SetAnnotationMode } from '../../actions/tools.actions';
import { AnnotationsColorComponent, AnnotationsWeightComponent, ColorPickerComponent } from '../../../../core/public_api';

describe('AnnotationsControlComponent', () => {
	let component: AnnotationsControlComponent;
	let fixture: ComponentFixture<AnnotationsControlComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsControlComponent, ColorPickerComponent, AnnotationsColorComponent, AnnotationsWeightComponent],
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
			component.toggleSelection(component.SelectionBoxTypes.LineWidth);
			expect(component.selectedBox).toEqual(component.SelectionBoxTypes.LineWidth);
		});

		// it('unselect', () => {
		// 	component.selectedBox = component.SelectionBoxTypes.ColorPicker;
		// 	component.toggleSelection(component.SelectionBoxTypes.ColorPicker);
		// 	expect(component.selectedBox).toEqual(component.SelectionBoxTypes.None);
		// });
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

	it('select line width', () => {
		const width = 5;
		component.selectLineWidth({ width });
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties({
			'stroke-width': width
		}));
	});

	it('change stroke color', () => {
		const strokeColor = 'white';
		component.colorChange({event: strokeColor, label: 'stroke'});
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties({
			'stroke': strokeColor
		}));
	});

	it('change fill color', () => {
		const fill = 'black';
		component.colorChange({event: fill, label: 'fill'});
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties({
			fill,
			'marker-color': fill
		}));
	});

});
