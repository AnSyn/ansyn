import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from './context-menu.component';
import { FormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { MapReducer } from '../../reducers/map.reducer';
import { MapEffects } from '../../effects/map.effects';
import { EventEmitter } from '@angular/core';
import { ContextMenuDisplayAction, ContextMenuShowAction } from '../../actions/map.actions';
import { EffectsTestingModule } from '@ngrx/effects/testing';

describe('ContextMenuComponent', () => {
	let component: ContextMenuComponent;
	let fixture: ComponentFixture<ContextMenuComponent>;
	let store: Store<any>;
	const mockMapEffects = { onContextMenuShow$: new EventEmitter<void>() };

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, EffectsTestingModule, StoreModule.provideStore({ map: MapReducer })],
			declarations: [ContextMenuComponent],
			providers: [{ provide: MapEffects, useValue: mockMapEffects }]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<any>) => {
		fixture = TestBed.createComponent(ContextMenuComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be created', () => {
		expect(component).toBeTruthy();
	});

	it('tabindex attribute should return zero', () => {
		expect(component.tabindex).toEqual(0);
	});

	it('onmousewheel should get hide function', () => {
		spyOn(component, 'hide');
		component.onmousewheel();
		expect(component.hide).toHaveBeenCalled();
	});

	it('contextmenu should call preventDefault on event arg', () => {
		const $event = jasmine.createSpyObj({
			preventDefault: () => {
			}
		});
		component.contextmenu($event);
		expect($event.preventDefault).toHaveBeenCalled();
	});

	it('hide should call to blur on host element', () => {
		spyOn(fixture.nativeElement, 'blur');
		component.hide();
		expect(fixture.nativeElement.blur).toHaveBeenCalled();
	});

	it('show should: save action, set {top, left} on host element(by renderer), call focus(host element) and initializeSensors', () => {
		const elem = fixture.nativeElement;
		spyOn(elem, 'focus');
		spyOn(component, 'initializeSensors');
		expect(elem.style.top).not.toEqual('2px');
		expect(elem.style.left).not.toEqual('1px');
		const action = <ContextMenuShowAction> { payload: { e: { x: 1, y: 2 } } };
		component.show(action);
		expect(component.initializeSensors).toHaveBeenCalled();
		expect(elem.focus).toHaveBeenCalled();
		expect(elem.style.top).toEqual('2px');
		expect(elem.style.left).toEqual('1px');
	});

	it('clickNext should calculate next overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', sensorName: 'a' },
			{ id: '2', sensorName: 'b' },
			{ id: '3', sensorName: 'a' }
		];
		component.displayedOverlayIndex = 0;
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickNext($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[1]);

		component.displayedOverlayIndex = 0;
		component.clickNext($event, 'a');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[2]);
	});

	it('clickPrev should calculate prev overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', sensorName: 'b' },
			{ id: '2', sensorName: 'a' },
			{ id: '3', sensorName: 'c' },
			{ id: '4', sensorName: 'b' },
		];
		component.displayedOverlayIndex = 3; // b
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickPrev($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[2]);

		component.displayedOverlayIndex = 3;
		component.clickPrev($event, 'b');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[0]);
	});

	it('clickLast should calculate last overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', sensorName: 'c' },
			{ id: '2', sensorName: 'c' },
			{ id: '3', sensorName: 'c' },
			{ id: '4', sensorName: 'b' },
		];
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickLast($event);
		expect(component.displayOverlayEvent)
			.toHaveBeenCalledWith($event, component.filteredOverlays[3]);
		component.clickLast($event, 'c');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[2]);
	});

	it('clickFirst should calculate first overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', sensorName: 'a' },
			{ id: '2', sensorName: 'c' },
			{ id: '3', sensorName: 'c' },
			{ id: '4', sensorName: 'c' },
		];
		component.displayedOverlayIndex = 3;
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickFirst($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[0]);

		component.displayedOverlayIndex = 3;
		component.clickFirst($event, 'c');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[1]);
	});

	it('clickBest should calculate best(resolution) overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', sensorName: 'c', bestResolution: 3.5 },
			{ id: '2', sensorName: 'c', bestResolution: 1.25 }, // best of "c" (index 1)
			{ id: '3', sensorName: 'b', bestResolution: 0.5 }, // best (index 2)
			{ id: '4', sensorName: 'c', bestResolution: 1.5 },
		];
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickBest($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[2]);
		component.clickBest($event, 'c');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[1]);
	});

	it('displayOverlayEvent should get event and overlay, call stopPropagation and store dispatch', () => {
		spyOn(store, 'dispatch');
		const $event = <MouseEvent> jasmine.createSpyObj({
			stopPropagation: () => {
			}
		});
		component.displayOverlayEvent($event, { id: '6' });
		expect(store.dispatch).toHaveBeenCalledWith(new ContextMenuDisplayAction('6'));

	});

});
