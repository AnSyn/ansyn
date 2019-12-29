import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnnotationContextMenuComponent } from './annotation-context-menu.component';
import { EventEmitter } from '@angular/core';
import { Actions } from '@ngrx/effects';
import { ImageryCommunicatorService } from '@ansyn/imagery';
import { MockComponent } from '../../../../../../ansyn/modules/core/test/mock-component';

describe('AnnotationContextMenuComponent', () => {
	let component: AnnotationContextMenuComponent;
	let fixture: ComponentFixture<AnnotationContextMenuComponent>;
	const mockAnnotationsContextMenuButtonsComponent = MockComponent({
		selector: 'ansyn-annotations-context-menu-buttons',
		inputs: ['annotations', 'featureId', 'selectedTab']
	});

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				ImageryCommunicatorService,
				{ provide: Actions, useValue: new EventEmitter() }
			],
			declarations: [
				AnnotationContextMenuComponent,
				mockAnnotationsContextMenuButtonsComponent
			]
		}).compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(AnnotationContextMenuComponent);
		component = fixture.componentInstance;
		component.mapId = 'mapId';
		spyOn(component, 'calcBoundingRect').and.returnValue({ top: `0px`, left: `0px`, width: `0px`, height: `0px` });
		spyOn(component, 'getFeatureProps').and.returnValue({});
		component.annotations = <any>{
			idToEntity: new Map(),
			getJsonFeatureById: () => ({ properties: {} })
		};
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});

});
