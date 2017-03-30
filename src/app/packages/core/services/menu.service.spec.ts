import { TestBed, inject } from '@angular/core/testing';
import { MenuService } from "./menu.service";
import { MenuItem } from "../models/menu-item.model";

describe('MenuService', () => {
  let menuService:MenuService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MenuService]
    });
  });

  beforeEach(inject([MenuService], (_menuService: MenuService) => {
    menuService = _menuService ;
  }));

  it('should be defined', () => {
    expect(menuService).toBeDefined();
  });

  it('addMenuItem should add MenuItem to menu_items by "push"', () => {
    spyOn(menuService.menu_items, "push");
    class fake_component{}

    let menuItem: MenuItem = {
      name: "Fake Name",
      component: new fake_component(),
      icon_url: "fake/icon/url"
    };

    menuService.addMenuItem(menuItem);
    expect(menuService.menu_items.push).toHaveBeenCalledWith(menuItem);
  });

  it('removeMenuItem should remove MenuItem from menu_items by "splice"', () => {
    let index_item_to_remove:number = 6;
    spyOn(menuService.menu_items, "splice");
    menuService.removeMenuItem(index_item_to_remove);
    expect(menuService.menu_items.splice).toHaveBeenCalledWith(index_item_to_remove, 1);
  });

  it('setSelectedItemIndex should get index and put him on selected_item_index', () => {
    let index_item_to_put:number = 7;
    menuService.setSelectedItemIndex (index_item_to_put);
    expect(menuService['selected_item_index']).toEqual(index_item_to_put);
  });


});
