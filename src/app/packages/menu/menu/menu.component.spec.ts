import { ComponentRef } from '@angular/core';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { MenuItem } from '../models';
import { Store, StoreModule } from '@ngrx/store';
import { IMenuState, MenuReducer } from '../reducers/menu.reducer';
import { SelectMenuItemAction, UnSelectMenuItemAction } from '../actions';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('MenuComponent', () => {
	let menuComponent: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;
	let element: any;
	let store: Store<IMenuState>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule, StoreModule.provideStore({ menu: MenuReducer })],
			declarations: [MenuComponent],
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IMenuState>) => {
		fixture = TestBed.createComponent(MenuComponent);
		menuComponent = fixture.componentInstance;
		element = fixture.nativeElement;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be defined', () => {
		expect(menuComponent).toBeDefined();
	});

	it('componentChanges should call destroyCurrentComponent and buildCurrentComponent', () => {
		spyOn(menuComponent, 'destroyCurrentComponent');
		spyOn(menuComponent, 'buildCurrentComponent');
		menuComponent.componentChanges();
		expect(menuComponent.destroyCurrentComponent).toHaveBeenCalled();
		expect(menuComponent.buildCurrentComponent).toHaveBeenCalled();
	});

	it('destroyCurrentComponent should call factory destroy function and set factory to undefined', () => {
		let fake_factory = {
			destroy(): void {
			}
		};
		menuComponent.selected_component_ref = <any> fake_factory;
		spyOn(fake_factory, 'destroy');
		menuComponent.destroyCurrentComponent();
		expect(fake_factory.destroy).toHaveBeenCalled();
		expect(menuComponent.selected_component_ref).toBeUndefined();
	});

	it('buildCurrentComponent should create factory from selected_item component only when menu is open', () => {
		let fake_factory: ComponentRef<any> = <any>{
			destroy(): void {
			}
		};

		spyOn(menuComponent, 'componentChanges');
		let mock_menu_item: MenuItem = {
			name: 'one',
			component: 'fake_comp',
			icon_url: 'fake/url/to/icon'
		};
		menuComponent.menuItems = new Map();
		menuComponent.menuItems.set(mock_menu_item.name, mock_menu_item);
		menuComponent.selectedMenuItem = 'one';
		spyOn(menuComponent, 'itemSelected').and.returnValue(true);
		spyOn(menuComponent.componentFactoryResolver, 'resolveComponentFactory').and.callFake(() => fake_factory);
		spyOn(menuComponent.selected_component_elem, 'createComponent').and.callFake(() => fake_factory);
		menuComponent.buildCurrentComponent();
		expect(menuComponent.selected_component_elem.createComponent).toHaveBeenCalledWith(fake_factory);
		expect(menuComponent.selected_component_ref).toEqual(fake_factory);
		menuComponent.selectedMenuItem = '';
		menuComponent.menuItems = new Map();
	});


	it('toggleItem should call: closeMenu if selectedMenuItem and key are equals or openMenu if not', () => {
		spyOn(menuComponent, 'closeMenu');
		spyOn(menuComponent, 'openMenu');
		menuComponent.selectedMenuItem = 'fakeMenuItem';
		menuComponent.toggleItem('fakeMenuItem');
		expect(menuComponent.closeMenu).toHaveBeenCalled();
		menuComponent.toggleItem('fakeMenuItem2');
		expect(menuComponent.openMenu).toHaveBeenCalledWith('fakeMenuItem2');
		menuComponent.selectedMenuItem = '';
	});

	it('isActive should get key and check if selectedMenuItem equal to the key', () => {
		menuComponent.selectedMenuItem = 'one';
		expect(menuComponent.isActive('two')).toBeFalsy();
		expect(menuComponent.isActive('one')).toBeTruthy();
		menuComponent.selectedMenuItem = '';
	});

	it('closeMenu should call store.dispatch with UnSelectMenuItemAction', () => {
		spyOn(store, 'dispatch');
		menuComponent.closeMenu();
		expect(store.dispatch).toHaveBeenCalledWith(new UnSelectMenuItemAction());
	});

	it('openMenu should call store.dispatch with SelectMenuItemAction', () => {
		spyOn(store, 'dispatch');
		menuComponent.openMenu('one');
		expect(store.dispatch).toHaveBeenCalledWith(new SelectMenuItemAction('one'));
	});

	it('onFinishAnimation should get expand value and change on_animation to false. if expand is false: call componentChanges and if menu open change expand to true', () => {
		let itemSelectedRes = false;
		spyOn(menuComponent, 'componentChanges');
		spyOn(menuComponent, 'itemSelected').and.callFake(() => itemSelectedRes);

		// expand = true
		this.on_animation = true;
		menuComponent.onFinishAnimation(true);
		expect(menuComponent['on_animation']).toBeFalsy();

		// expand = false ; itemSelected() = false
		this.on_animation = true;
		menuComponent.onFinishAnimation(false);
		expect(menuComponent['on_animation']).toBeFalsy();
		expect(menuComponent.componentChanges).toHaveBeenCalled();
		expect(menuComponent['expand']).toBeFalsy();

		// expand = false ; itemSelected() = true
		itemSelectedRes = true;
		this.on_animation = true;
		menuComponent.onFinishAnimation(false);
		expect(menuComponent['on_animation']).toBeFalsy();
		expect(menuComponent.componentChanges).toHaveBeenCalled();
		expect(menuComponent['expand']).toBeTruthy();
	});


	it('onSelectedIndexChange should change expand via 3 parameters. if expand is true componentChanges() should have been call', () => {
		let _selected_item_index: any = true;
		let itemSelectedRes;

		spyOn(menuComponent, 'componentChanges');
		spyOn(menuComponent, 'itemSelected').and.callFake(() => itemSelectedRes);

		// When expand result is false
		itemSelectedRes = false;
		menuComponent.onSelectedIndexChange(_selected_item_index);
		expect(menuComponent.componentChanges).not.toHaveBeenCalled();
		expect(menuComponent['expand']).toBeFalsy();

		// When expand result is true

		itemSelectedRes = true;
		menuComponent.onSelectedIndexChange(_selected_item_index);
		expect(menuComponent.componentChanges).toHaveBeenCalled();
		expect(menuComponent['expand']).toBeTruthy();

	});


});
