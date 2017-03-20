import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerComponent } from './layers-manager/layers-manager.component';
import { MenuItem } from "../../menu-item.model";
import { MenuService } from "../../menu.service";
import { LayerTreeComponent } from './layer-tree/layer-tree.component';

@NgModule({
  imports: [CommonModule, TreeModule],
  declarations: [LayersManagerComponent, LayerTreeComponent],
  entryComponents: [LayersManagerComponent]
})
export class DataLayersModule {
  constructor(menuService: MenuService) {
    menuService.addMenuItem(new MenuItem("Layers Manager", LayersManagerComponent, "/assets/icons/data-layers.svg"));
  }
}
