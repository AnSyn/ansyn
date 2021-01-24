import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { MenuComponent } from './menu.component';
import { Store, StoreModule } from '@ngrx/store';
import { IMenuState, menuFeatureKey, MenuReducer } from '../reducers/menu.reducer';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {
	ContainerChangedTriggerAction,
	SelectMenuItemAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { MenuConfig } from '../models/menuConfig';
import { IMenuItem } from '../models/menu-item.model';
import { TranslateModule } from '@ngx-translate/core';
import { MENU_ITEMS } from '../helpers/menu-item-token';

describe('MenuComponent', () => {
	let menuComponent: MenuComponent;
	let fixture: ComponentFixture<MenuComponent>;
	let element: any;
	let store: Store<IMenuState>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			imports: [BrowserAnimationsModule, StoreModule.forRoot({ [menuFeatureKey]: MenuReducer }), TranslateModule.forRoot()],
			declarations: [MenuComponent],
			providers: [{ provide: MenuConfig, useValue: {}}, {provide: MENU_ITEMS, useValue: [[]]}]
		}).compileComponents();
	}));

	beforeEach(inject([Store], (_store: Store<IMenuState>) => {
		fixture = TestBed.createComponent(MenuComponent);
		menuComponent = fixture.componentInstance;
		menuComponent.animatedElement = <any>{ style: {} };
		element = fixture.nativeElement;
		fixture.detectChanges();
		store = _store;
	}));

	it('should be defined', () => {
		expect(menuComponent).toBeDefined();
	});

	it('componentChanges should call clear and buildCurrentComponent', () => {
		spyOn(menuComponent.componentElem, 'clear');
		spyOn(menuComponent, 'buildCurrentComponent');
		menuComponent.componentChanges();
		expect(menuComponent.componentElem.clear).toHaveBeenCalled();
		expect(menuComponent.buildCurrentComponent).toHaveBeenCalled();
	});

	it('buildCurrentComponent should create factory from selectedMenuItem component, and createComponent from factory', () => {
		spyOn(menuComponent, 'anyMenuItemSelected').and.returnValue(true);
		const mockMenuItem: IMenuItem = {
			component: 'fakeComp'
		} as IMenuItem;
		const fakeFactory = 'fakeFactory';
		spyOnProperty(menuComponent, 'selectedMenuItem', 'get').and.returnValue(mockMenuItem);
		spyOn(menuComponent.componentFactoryResolver, 'resolveComponentFactory').and.callFake(() => <any>fakeFactory);
		spyOn(menuComponent.componentElem, 'createComponent');
		menuComponent.buildCurrentComponent();
		expect(menuComponent.componentFactoryResolver.resolveComponentFactory).toHaveBeenCalledWith(mockMenuItem.component);
		expect(menuComponent.componentElem.createComponent).toHaveBeenCalledWith(fakeFactory);
	});


	it('toggleItem should call: closeMenu if selectedMenuItem and key are equals or openMenu if not', () => {
		spyOn(menuComponent, 'closeMenu');
		spyOn(menuComponent, 'openMenu');
		menuComponent.selectedMenuItemName = 'fakeMenuItem';
		menuComponent.toggleItem('fakeMenuItem');
		expect(menuComponent.closeMenu).toHaveBeenCalled();
		menuComponent.toggleItem('fakeMenuItem2');
		expect(menuComponent.openMenu).toHaveBeenCalledWith('fakeMenuItem2', false);
	});

	it('isActive should get key and check if selectedMenuItem equal to the key', () => {
		menuComponent.selectedMenuItemName = 'one';
		expect(menuComponent.isActive('two')).toBeFalsy();
		expect(menuComponent.isActive('one')).toBeTruthy();
		menuComponent.selectedMenuItemName = '';
	});

	it('closeMenu should call store.dispatch with UnSelectMenuItemAction', () => {
		spyOn(store, 'dispatch');
		menuComponent.closeMenu();
		expect(store.dispatch).toHaveBeenCalledWith(new UnSelectMenuItemAction());
	});

	it('openMenu should call store.dispatch with SelectMenuItemAction', () => {
		spyOn(store, 'dispatch');
		menuComponent.openMenu('one', false);
		expect(store.dispatch).toHaveBeenCalledWith(new SelectMenuItemAction({ menuKey: 'one', skipSession: false }));
	});

	it('onExpandDone should call componentChanges if anySelectItem is "false"', () => {
		spyOn(menuComponent, 'componentChanges');
		spyOn(menuComponent, 'anyMenuItemSelected').and.returnValue(false);
		menuComponent.onExpandDone();
		expect(menuComponent.componentChanges).toHaveBeenCalled();
	});

	it('setSelectedMenuItem should set selectedMenuItemName, if selectedMenuItemName not Empty, componentChanges() should have been call', () => {
		spyOn(menuComponent, 'componentChanges');
		spyOn(menuComponent, 'anyMenuItemSelected').and.returnValue(true);
		menuComponent.setSelectedMenuItem('menuItemName');
		expect(menuComponent.selectedMenuItemName).toEqual('menuItemName');
		expect(menuComponent.componentChanges).toHaveBeenCalled();
	});

	it('onIsPinnedChange should toggle "pinned" class on container element and should send ContainerChangedTriggerAction', () => {
		spyOn(store, 'dispatch');
		spyOn(menuComponent, 'forceRedraw').and.callFake(() => (<any>{ then: (c) => c() }));

		menuComponent.isPinned = true;
		menuComponent.onIsPinnedChange();
		expect(menuComponent.container.nativeElement.classList.contains('pinned')).toBeTruthy();
		expect(store.dispatch).toHaveBeenCalledWith(new ContainerChangedTriggerAction());

		menuComponent.isPinned = false;
		menuComponent.onIsPinnedChange();
		expect(menuComponent.container.nativeElement.classList.contains('pinned')).toBeFalsy();
		expect(store.dispatch).toHaveBeenCalledWith(new ContainerChangedTriggerAction());
	});

	it('hideBadge should check if badge need to be hidden', () => {
		expect(menuComponent.hideBadge(undefined)).toBeTruthy();
		expect(menuComponent.hideBadge('str')).toBeTruthy();
		expect(menuComponent.hideBadge('')).toBeFalsy();
		expect(menuComponent.hideBadge('0')).toBeFalsy();
		expect(menuComponent.hideBadge('1')).toBeFalsy();
		expect(menuComponent.hideBadge('★')).toBeFalsy();
	});
});
