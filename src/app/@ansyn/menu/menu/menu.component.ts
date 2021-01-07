import {
	AfterViewChecked,
	ChangeDetectorRef,
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
	ContainerChangedTriggerAction, LogHelp,
	ResetAppAction,
	SelectMenuItemAction,
	ToggleIsPinnedAction,
	ToggleMenuCollapse,
	UnSelectMenuItemAction
} from '../actions/menu.actions';
import { fromEvent } from 'rxjs';
import {
	IMenuState,
	selectAutoClose,
	selectBadges,
	selectIsPinned,
	selectMenuCollapse,
	selectSelectedMenuItem,
	selectSelectedOutsideMenuItem
} from '../reducers/menu.reducer';
import { Store } from '@ngrx/store';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { IMenuItem, IOutsideMenuItem } from '../models/menu-item.model';
import { MenuConfig } from '../models/menuConfig';
import { IMenuConfig } from '../models/menu-config.model';
import { Dictionary } from '@ngrx/entity/src/models';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { distinctUntilChanged, filter, map, tap, withLatestFrom } from 'rxjs/operators';
import { MENU_ITEMS } from '../helpers/menu-item-token';
import { TranslateService } from '@ngx-translate/core';

const animations: any[] = [
	trigger(
		'expand', [
			state('bottom', style({
				transform: 'translateY(100%)'
			})),
			state('top', style({
				transform: 'translateY(-100%)'
			})),
			state('on', style({
				transform: 'translateY(0)'
			})),
			transition('bottom <=> on, top <=> on', animate('0.3s ease-in-out'))
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

export class MenuComponent implements OnInit, OnDestroy, AfterViewChecked {
	currentComponent: ComponentRef<any>;
	collapse: boolean;
	_componentElem;
	selectedMenuItemName: string;
	entities: Dictionary<IMenuItem> = {};
	isPinned: boolean;
	expand: boolean;
	onAnimation: boolean;
	isBuildNeeded: boolean;
	outsideMenuItem: IOutsideMenuItem;

	@Input() animatedElement: HTMLElement;
	@ViewChild('menuWrapper', { static: true }) menuWrapperElement: ElementRef;
	@ViewChild('menu', { static: true }) menuElement: ElementRef;
	@ViewChild('container', { static: true }) container: ElementRef;
	@Input() version;

	isRTL = this.translateService.instant('direction') === 'rtl';

	@AutoSubscription
	collapse$ = this.store.select(selectMenuCollapse).pipe(
		tap(this.startToggleMenuCollapse.bind(this))
	);

	@AutoSubscription
	selectOutsideMenuItem$ = this.store.select(selectSelectedOutsideMenuItem).pipe(
		tap((menuItem: IOutsideMenuItem) => {
			this.outsideMenuItem = menuItem;
			this.toggleItem(menuItem.name);
		})
	);

	@AutoSubscription
	selectIsPinned$ = this.store.select(selectIsPinned).pipe(
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

	@AutoSubscription
	selectBadges$ = this.store.select(selectBadges).pipe(
		distinctUntilChanged((badgeMapA, badgeMapB) => {
			let isNotChange = true;
			badgeMapA.forEach( (value, key) => {
				isNotChange = isNotChange && badgeMapB.get(key) === value;
			});
			return isNotChange;
		}),
		tap((badgeMap) => {
			badgeMap.forEach( (value, key) => {
				if (this.entities[key]) { // for component in case our customer dont want Result Table menu item.
					this.entities[key].badge = value;
				}
			});
		})
	);

	constructor(
		public componentFactoryResolver: ComponentFactoryResolver,
		protected store: Store<IMenuState>,
		protected renderer: Renderer2,
		protected elementRef: ElementRef,
		@Inject(DOCUMENT) protected document: Document,
		@Inject(MENU_ITEMS) menuItemsMulti: IMenuItem[][],
		@Inject(MenuConfig) public menuConfig: IMenuConfig,
		private cdref: ChangeDetectorRef,
		protected translateService: TranslateService
	) {
		this.initializeMenuItem(menuItemsMulti.reduce((prev, next) => [...prev, ...next], []));
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

	get menuItemsArray(): IMenuItem[] {
		return Object.values(this.entities)
			.sort((a, b) => b.dockedToBottom ? -1 : 0); // sort all bottom item to last of the list
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
				const include = click.path.includes(this.elementRef.nativeElement) ||
								click.path.includes(this.outsideMenuItem.elementRef);
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

		this.animatedElement.style.animation = `${this.isPinned ? 'pinned' : 'unPinned'}_${this.isRTL ? 'rtl' : 'ltr'} .4s`;
		this.forceRedraw().then(() => this.store.dispatch(new ContainerChangedTriggerAction()));
	}

	setSelectedMenuItem(_selectedMenuItemName) {
		this.selectedMenuItemName = _selectedMenuItemName;
		requestAnimationFrame(() => this.expand = Boolean(this.selectedMenuItemName));

		if (this.anyMenuItemSelected()) {
			this.componentChanges();
		}
	}

	componentChanges(): void {
		this.forceRedraw().then(() => this.store.dispatch(new ContainerChangedTriggerAction()));
		if (!this.componentElem || this.onAnimation) {
			this.isBuildNeeded = !this.componentElem;
			return;
		}
		this.componentElem.clear();
		this.buildCurrentComponent();
	}

	hideBadge(badge: string): boolean {
		return badge === undefined || (badge !== '★' && isNaN(Number(badge)));
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

	toggleItem(key: string, skipSession: boolean = false): void {
		if (this.onAnimation) {
			return;
		}

		if (this.selectedMenuItemName === key) {
			this.closeMenu();
		} else {
			this.openMenu(key, skipSession);
		}
	}

	onHelp() {
		this.store.dispatch(new LogHelp());
		this.goToLandingPage();
	}

	goToLandingPage() {
		window.open(this.menuConfig.landingPageUrl);
	}

	anyMenuItemSelected(): boolean {
		return Boolean(this.selectedMenuItem);
	}

	openMenu(key: string, skipSession: boolean) {
		this.store.dispatch(new SelectMenuItemAction({ menuKey: key, skipSession }));
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

	toggleCollapse() {
		this.store.dispatch(new ToggleMenuCollapse(!this.collapse));
	}

	startToggleMenuCollapse(collapse: boolean) {
		if (this.collapse === undefined) {
			this.collapse = collapse;
			return;
		}

		this.collapse = collapse;

		this.menuWrapperElement.nativeElement.classList.toggle('collapsed');

		this.forceRedraw()
			.then(() => this.store.dispatch(new ContainerChangedTriggerAction()));

		this.animatedElement.style.animation = `${this.collapse ? 'collapsed' : 'unCollapsed'}_${this.isRTL ? 'rtl' : 'ltr'} ${this.collapse ? '.3s' : '.6s'}`;

	}

	resetApp() {
		this.store.dispatch(new ResetAppAction());
	}

	ngOnInit() {
		new MutationObserver(() => {
			const conPosition = getComputedStyle(this.container.nativeElement).position;
			if (conPosition !== 'absolute') {
				this.store.dispatch(new ContainerChangedTriggerAction());
			}
		}).observe(this.container.nativeElement, { childList: true });

	}

	ngOnDestroy(): void {
	}

	ngAfterViewChecked() {
		this.cdref.detectChanges();
	}

	private initializeMenuItem(menuItems: IMenuItem[]) {
		const menuItemsObject = menuItems.reduce((menuItems, menuItem: IMenuItem) => {
			return { ...menuItems, [menuItem.name]: menuItem };
		}, {});

		// if empty put all
		if (Array.isArray(this.menuConfig.menuItems)) {
			menuItems = this.menuConfig.menuItems
				.map((name) => menuItemsObject[name])
				.filter(Boolean);
		}
		this.entities = Object.assign({}, ...menuItems.map(item => ({ [item.name]: item })));
	}
}

