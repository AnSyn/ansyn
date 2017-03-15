import {NgModule} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuComponent } from './menu/menu.component';
import {MenuService} from "./menu.service";
import {MenuItemsModule} from "./menu-items/menu-items.module";

@NgModule({
  imports: [CommonModule, MenuItemsModule],
  declarations: [MenuComponent],
  exports: [MenuComponent],
  providers: [MenuService]
})
export class MenuModule { }
