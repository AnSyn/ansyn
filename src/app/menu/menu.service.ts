import {Injectable} from '@angular/core';
import {MenuItem} from "./menu-item.model";

@Injectable()
export class MenuService {
  constructor() { }

  private _menu_items:MenuItem[] = [];
  private selected_item_index:number;

  addMenuItem(menuItem:MenuItem):void{
    this.menu_items.push(menuItem);
  }

  removeMenuItem(index:number):void {
    this.menu_items.splice(index, 1);
  }

  setSelectedItemIndex(index:number) {
    this.selected_item_index = index;
  }

  get menu_items() {
    return this._menu_items
  }


}
