import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnotationsContextMenuButtonsComponent } from './annotations-context-menu-buttons.component';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { MockComponent } from '../../../../../../ansyn/modules/core/test/mock-component';
import { mockStayInImageryService } from '../../../../../../imagery/stay-in-imagery-service/stay-in-imagery.service.mock';
import { mockAnnotationsColorComponent } from '../annotations-color/annotations-color.component.mock';
import { AttributesService } from '../../services/attributes.service';
import { of } from 'rxjs';
import { OL_PLUGINS_CONFIG } from '../../../../plugins.config';
import { LoggerService } from '../../../../../../ansyn/modules/core/services/logger.service';
import { MockPipe } from '../../../../../../ansyn/modules/core/test/mock-pipe';

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

	const mockDynamicMetadataFormComponent = MockComponent({
		selector: 'ansyn-dynamic-metadata-form ',
		inputs: ['attributes'],
		outputs: ['onSubmit'],
	});

	const mockTranslatePipe = MockPipe('translate');

	const myComponent = AnnotationsContextMenuButtonsComponent;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [
				myComponent,
				mockAnnotationLabelComponent,
				mockAnnotationsWeightComponent,
				mockAnnotationsColorComponent,
				mockDynamicMetadataFormComponent,
				mockTranslatePipe
			],
		})
			.overrideComponent(myComponent, {
				set: {
					providers: [
						mockStayInImageryService,
						{
							provide: AttributesService,
							useValue: { getAttributes: () => of([]) },
						},
						{
							provide: OL_PLUGINS_CONFIG,
							useValue: { Annotations: { displayId: true } }
						},
						{
							provide: TranslateService,
							useValue: {}
						},
						{
							provide: LoggerService,
							useValue: {}
						}
					],
				},
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
