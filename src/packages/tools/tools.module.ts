import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolsComponent } from './tools/tools.component';
import {CoreModule, StoreService, MenuItem} from "@ansyn/core";

@NgModule({
  imports: [CommonModule, CoreModule],
  declarations: [ToolsComponent],
  entryComponents: [ToolsComponent],
})
export class ToolsModule {
  constructor(storeService:StoreService){
    storeService.menu.addMenuItem(new MenuItem("Tools", ToolsComponent, "/assets/icons/tools.svg"));
  }
}
