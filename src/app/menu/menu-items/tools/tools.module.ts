import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import {MenuItem} from "../../menu-item.model";
import {MenuService} from "../../menu.service";

@NgModule({
  imports: [CommonModule],
  declarations: [ToolsComponent],
  entryComponents: [ToolsComponent],
})
export class ToolsModule {
  constructor(menuService:MenuService){
    menuService.addMenuItem(new MenuItem("Tools", ToolsComponent, "/assets/icons/tools.svg"));
  }
}
