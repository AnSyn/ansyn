import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { AnnotationContextMenuComponent } from './annotation-context-menu.component';
import { DebugElement } from '@angular/core';
import { MapEffects } from '../../effects/map.effects';
import { Store, StoreModule } from '@ngrx/store';
import { IMapState, mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { Actions } from '@ngrx/effects';
import { Subject } from 'rxjs/Subject';
import { By } from '@angular/platform-browser';

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
						positionChanged$: new Subject(),
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
			spyOn(component.host.nativeElement, 'focus');
		});

		it(`check Circle annotation shape`, () => {
			const actionPayload = {
				payload: {
					featureId: 'featureId',
					boundingRect: {
						top: 100,
						height: 100,
						left: 100,
						width: 100,
						rotation: 30
					}
				}
			};

			(<Subject<any>>component.mapEffect.annotationContextMenuTrigger$).next(actionPayload);

			expect(component.contextMenuWrapperStyle).toEqual({
				top: '100px',
				height: '100px',
				left: '100px',
				width: '100px',
				transform: `rotate(${30}deg)`
			});

			expect(component.host.nativeElement.focus).toHaveBeenCalled();
		});
	});

	it('positionChanged$ should close context menu (by blur)', () => {
		spyOn(component.host.nativeElement, 'blur');
		(<Subject<any>>component.mapEffect.positionChanged$).next();
		expect(component.host.nativeElement.blur).toHaveBeenCalled();
	});

	it('click on remove feature button', () => {
		spyOn(component, 'removeFeature');
		const de: DebugElement = fixture.debugElement.query(By.css('button.removeFeature'));
		de.triggerEventHandler('mousedown', {});
		expect(component.removeFeature).toHaveBeenCalled();
	});


});
