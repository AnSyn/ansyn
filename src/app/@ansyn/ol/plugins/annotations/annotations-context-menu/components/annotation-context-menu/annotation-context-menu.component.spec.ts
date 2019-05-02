import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationContextMenuComponent } from './annotation-context-menu.component';
import { DebugElement, EventEmitter } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

import { AnnotationsColorComponent } from '../annotations-color/annotations-color.component';
import { ColorPickerComponent } from '../color-picker/color-picker.component';
import { AnnotationsWeightComponent } from '../annotations-weight/annotations-weight.component';
import { ClickOutsideDirective } from '@ansyn/imagery';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatInputModule } from '@angular/material';

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
				FormsModule,
				ColorPickerModule,
				MatInputModule
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

	it('click on remove feature button', () => {
		component.openMenus = {
			'featureId': {
				featureId: 'featureId',
				label: 'label',
				style: {},
				boundingRect: () => ({
					top: '100px',
					height: '100px',
					left: '100px',
					width: '100px'
				})
			}
		};
		component.openMenusArray = Object.values(component.openMenus);
		fixture.detectChanges();
		spyOn(component, 'removeFeature');
		const de: DebugElement = fixture.debugElement.query(By.css('button.removeFeature'));
		de.triggerEventHandler('click', {});
		expect(component.removeFeature).toHaveBeenCalledWith('featureId');
	});


});
