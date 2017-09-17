import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	ElementRef,
	Input,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import {
	AnimationEndAction,
	AnimationStartAction,
	MenuItem,
	SelectMenuItemAction,
	UnSelectMenuItemAction
} from '@ansyn/core';
import * as packageJson from '../../../../../package.json';
import { Observable } from 'rxjs/Observable';
import { IMenuState } from '../reducers/menu.reducer';
import { Store } from '@ngrx/store';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';

import { isEqual, isNil } from 'lodash';

const DEFAULT_WIDTH = 90;

const animations: any[] = [
	trigger(
		'expand', [
			state('true', style({
				maxWidth: '1000px',
			})),
			state('false', style({
				maxWidth: 0,
			})),
			transition('false <=> true', animate('0.25s ease-in-out')),
		]
	),
];

@Component({
	selector: 'ansyn-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.less'],
	animations
})

export class MenuComponent implements AfterViewInit {

	@Input('width') width: number = DEFAULT_WIDTH;
	@ViewChild('container') container: ElementRef;
	@ViewChild('selected_component_elem', { read: ViewContainerRef }) selected_component_elem: ViewContainerRef;

	menu_items$: Observable<MenuItem[]> = this.store.select('menu')
		.map((state: IMenuState) => state.menu_items)
		.distinctUntilChanged(isEqual);

	menu_items: MenuItem[];

	selected_menu_item_index$: Observable<number> =
		this.store.select('menu')
			.map((state: IMenuState) => state.selected_menu_item_index)
			.distinctUntilChanged(isEqual);

	selected_item_index: number;

	selected_component_ref: ComponentRef<any>;

	public animation$: Observable<boolean> = this.store.select('menu').map((store: IMenuState) => store.animation).distinctUntilChanged(isEqual);
	public animation: boolean;
	public version = packageJson['version'];
	public expand = false;

	constructor(public componentFactoryResolver: ComponentFactoryResolver,
				private store: Store<IMenuState>) {

		this.menu_items$.subscribe((menu_items: MenuItem[]) => {
			this.menu_items = menu_items;
		});

		this.selected_menu_item_index$
			.subscribe(this.onSelectedIndexChange.bind(this));

		this.animation$.subscribe((_animation: boolean) => {
			this.animation = _animation;
		});
	}

	get selected_item(): MenuItem {
		return this.menu_items[this.selected_item_index];
	}

	onSelectedIndexChange(selected_item_index: number): void {
		this.selected_item_index = selected_item_index;
		let expand_result = this.itemSelected() && (!this.selected_component_ref || this.animation);
		if (expand_result) {
			this.componentChanges();
		}
		this.expand = expand_result;
	}

	componentChanges(): void {
		this.destroyCurrentComponent();
		this.buildCurrentComponent();
	}

	destroyCurrentComponent(): void {
		if (this.selected_component_ref) {
			this.selected_component_ref.destroy();
			this.selected_component_ref = undefined;
		}
	}

	isActive(index: number): boolean {
		return this.selected_item_index === index;
	}

	buildCurrentComponent(): void {
		if (this.itemSelected() && this.selected_component_elem) {
			const factory = this.componentFactoryResolver.resolveComponentFactory(this.selected_item.component);
			this.selected_component_ref = this.selected_component_elem.createComponent(factory);
		}
	}

	toggleItem(index: number): void {
		if (this.selected_item_index === index) {
			this.closeMenu();
		} else {
			this.openMenu(index);
		}
	}

	itemNotSelected(): boolean {
		return isNil(this.selected_item);
	}

	itemSelected(): boolean {
		return !this.itemNotSelected();
	}

	openMenu(index: number) {
		this.store.dispatch(new SelectMenuItemAction(index));
	}

	closeMenu(): void {
		this.store.dispatch(new UnSelectMenuItemAction());
	}

	onStartAnimation(): void {
		if (this.itemSelected()) {
			this.store.dispatch(new AnimationStartAction());
		}
	}

	onFinishAnimation(expand): void {
		this.store.dispatch(new AnimationEndAction());

		if (!expand) {
			this.componentChanges();
			if (this.itemSelected()) {
				this.expand = true;
			}
		}
	}

	ngAfterViewInit() {
		this.componentChanges();
	}
}
