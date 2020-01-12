import {
	Component,
	ComponentFactoryResolver,
	ComponentRef,
	ElementRef,
	Inject,
	Input,
	OnDestroy,
	OnInit,
	Renderer2,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import {
	ContainerChangedTriggerAction,
	ResetAppAction,
	SelectMenuItemAction,
	ToggleIsPinnedAction,
	ToggleMenuCollapse,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { combineLatest, fromEvent, Observable } from 'rxjs';
import {
	IMenuState,
	selectAllMenuItems,
	selectAutoClose,
	selectEntitiesMenuItems,
	selectIsPinned,
	selectMenuCollapse,
	selectSelectedMenuItem
} from '../reducers/menu.reducer';
import { select, Store } from '@ngrx/store';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { IMenuItem } from '../models/menu-item.model';
import { MenuConfig } from '../models/menuConfig';
import { IMenuConfig } from '../models/menu-config.model';
import { Dictionary } from '@ngrx/entity/src/models';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, filter, tap, withLatestFrom } from 'rxjs/operators';

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

// @dynamic
@Component({
	selector: 'ansyn-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.less'],
	animations
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})

/*
	Scenarios
	menu is close -> toggle menu item -> dispatch store -> subscribe store -> change expand and build component
	menu is open -> toggle other menu item -> dispatch store -> subscribe store -> build component // without animations (expand not changed)
	menu is open -> toggle same menu item ->  dispatch store -> subscribe store -> change expand -> destroy component
*/

export class MenuComponent implements OnInit, OnDestroy {
	_componentElem;
	currentComponent: ComponentRef<any>;
	collapse: boolean;
	@Input() animatedElement: HTMLElement;
	@ViewChild('menuWrapper', {static: true}) menuWrapperElement: ElementRef;
	@ViewChild('menu', {static: true}) menuElement: ElementRef;
	@ViewChild('container', {static: true}) container: ElementRef;
	@Input() version;

	menuItemsAsArray$: Observable<IMenuItem[]> = this.store.pipe(select(selectAllMenuItems));

	@AutoSubscription
	collapse$ = this.store.select(selectMenuCollapse).pipe(
		tap(this.startToggleMenuCollapse.bind(this))
	);

	@AutoSubscription
	getMenuEntities: Observable<any> = this.store.select(selectEntitiesMenuItems)
		.pipe(
			filter(Boolean),
			tap((menuEntities) => this.entities = menuEntities)
		);

	@AutoSubscription
	selectIsPinned$ =  this.store.select(selectIsPinned).pipe(
		distinctUntilChanged(),
		tap((isPinned) => {
			this.isPinned = isPinned;
			this.onIsPinnedChange();
		})
	);

	@AutoSubscription
	selectMenuItem$ = this.store.select(selectSelectedMenuItem).pipe(
		tap(this.setSelectedMenuItem.bind(this))
	);

	selectedMenuItemName: string;
	entities: Dictionary<IMenuItem> = {};

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

	get componentElem() {
		return this._componentElem;
	}

	@ViewChild('componentElem', { read: ViewContainerRef, static: true })
	set componentElem(value) {
		this._componentElem = value;
		if (this.isBuildNeeded) {
			this.componentChanges();
			this.isBuildNeeded = false;
		}
	}

	get pinText(): string {
		return this.isPinned ? 'Unpin' : 'Pin';
	}

	get selectedMenuItem(): IMenuItem {
		return this.entities[this.selectedMenuItemName];
	}

	get minimizeText(): string {
		return this.collapse ? 'Show menu' : 'Hide menu';
	}

	@AutoSubscription
	onClickOutside$ = () => fromEvent(this.document, 'click')
		.pipe(
			filter(this.anyMenuItemSelected.bind(this)),
			withLatestFrom(this.store.select(selectAutoClose)),
			filter(([click, autoClose]: [any, boolean]) => {
				const include = click.path.includes(this.elementRef.nativeElement);
				return !include && !this.isPinned && autoClose;
			}),
			tap(this.closeMenu.bind(this))
		);

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
		this.isBuildNeeded = false;
		if (this.isPinned) {
			this.renderer.addClass(this.container.nativeElement, 'pinned');
		} else {
			this.renderer.removeClass(this.container.nativeElement, 'pinned');
		}

		this.animatedElement.style.animation = this.isPinned ? 'pinned .4s' : 'unPinned .4s';
		this.forceRedraw().then(() => this.store.dispatch(ContainerChangedTriggerAction()));
	}

	setSelectedMenuItem(_selectedMenuItemName) {
		this.selectedMenuItemName = _selectedMenuItemName;
		this.expand = Boolean(this.selectedMenuItemName);

		if (this.anyMenuItemSelected()) {
			this.componentChanges();
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
		this.store.dispatch(SelectMenuItemAction({payload: key}));
	}

	closeMenu(): void {
		this.store.dispatch(UnSelectMenuItemAction());
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
		this.store.dispatch(ToggleIsPinnedAction({payload: !this.isPinned}));
	}

	toggleCollapse() {
		this.store.dispatch(ToggleMenuCollapse({payload: !this.collapse}));
	}

	startToggleMenuCollapse(collapse: boolean) {
		if (this.collapse === undefined) {
			this.collapse = collapse;
			return;
		}

		this.collapse = collapse;

		this.menuWrapperElement.nativeElement.classList.toggle('collapsed');

		this.forceRedraw()
			.then(() => this.store.dispatch(ContainerChangedTriggerAction()));

		this.animatedElement.style.animation = this.collapse ? 'collapsed .3s' : 'unCollapsed .6s';

	}

	resetApp() {
		this.store.dispatch(ResetAppAction());
	}

	ngOnInit() {
		new MutationObserver(() => {
			const conPosition = getComputedStyle(this.container.nativeElement).position;
			if (conPosition !== 'absolute') {
				this.store.dispatch(ContainerChangedTriggerAction());
			}
		}).observe(this.container.nativeElement, { childList: true });

	}

	ngOnDestroy(): void {
	}
}

