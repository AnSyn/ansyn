import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnnotationContextMenuComponent } from './annotation-context-menu.component';
import { DebugElement } from '@angular/core';
import { Store, StoreModule } from '@ngrx/store';
import { Actions } from '@ngrx/effects';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { EventEmitter } from '@angular/core';
import {
	AnnotationInteraction,
	IAnnotationsSelectionEventData
} from '../../models/annotations.model';
import {
	AnnotationsColorComponent,
	AnnotationsWeightComponent, ClickOutsideDirective, ColorPickerComponent,
	IMapState, mapFeatureKey, MapReducer,
	PositionChangedAction
} from '@ansyn/map-facade';
import { AnnotationSelectAction } from '../../actions/tools.actions';

describe('AnnotationContextMenuComponent', () => {
	let component: AnnotationContextMenuComponent;
	let fixture: ComponentFixture<AnnotationContextMenuComponent>;
	let store: Store<IMapState>;
	let actions: EventEmitter<PositionChangedAction | AnnotationSelectAction>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				{ provide: Actions, useValue: new EventEmitter() },
			],
			declarations: [
				AnnotationContextMenuComponent,
				AnnotationsWeightComponent,
				AnnotationsColorComponent,
				ColorPickerComponent,
				ClickOutsideDirective
			],
			imports: [
				FormsModule,
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer })
			]
		}).compileComponents();
	});

	beforeEach(inject([Store, Actions], (_store: Store<IMapState>, _actions: EventEmitter<any>) => {
		store = _store;
		fixture = TestBed.createComponent(AnnotationContextMenuComponent);
		component = fixture.componentInstance;
		component.mapState = <any> { id: 'mapId' }
		actions = _actions;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('check annotation context menu trigger the focus and styling', () => {
		beforeEach(() => {
			spyOn(component.host.nativeElement, 'click');
		});

		it(`check Circle annotation shape`, () => {
			const action = new AnnotationSelectAction({
				type: '',
				showMeasures: false,
				showLabel: false,
				interactionType: AnnotationInteraction.click,
				featureId: 'featureId',
				label: '',
				mapId: 'mapId',
				style: {},
				boundingRect: {
					top: 100,
					height: 100,
					left: 100,
					width: 100
				}
			});

			actions.next(action);

			expect(component.clickMenuProps.boundingRect).toEqual({
				top: 100,
				height: 100,
				left: 100,
				width: 100
			});

		});
	});

	it('positionChanged$ should close context menu (by blur)', () => {
		actions.emit(new PositionChangedAction(<any>{ id: '', position: null }));
		expect(component.clickMenuProps).toBeNull();
	});

	it('click on remove feature button', () => {
		component.clickMenuProps = {
			showLabel: true,
			featureId: 'featureId',
			label: 'label',
			mapId: 'mapId',
			type: 'Rectangle',
			style: {},
			boundingRect: {
				top: 100,
				height: 100,
				left: 100,
				width: 100
			}
		};
		fixture.detectChanges();
		spyOn(component, 'removeFeature');
		const de: DebugElement = fixture.debugElement.query(By.css('button.removeFeature'));
		de.triggerEventHandler('click', {});
		expect(component.removeFeature).toHaveBeenCalled();
	});


});
