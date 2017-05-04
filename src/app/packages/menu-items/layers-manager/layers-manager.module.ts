import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TreeModule } from 'angular-tree-component';
import { LayersManagerComponent } from './layers-manager/layers-manager.component';
import { MenuItem, AddMenuItemAction } from '@ansyn/core';
import { LayerTreeComponent } from './layer-tree/layer-tree.component';
import { Store } from '@ngrx/store';

@NgModule({
	imports: [CommonModule, TreeModule],
	declarations: [LayersManagerComponent, LayerTreeComponent],
	entryComponents: [LayersManagerComponent]
})
export class LayersManagerModule {
	constructor(store: Store <any>) {
		let menu_item: MenuItem = {
			name:"Layers Manager",
			component: LayersManagerComponent,
			icon_url: "/assets/icons/data-layers.svg"
		};
		store.dispatch(new AddMenuItemAction(menu_item));
	}
}
