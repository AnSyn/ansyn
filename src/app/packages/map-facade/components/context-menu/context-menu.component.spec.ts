import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ContextMenuComponent } from './context-menu.component';
import { FormsModule } from '@angular/forms';
import { Store, StoreModule } from '@ngrx/store';
import { mapFeatureKey, MapReducer } from '../../reducers/map.reducer';
import { MapEffects } from '../../effects/map.effects';
import { EventEmitter } from '@angular/core';
import { ContextMenuDisplayAction, ContextMenuShowAction } from '../../actions/map.actions';

describe('ContextMenuComponent', () => {
	let component: ContextMenuComponent;
	let fixture: ComponentFixture<ContextMenuComponent>;
	let store: Store<any>;
	const mockMapEffects = {
		onContextMenuShow$: new EventEmitter<void>(),
		getFilteredOverlays$: new EventEmitter<void>()
	};

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [FormsModule, StoreModule.forRoot({ [mapFeatureKey]: MapReducer })],
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

	it('onMousewheel should get hide function', () => {
		spyOn(component, 'hide');
		component.onMousewheel();
		expect(component.hide).toHaveBeenCalled();
	});

	it('onContextMenu should call preventDefault on event arg', () => {
		const $event = jasmine.createSpyObj({
			preventDefault: () => {
			}
		});
		component.onContextMenu($event);
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
		expect(elem.style.top).not.toEqual('2px');
		expect(elem.style.left).not.toEqual('1px');
		const action = <ContextMenuShowAction> { payload: { e: { x: 1, y: 2 } } };
		component.show(action);
		expect(elem.focus).toHaveBeenCalled();
		expect(elem.style.top).toEqual('2px');
		expect(elem.style.left).toEqual('1px');
	});

	it('clickNext should calculate next overlay(via subFilter) and call displayOverlayEvent', () => {
		component.nextfilteredOverlays = [
			{ id: '1', [component.filterField]: 'a' },
			{ id: '2', [component.filterField]: 'b' },
			{ id: '3', [component.filterField]: 'a' }
		] as any[];
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickNext($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.nextfilteredOverlays[0]);

		component.clickNext($event, 'b');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.nextfilteredOverlays[1]);
	});

	it('clickPrev should calculate prev overlay(via subFilter) and call displayOverlayEvent', () => {
		component.prevfilteredOverlays = [
			{ id: '1', [component.filterField]: 'b' },
			{ id: '2', [component.filterField]: 'a' },
			{ id: '3', [component.filterField]: 'c' },
			{ id: '4', [component.filterField]: 'b' }
		] as any[];
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickPrev($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.prevfilteredOverlays[0]);

		component.clickPrev($event, 'a');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.prevfilteredOverlays[1]);
	});

	it('clickLast should calculate last overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', [component.filterField]: 'c' },
			{ id: '2', [component.filterField]: 'c' },
			{ id: '3', [component.filterField]: 'c' },
			{ id: '4', [component.filterField]: 'b' }
		] as any[];
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
			{ id: '1', [component.filterField]: 'a' },
			{ id: '2', [component.filterField]: 'c' },
			{ id: '3', [component.filterField]: 'c' },
			{ id: '4', [component.filterField]: 'c' }
		] as any[];
		const $event = <MouseEvent> null;
		spyOn(component, 'displayOverlayEvent');
		component.clickFirst($event);
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[0]);

		component.clickFirst($event, 'c');
		expect(component.displayOverlayEvent).toHaveBeenCalledWith($event, component.filteredOverlays[1]);
	});

	it('clickBest should calculate best(resolution) overlay(via subFilter) and call displayOverlayEvent', () => {
		component.filteredOverlays = [
			{ id: '1', [component.filterField]: 'c', bestResolution: 3.5 },
			{ id: '2', [component.filterField]: 'c', bestResolution: 1.25 }, // best of "c" (index 1)
			{ id: '3', [component.filterField]: 'b', bestResolution: 0.5 }, // best (index 2)
			{ id: '4', [component.filterField]: 'c', bestResolution: 1.5 }
		] as any[];
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

	describe('mousedown event should call action only on left click', () => {
		let menuOpenButton: HTMLButtonElement;
		beforeEach(() => {
			menuOpenButton = fixture.nativeElement.querySelector('button.menu-open-button');
		});

		it('isClick should have been call on mousedown', () => {
			spyOn(component, 'isClick');
			const mouseDown = new MouseEvent('mousedown');
			menuOpenButton.dispatchEvent(mouseDown);
			expect(component.isClick).toHaveBeenCalled();
		});

		it('action (setPinPoint) should have been call', () => {
			spyOn(component, 'setPinPoint');
			// button 0 = witch 1.
			const mouseDown = new MouseEvent('mousedown', { button: 0 });
			menuOpenButton.dispatchEvent(mouseDown);
			expect(component.setPinPoint).toHaveBeenCalled();
		});

		it('action (setPinPoint) should not have been call', () => {
			spyOn(component, 'setPinPoint');
			// button 1 = witch 2.
			const mouseDown = new MouseEvent('mousedown', { button: 1 });
			menuOpenButton.dispatchEvent(mouseDown);
			expect(component.setPinPoint).not.toHaveBeenCalled();
		});

	});


});
