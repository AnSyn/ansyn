import { Component, ElementRef, Inject, Input, OnInit, ViewChild } from '@angular/core';
import { ICaseMapState } from '../../modules/menu-items/cases/models/case.model';
import { ContainerChangedTriggerAction, IMenuState } from '@ansyn/menu';
import { Store } from '@ngrx/store';
import { CoreConfig } from '../../modules/core/models/core.config';
import { ICoreConfig } from '../../modules/core/models/core.config.model';

@Component({
	selector: 'ansyn-footer',
	templateUrl: './ansyn-footer.component.html',
	styleUrls: ['./ansyn-footer.component.less']
})
export class AnsynFooterComponent implements OnInit {
	@Input() selectedCaseName: string;
	@Input() activeMap: ICaseMapState;
	@Input() animatedElement: HTMLElement;

	@ViewChild('footerWrapper') wrapperElement: ElementRef;

	collapse = false;

	constructor(
		protected elementRef: ElementRef,
		protected store: Store<IMenuState>,
		@Inject(CoreConfig) public config: ICoreConfig
	) {
	}

	ngOnInit() {
	}

	startToggleCollapse() {
		this.collapse = !this.collapse;

		this.wrapperElement.nativeElement.classList.toggle('collapsed');

		this.forceRedraw()
			.then(() => this.store.dispatch(new ContainerChangedTriggerAction()));

		this.animatedElement.style.animation = this.collapse ? 'collapsed .3s' : 'unCollapsed .6s';
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
