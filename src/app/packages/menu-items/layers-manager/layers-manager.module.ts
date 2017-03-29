import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerComponent } from './layers-manager/layers-manager.component';
import { MenuItem, MenuService, StoreService } from '@ansyn/core';
import { LayerTreeComponent } from './layer-tree/layer-tree.component';

@NgModule({
  imports: [CommonModule, TreeModule],
  declarations: [LayersManagerComponent, LayerTreeComponent],
  entryComponents: [LayersManagerComponent]
})
export class LayersManagerModule {
  constructor(storeService: StoreService) {

    let menu_item: MenuItem = {
      name:"Layers Manager",
      component: LayersManagerComponent,
      icon_url: "/assets/icons/data-layers.svg"
    };
    storeService.menu.addMenuItem(menu_item);
  }
}
