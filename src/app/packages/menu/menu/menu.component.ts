import {
	Component,
	ComponentFactoryResolver,
	ElementRef,
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
import { Subscription } from 'rxjs/Subscription';

const animations: any[] = [
	trigger(
		'expand', [
			state('1', style({
				transform: 'translateX(0)'
			})),
			state('0', style({
				transform: 'translateX(-100%)'
			})),
			transition('1 <=> 0', animate('0.4s ease-in-out')),
		]
	),
];

@Component({
	selector: 'ansyn-menu',
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.less'],
	animations
})

export class MenuComponent implements OnInit {

	@ViewChild('componentElem', { read: ViewContainerRef }) componentElem: ViewContainerRef;
	@ViewChild('container') container: ElementRef;
	@ViewChild('menuWrapper') menuWrapper: ElementRef;
	@Input() version;

	menuState$: Observable<IMenuState> = this.store.select('menu');

	isPinned$ = this.menuState$
		.pluck<IMenuState, boolean>('isPinned')
		.distinctUntilChanged()
		.skip(1);

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
	outsideClickSubscriber: Subscription;

	constructor(public componentFactoryResolver: ComponentFactoryResolver,
				private store: Store<IMenuState>,
				private renderer: Renderer2,
				@Inject(DOCUMENT) private document: Document) {

		this.menuItems$.subscribe((_menuItems) => {
			this.menuItems = _menuItems;
		});

		this.selectedMenuItem$.subscribe((_selectedMenuItemName) => {
			this.selectedMenuItemName = _selectedMenuItemName;
			if (this.anyMenuItemSelected()) {
				this.componentChanges();
			} else {
				this.store.dispatch(new ToggleIsPinnedAction(false));
			}
		});

		this.isPinned$.subscribe((_isPinned: boolean) => {
			this.isPinned = _isPinned;
			if (_isPinned) {
				this.renderer.addClass(this.container.nativeElement, 'pinned');
			} else {
				this.renderer.removeClass(this.container.nativeElement, 'pinned');
			}
			this.store.dispatch(new ContainerChangedTriggerAction());
		});

	}

	get expand(): boolean {
		return !isEmpty(this.selectedMenuItemName);
	}

	get selectedMenuItem(): MenuItem {
		return this.menuItems.get(this.selectedMenuItemName);
	}

	componentChanges(): void {
		if (!this.componentElem) {
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

	onExpandDone(): void {
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
			.filter(() => !this.isPinned && this.anyMenuItemSelected())
			.filter((event: any) => !event.target.closest('.menu-wrapper'))
			.subscribe(this.closeMenu.bind(this));
	}
}
