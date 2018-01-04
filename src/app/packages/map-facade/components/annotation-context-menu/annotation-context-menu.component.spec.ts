import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnnotationContextMenuComponent } from './annotation-context-menu.component';
import { DebugElement } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { Store, StoreModule } from '@ngrx/store';
import { IMapState, mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs/Subject';
import { By } from '@angular/platform-browser';
import { AnnotationsContextMenuEvent } from '@ansyn/core/models/visualizers/annotations.model';

describe('AnnotationContextMenuComponent', () => {
	let component: AnnotationContextMenuComponent;
	let fixture: ComponentFixture<AnnotationContextMenuComponent>;
	let store: Store<IMapState>;

	beforeEach(() => {
		TestBed.configureTestingModule({
			providers: [
				Actions,
				{
					provide: MapEffects, useValue: {
					annotationContextMenuTrigger$: new Subject()
				}
				}

			],
			declarations: [
				AnnotationContextMenuComponent
			],
			imports: [
				StoreModule.forRoot({ [mapFeatureKey]: MapReducer })
			]
		}).compileComponents();
	});

	beforeEach(inject([Store], (_store: Store<IMapState>) => {
		store = _store;
		fixture = TestBed.createComponent(AnnotationContextMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('check annotation context menu trigger the focus and styling', () => {
		beforeEach(() => {
			spyOn(component.host.nativeElement, 'setAttribute');
			spyOn(component.host.nativeElement, 'focus');
		});

		const tests = [
			{ type: 'Circle', result: 'top:100px;left:100px;width:100px;height:100px;' },
			{ type: 'Box', result: 'top:98px;left:98px;width:102px;height:101px;' },
			{ type: 'Point', result: 'top:88px;left:88px;width:122px;height:122px;' }
		];

		tests.forEach(item => {
			it(`check ${item.type} annotation shape`, () => {
				const actionPayload = {
					featureId: 'featureId',
					payload: {
						geometryName: `Annotate-${item.type}`,
						pixels: {
							top: 100,
							height: 100,
							left: 100,
							width: 100
						}
					}
				};
				(<Subject<any>>component.mapEffect.annotationContextMenuTrigger$).next(actionPayload);

				expect(component.host.nativeElement.setAttribute).toHaveBeenCalledWith(
					'style', item.result);

				expect(component.host.nativeElement.focus).toHaveBeenCalled();
			});
		});
	});

	it('click on remove feature button', () => {
		spyOn(component, 'removeFeature');
		const de: DebugElement = fixture.debugElement.query(By.css('button.removeFeature'));
		de.triggerEventHandler('mousedown', {});
		expect(component.removeFeature).toHaveBeenCalled();
	});


});
