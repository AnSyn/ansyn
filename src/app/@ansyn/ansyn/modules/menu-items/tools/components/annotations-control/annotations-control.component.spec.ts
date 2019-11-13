import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { AnnotationsControlComponent } from './annotations-control.component';
import { Store, StoreModule } from '@ngrx/store';
import { toolsFeatureKey, ToolsReducer } from '../../reducers/tools.reducer';
import { AnnotationSetProperties, SetAnnotationMode } from '../../actions/tools.actions';
import { AnnotationMode, AnnotationsColorComponent, AnnotationsWeightComponent, ColorPickerComponent } from '@ansyn/ol';
import { ColorPickerModule } from 'ngx-color-picker';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../../core/test/mock-component';

const mockComboBoxOptionComponent = MockComponent({
	selector: 'ansyn-combo-box-option',
	inputs: ['value'],
	outputs: []
});

const mockComboBoxComponent = MockComponent({
	selector: 'ansyn-combo-box',
	inputs: ['options', 'comboBoxToolTipDescription', 'ngModel'],
	outputs: ['ngModelChange']
});

describe('AnnotationsControlComponent', () => {
	let component: AnnotationsControlComponent;
	let fixture: ComponentFixture<AnnotationsControlComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [AnnotationsControlComponent, ColorPickerComponent, AnnotationsColorComponent, AnnotationsWeightComponent, mockComboBoxComponent, mockComboBoxOptionComponent],
			imports: [
				FormsModule,
				StoreModule.forRoot({ [toolsFeatureKey]: ToolsReducer }),
				ColorPickerModule,
				TranslateModule.forRoot()
			]
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
		component.setAnnotationMode(AnnotationMode.Point);
		expect(store.dispatch).toHaveBeenCalledWith(new SetAnnotationMode({ annotationMode: AnnotationMode.Point }));
	});

	it('setAnnotationMode with mode set', () => {
		component.mode = AnnotationMode.Point;
		component.setAnnotationMode(AnnotationMode.Point);
		expect(store.dispatch).toHaveBeenCalledWith(new SetAnnotationMode(null));
	});

	it('select line width', () => {
		const style = {name: 'stylename', width: 5, dash: 0};
		component.selectLineStyle( style );
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties({
			'stroke-width': style.width,
			'stroke-dasharray': style.dash
		}));
	});

	it('change stroke color', () => {
		const strokeColor = 'white';
		component.colorChange([{ event: strokeColor, label: 'stroke' }]);
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties({
			'stroke': strokeColor
		}));
	});

	it('change fill color', () => {
		const fill = 'black';
		component.colorChange([{ event: fill, label: 'fill' }, { event: fill, label: 'marker-color' }]);
		expect(store.dispatch).toHaveBeenCalledWith(new AnnotationSetProperties({
			fill,
			'marker-color': fill
		}));
	});

});
