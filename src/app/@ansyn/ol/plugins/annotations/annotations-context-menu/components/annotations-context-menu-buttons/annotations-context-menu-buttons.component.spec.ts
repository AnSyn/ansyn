import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsContextMenuButtonsComponent } from './annotations-context-menu-buttons.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateModule } from '@ngx-translate/core';
import { MockComponent } from '../../../../../../ansyn/modules/core/test/mock-component';

describe('AnnotationsContextMenuButtonsComponent', () => {
	let component: AnnotationsContextMenuButtonsComponent;
	let fixture: ComponentFixture<AnnotationsContextMenuButtonsComponent>;

	const mockAnnotationLabelComponent = MockComponent({
		selector: 'ansyn-annotation-label',
		inputs: ['label', 'labelSize', 'translateOn'],
		outputs: ['onChangeText', 'onChangeSize', 'onTranslateClick']
	});

	const mockAnnotationsWeightComponent = MockComponent({
		selector: 'ansyn-annotations-weight',
		inputs: ['show', 'properties'],
		outputs: ['selectLineStyle']
	});

	const mockAnnotationsColorComponent = MockComponent({
		selector: 'ansyn-annotations-color',
		inputs: ['show', 'properties', 'fillModeActive', 'strokeModeActive'],
		outputs: ['colorChange', 'activeChange']
	});

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				AnnotationsContextMenuButtonsComponent,
				mockAnnotationLabelComponent,
				mockAnnotationsWeightComponent,
				mockAnnotationsColorComponent
			],
			imports: [
				TranslateModule.forRoot()
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationsContextMenuButtonsComponent);
		component = fixture.componentInstance;
		component.featureId = 'featureId';
		component.annotations = <any>{
			idToEntity: new Map([['featureId', { originalEntity: { featureJson: { properties: {} } } }]]),
			getJsonFeatureById: () => ({ properties: {} })
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click on remove feature button', () => {
		spyOn(component, 'removeFeature');
		const de: DebugElement = fixture.debugElement.query(By.css('button.removeFeature'));
		de.triggerEventHandler('click', {});
		expect(component.removeFeature).toHaveBeenCalled();
	});

});
