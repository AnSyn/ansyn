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
import { AnimationEndAction, AnimationStartAction, SelectMenuItemAction, UnSelectMenuItemAction } from '../actions';
import { MenuItem } from '../models';
import packageJson from '../../../../../package.json';
import { Observable } from 'rxjs/Observable';
import { IMenuState } from '../reducers/menu.reducer';
import { Store } from '@ngrx/store';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';
import { isNil } from 'lodash';

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

	@Input() width: number = DEFAULT_WIDTH;
	@ViewChild('container') container: ElementRef;
	@ViewChild('selected_component_elem', { read: ViewContainerRef }) selected_component_elem: ViewContainerRef;

	menuState$: Observable<IMenuState> = this.store.select('menu');

	menuItems$: Observable<Map<string, MenuItem>> = this.menuState$
		.pluck <IMenuState, Map<string, MenuItem>>('menuItems')
		.distinctUntilChanged();

	menuItemsAsArray$: Observable<MenuItem[]> = this.menuItems$
		.map((menuItems: Map<string, MenuItem>) => [...menuItems.values()]);

	selectedMenuItem$: Observable<string> = this.menuState$
		.pluck <IMenuState, string>('selectedMenuItem')
		.distinctUntilChanged();

	animation$: Observable<boolean> = this.menuState$
		.pluck <IMenuState, boolean>('animation')
		.distinctUntilChanged();

	selectedMenuItem: string;
	menuItems: Map<string, MenuItem>;
	selected_component_ref: ComponentRef<any>;
	public animation: boolean;
	public version = packageJson.version;
	public expand = false;

	constructor(public componentFactoryResolver: ComponentFactoryResolver,
				private store: Store<IMenuState>) {

		this.menuItems$.subscribe((_menuItems) => {
			this.menuItems = _menuItems;
		});

		this.selectedMenuItem$
			.subscribe(this.onSelectedIndexChange.bind(this));

		this.animation$.subscribe((_animation: boolean) => {
			this.animation = _animation;
		});
	}

	get selected_item(): MenuItem {
		return this.menuItems.get(this.selectedMenuItem);
	}

	onSelectedIndexChange(_selectedMenuItem: string): void {
		this.selectedMenuItem = _selectedMenuItem;
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

	isActive(key: string): boolean {
		return this.selectedMenuItem === key;
	}

	buildCurrentComponent(): void {
		if (this.itemSelected() && this.selected_component_elem) {
			const factory = this.componentFactoryResolver.resolveComponentFactory(this.selected_item.component);
			this.selected_component_ref = this.selected_component_elem.createComponent(factory);
		}
	}

	toggleItem(key: string): void {
		if (this.selectedMenuItem === key) {
			this.closeMenu();
		} else {
			this.openMenu(key);
		}
	}

	itemNotSelected(): boolean {
		return isNil(this.selected_item);
	}

	itemSelected(): boolean {
		return !this.itemNotSelected();
	}

	openMenu(key: string) {
		this.store.dispatch(new SelectMenuItemAction(key));
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
