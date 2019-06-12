import { Component, ElementRef, Inject, Input, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { selectFooterCollapse, ToggleFooter } from "@ansyn/map-facade";
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { ContainerChangedTriggerAction, IMenuState } from '@ansyn/menu';
import { Store } from '@ngrx/store';
import { CoreConfig } from '../../modules/core/models/core.config';
import { ICoreConfig } from '../../modules/core/models/core.config.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap } from 'rxjs/operators';

@Component({
	selector: 'ansyn-footer',
	templateUrl: './ansyn-footer.component.html',
	styleUrls: ['./ansyn-footer.component.less']
})
@AutoSubscriptions()
export class AnsynFooterComponent implements OnInit, OnDestroy{
	@Input() selectedCaseName: string;
	@Input() activeMap: ICaseMapState;
	@Input() animatedElement: HTMLElement;

	@ViewChild('footerWrapper') wrapperElement: ElementRef;

	collapse: boolean;

	@AutoSubscription
	collapse$ = this.store.select(selectFooterCollapse).pipe(
		tap(this.startToggleCollapse.bind(this))
	);

	constructor(
		protected elementRef: ElementRef,
		protected store: Store<IMenuState>,
		@Inject(CoreConfig) public config: ICoreConfig
	) {
	}

	ngOnInit() {
	}

	ngOnDestroy(): void {
	}

	toggle() {
		this.store.dispatch( new ToggleFooter(!this.collapse));
	}

	startToggleCollapse(collapse: boolean) {
		if (this.collapse === undefined) {
			this.collapse = collapse;
			return;
		}

		this.collapse = collapse;
		this.wrapperElement.nativeElement.classList.toggle('collapsed');

		this.forceRedraw()
			.then(() => this.store.dispatch(new ContainerChangedTriggerAction()));

		this.animatedElement.style.opacity = '1';
		this.animatedElement.style.animation = this.collapse ? 'collapsedVertical .3s' : 'unCollapsedVertical .6s';
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

}
