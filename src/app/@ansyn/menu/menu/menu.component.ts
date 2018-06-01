import {
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	ElementRef,
	Inject,
	Input, isDevMode,
	OnInit,
	Renderer2,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import {
	ContainerChangedTriggerAction,
	SelectMenuItemAction,
	ToggleIsPinnedAction,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { Observable } from 'rxjs/Observable';
import { IMenuState } from '../reducers/menu.reducer';
import { Store } from '@ngrx/store';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';
import { DOCUMENT } from '@angular/common';
import { MenuItem } from '../models/menu-item.model';
import { MenuConfig } from '../models/menuConfig';
import { IMenuConfig } from '../models/menu-config.model';
import {
	selectAllMenuItems, selectAutoClose, selectEntitiesMenuItems,
	selectIsPinned, selectSelectedMenuItem
} from '@ansyn/menu/reducers/menu.reducer';
import { Dictionary } from '@ngrx/entity/src/models';

const animations: any[] = [
	trigger(
		'expand', [
			state('1', style({
				transform: 'translateX(0)'
			})),
			state('0', style({
				transform: 'translateX(-100%)'
			})),
			transition('1 <=> 0', animate('0.3s ease-in-out'))
		]
	)
];

@Component({
	selector: 'ansyn-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.less'],
	animations
})

/*
	Scenarios
	menu is close -> toggle menu item -> dispatch store -> subscribe store -> change expand and build component
	menu is open -> toggle other menu item -> dispatch store -> subscribe store -> build component // without animations (expand not changed)
	menu is open -> toggle same menu item ->  dispatch store -> subscribe store -> change expand -> destroy component
*/

export class MenuComponent implements OnInit {
	_componentElem;
	currentComponent: ComponentRef<any>;

	@ViewChild('componentElem', { read: ViewContainerRef })
	set componentElem(value) {
		this._componentElem = value;
		if (this.isBuildNeeded) {
			this.componentChanges();
			this.isBuildNeeded = false;
		}
	}

	get componentElem() {
		return this._componentElem;
	}

	@ViewChild('container') container: ElementRef;
	@Input() version;


	isPinned$ = this.store.select(selectIsPinned);

	autoClose$ = this.store.select(selectAutoClose);

	entities$: Observable<Dictionary<MenuItem>> = this.store.select(selectEntitiesMenuItems);
	menuItemsAsArray$: Observable<MenuItem[]> = this.store.select(selectAllMenuItems)
		.map((menuItems: MenuItem[]) => menuItems.filter(this.isMenuItemShown));

	selectedMenuItem$: Observable<string> = this.store.select(selectSelectedMenuItem);

	selectedMenuItemName: string;
	entities: Dictionary<MenuItem> = {};
	isPinned: boolean;
	expand: boolean;
	onAnimation: boolean;
	isBuildNeeded: boolean;

	constructor(public componentFactoryResolver: ComponentFactoryResolver,
				protected store: Store<IMenuState>,
				protected renderer: Renderer2,
				protected elementRef: ElementRef,
				@Inject(DOCUMENT) protected document: Document,
				@Inject(MenuConfig) public menuConfig: IMenuConfig) {
	}

	get pinText(): string {
		return this.isPinned ? 'Pin' : 'Unpin';
	}

	get selectedMenuItem(): MenuItem {
		return this.entities[this.selectedMenuItemName];
	}

	isMenuItemShown(menuItem: MenuItem) {
		return isDevMode() || menuItem.production;
	}

	forceRedraw() {
		return new Promise(resolve => {
			this.elementRef.nativeElement.style.display = 'none';
			requestAnimationFrame(() => {
				this.elementRef.nativeElement.style.display = '';
				resolve();
			});
		});
	}

	onIsPinnedChange() {
		if (!this.container) {
			return;
		}
		if (this.isPinned) {
			this.renderer.addClass(this.container.nativeElement, 'pinned');
		} else {
			this.renderer.removeClass(this.container.nativeElement, 'pinned');
		}

		this.forceRedraw()
			.then(() => this.store.dispatch(new ContainerChangedTriggerAction()));
	}

	setSelectedMenuItem(_selectedMenuItemName) {
		this.selectedMenuItemName = _selectedMenuItemName;
		this.expand = Boolean(this.selectedMenuItemName);

		if (this.anyMenuItemSelected()) {
			this.componentChanges();
		} else {
			this.store.dispatch(new ToggleIsPinnedAction(false));
		}
	}

	componentChanges(): void {
		if (!this.componentElem || this.onAnimation) {
			this.isBuildNeeded = !this.componentElem;
			return;
		}
		this.componentElem.clear();
		this.buildCurrentComponent();
	}

	hideBadge(badge: string): boolean {
		return badge !== '★' && !Number(badge);
	}

	isActive(key: string): boolean {
		return this.selectedMenuItemName === key;
	}

	buildCurrentComponent(): void {
		if (this.anyMenuItemSelected()) {
			const factory = this.componentFactoryResolver.resolveComponentFactory(this.selectedMenuItem.component);
			this.currentComponent = this.componentElem.createComponent(factory);
		}
	}

	toggleItem(key: string): void {
		if (this.onAnimation) {
			return;
		}
		if (this.selectedMenuItemName === key) {
			this.closeMenu();
		} else {
			this.openMenu(key);
		}
	}

	anyMenuItemSelected(): boolean {
		return Boolean(this.selectedMenuItem);
	}

	openMenu(key: string) {
		this.store.dispatch(new SelectMenuItemAction(key));
	}

	closeMenu(): void {
		this.store.dispatch(new UnSelectMenuItemAction());
	}

	onExpandStart() {
		if (this.currentComponent && this.currentComponent.instance.onAnimation) {
			this.currentComponent.instance.onAnimation();
		}
		this.onAnimation = true;
	}

	onExpandDone(): void {
		this.onAnimation = false;
		if (!this.anyMenuItemSelected()) {
			this.componentChanges();
		}
	}

	toggleIsPinned() {
		this.store.dispatch(new ToggleIsPinnedAction(!this.isPinned));
	}

	ngOnInit() {
		this.entities$.subscribe((_menuItems) => {
			this.entities = _menuItems;
		});

		this.selectedMenuItem$.subscribe(this.setSelectedMenuItem.bind(this));

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinned = _isPinned;
			this.onIsPinnedChange();
		});

		new MutationObserver(() => {
			const conPosition = getComputedStyle(this.container.nativeElement).position;
			if (conPosition !== 'absolute') {
				this.store.dispatch(new ContainerChangedTriggerAction());
			}
		}).observe(this.container.nativeElement, { childList: true });

		Observable
			.fromEvent(this.document, 'click')
			.filter(this.anyMenuItemSelected.bind(this))

			.withLatestFrom(this.autoClose$)
			.filter(([click, autoClose]: [any, boolean]) => {
				const include = click.path.includes(this.elementRef.nativeElement);
				return !include && !this.isPinned && autoClose;
			})
			.do(this.closeMenu.bind(this))
			.subscribe()
	}
}

