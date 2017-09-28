import {
	AfterViewInit,
	Component,
	ComponentFactoryResolver,
	ElementRef,
	HostListener,
	Inject,
	Input,
	OnInit,
	Renderer2,
	ViewChild,
	ViewContainerRef
} from '@angular/core';
import { SelectMenuItemAction, UnSelectMenuItemAction } from '../actions';
import { MenuItem } from '../models';
import { Observable } from 'rxjs/Observable';
import { IMenuState } from '../reducers/menu.reducer';
import { Store } from '@ngrx/store';
import { animate, state, style, transition, trigger } from '@angular/animations';
import 'rxjs/add/operator/distinctUntilChanged';
import { isEmpty, isNil } from 'lodash';
import { ContainerChangedTriggerAction, ToggleIsPinnedAction } from '../actions/menu.actions';
import { DOCUMENT } from '@angular/common';

const animations: any[] = [
	trigger(
		'expand', [
			state('1', style({
				transform: 'translateX(0)'
			})),
			state('0', style({
				transform: 'translateX(-100%)'
			})),
			transition('1 <=> 0', animate('0.3s ease-in-out')),
		]
	),
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

export class MenuComponent implements OnInit, AfterViewInit {
	_componentElem;

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
	@ViewChild('menuWrapper') menuWrapper: ElementRef;
	@Input() version;

	menuState$: Observable<IMenuState> = this.store.select('menu');

	isPinned$ = this.menuState$
		.pluck<IMenuState, boolean>('isPinned')
		.distinctUntilChanged();

	clickOutside$ = this.menuState$
		.pluck<IMenuState, boolean>('clickOutside')
		.distinctUntilChanged();

	menuItems$: Observable<Map<string, MenuItem>> = this.menuState$
		.pluck <IMenuState, Map<string, MenuItem>>('menuItems')
		.distinctUntilChanged();

	menuItemsAsArray$: Observable<MenuItem[]> = this.menuItems$
		.map((menuItems: Map<string, MenuItem>) => [...menuItems.values()]);

	selectedMenuItem$: Observable<string> = this.menuState$
		.pluck <IMenuState, string>('selectedMenuItem')
		.distinctUntilChanged();

	selectedMenuItemName: string;
	menuItems: Map<string, MenuItem>;
	isPinned: boolean;
	clickOutside: boolean;
	expand: boolean;
	onAnimation: boolean;
	isBuildNeeded: boolean;

	constructor(public componentFactoryResolver: ComponentFactoryResolver,
				private store: Store<IMenuState>,
				private renderer: Renderer2,
				@Inject(DOCUMENT) private document: Document) {

		this.menuItems$.subscribe((_menuItems) => {
			this.menuItems = _menuItems;
		});

		this.selectedMenuItem$.subscribe(this.setSelectedMenuItem.bind(this));

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinned = _isPinned;
			this.onIsPinnedChange();
		});

		this.clickOutside$.subscribe((clickOutside: boolean) => {
			this.clickOutside = clickOutside;
		});
	}

	get selectedMenuItem(): MenuItem {
		return this.menuItems.get(this.selectedMenuItemName);
	}

	@HostListener('click', ['$event'])
	clickCompnent($event: MouseEvent) {
		$event.stopPropagation();
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
		this.store.dispatch(new ContainerChangedTriggerAction());
	}

	setSelectedMenuItem(_selectedMenuItemName) {
		this.selectedMenuItemName = _selectedMenuItemName;
		this.expand = !isEmpty(this.selectedMenuItemName);

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

	isActive(key: string): boolean {
		return this.selectedMenuItemName === key;
	}

	buildCurrentComponent(): void {
		if (this.anyMenuItemSelected()) {
			const factory = this.componentFactoryResolver.resolveComponentFactory(this.selectedMenuItem.component);
			this.componentElem.createComponent(factory);
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
		return !isNil(this.selectedMenuItem);
	}

	openMenu(key: string) {
		this.store.dispatch(new SelectMenuItemAction(key));
	}

	closeMenu(): void {
		this.store.dispatch(new UnSelectMenuItemAction());
	}

	onExpandStart() {
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
		new MutationObserver(() => {
			const conPosition = getComputedStyle(this.container.nativeElement).position;
			if (conPosition !== 'absolute') {
				this.store.dispatch(new ContainerChangedTriggerAction());
			}
		}).observe(this.container.nativeElement, { childList: true });

		Observable
			.fromEvent(this.document, 'click')
			.filter(() => !this.isPinned && this.clickOutside && this.anyMenuItemSelected() && !this.onAnimation)
			.subscribe(this.closeMenu.bind(this));
	}

	ngAfterViewInit(): void {
		this.onIsPinnedChange();
	}

}
