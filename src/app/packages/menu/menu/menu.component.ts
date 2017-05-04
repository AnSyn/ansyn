import {
	Component, ComponentFactoryResolver, ComponentRef, ViewChild, ViewContainerRef, ElementRef, Input, AnimationEntryMetadata, trigger, state, style, transition, animate
} from '@angular/core';
import { MenuItem, SelectMenuItemAction, UnSelectMenuItemAction } from "@ansyn/core";
import { Observable } from 'rxjs';
import { IMenuState } from '../reducers/menu.reducer';
import { Store } from '@ngrx/store';
import * as _ from 'lodash';

const DEFAULT_WIDTH = 60;

const animations: AnimationEntryMetadata[] = [
	trigger(
		'expand', [
			state('true', style({

				maxWidth: '1000px',
				overflowX: 'visible'
			})),
			state('false', style({
				maxWidth: 0,
			})),
			transition('1 => 0', animate('0.25s ease-in-out')),
			transition('0 => 1', animate('0.25s ease-in-out'))
		]
	),
];

@Component({
	selector: 'ansyn-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['menu.component.scss'],
	animations
})

export class MenuComponent {

	@Input("width") private width:number = DEFAULT_WIDTH;
	@ViewChild("container") container:ElementRef;
	@ViewChild("selected_component_elem", {read: ViewContainerRef}) selected_component_elem:ViewContainerRef;

	menu_items$: Observable<MenuItem[]> = this.store.select("menu")
		.map((state: IMenuState) => state.menu_items)
		.distinctUntilChanged(_.isEqual);

	menu_items: MenuItem[];

	selected_menu_item_index$: Observable<number> =
		this.store.select("menu")
			.map((state: IMenuState) => state.selected_menu_item_index)
			.distinctUntilChanged(_.isEqual);

	selected_item_index: number;

	selected_component_ref: ComponentRef<any>;
	private on_animation:boolean = false;
	private expand:boolean = false;

	constructor(private componentFactoryResolver: ComponentFactoryResolver, private store: Store<IMenuState>) {
		this.menu_items$.subscribe((menu_items: MenuItem[]) => {this.menu_items = menu_items});
		this.selected_menu_item_index$.subscribe(this.onSelectedIndexChange.bind(this));
	}

	get selected_item(): MenuItem {
		return this.menu_items[this.selected_item_index];
	}

	onSelectedIndexChange(selected_item_index: number): void {
		this.selected_item_index = selected_item_index;
		let expand_result = this.itemSelected() && (!this.selected_component_ref || this.on_animation);
		if(expand_result) this.componentChanges();
		this.expand = expand_result;
	}

	componentChanges(): void {
		this.destroyCurrentComponent();
		this.buildCurrentComponent();
	}

	destroyCurrentComponent(): void {
		if(this.selected_component_ref) {
			this.selected_component_ref.destroy();
			this.selected_component_ref = undefined;
		}
	}

	isActive(index:number): boolean{
		return this.selected_item_index == index;
	}

	buildCurrentComponent(): void {
		if(this.itemSelected()) {
			let factory = this.componentFactoryResolver.resolveComponentFactory(this.selected_item.component);
			this.selected_component_ref = this.selected_component_elem.createComponent(factory);
		}
	}

	toggleItem(index:number): void {
		if(this.selected_item_index == index){
			this.closeMenu();
		} else {
			this.openMenu(index);
		}
	}

	itemNotSelected():boolean {
		return this.selected_item_index === -1;
	}

	itemSelected():boolean {
		return !this.itemNotSelected();
	}

	openMenu(index: number) {
		this.store.dispatch(new SelectMenuItemAction(index));
	}

	closeMenu(): void {
		this.store.dispatch(new UnSelectMenuItemAction());
	}

	onStartAnimation(): void {
		if(this.itemSelected()) this.on_animation = true;
	}

	onFinishAnimation(expand): void{
		this.on_animation = false;

		if(!expand){
			this.componentChanges();
			if(this.itemSelected()) this.expand = true;
		}
	}
}
