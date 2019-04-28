import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationContextMenuComponent } from './annotation-context-menu.component';
import { DebugElement, EventEmitter } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AnnotationsColorComponent } from '../annotations-color/annotations-color.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { AnnotationsWeightComponent } from '../annotations-weight/annotations-weight.component';
import { ClickOutsideDirective } from '../../directives/click-outside.directive';
import { ImageryCommunicatorService } from '@ansyn/imagery';

describe('AnnotationContextMenuComponent', () => {
	let component: AnnotationContextMenuComponent;
	let fixture: ComponentFixture<AnnotationContextMenuComponent>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ImageryCommunicatorService,
				{ provide: Actions, useValue: new EventEmitter() }
			],
			declarations: [
				AnnotationContextMenuComponent,
				AnnotationsWeightComponent,
				AnnotationsColorComponent,
				ColorPickerComponent,
				ClickOutsideDirective
			],
			imports: [
				FormsModule
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationContextMenuComponent);
		component = fixture.componentInstance;
		component.mapState = <any>{ id: 'mapId' };
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('check annotation context menu trigger the focus and styling', () => {
		beforeEach(() => {
			spyOn(component.host.nativeElement, 'click');
		});
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
