import {
	Component, ElementRef, EventEmitter, HostBinding, HostListener, Input, OnInit, Output, Renderer2,
	ViewChild
} from '@angular/core';
import { IMapState } from '../../reducers/map.reducer';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { isEqual as _isEqual } from 'lodash';
import {
	ContextMenuBestAction, ContextMenuFirstAction, ContextMenuLastAction, ContextMenuNextAction,
	ContextMenuPrevAction
} from '../../actions/map.actions';

@Component({
	selector: 'ansyn-context-menu',
	templateUrl: './context-menu.component.html',
	styleUrls: ['./context-menu.component.less'],
	host: {"tabindex": "0"}
})
export class ContextMenuComponent implements OnInit {
	@HostBinding('style.top.px') top;
	@HostBinding('style.left.px') left;

	contextFilters$: Observable<string[]> = this.store.select('map').map((state: IMapState) => state.contextMenuFilters).distinctUntilChanged(_isEqual);
	contextFilters: string[];

	constructor(private store: Store<IMapState>, private elem: ElementRef, private renderer: Renderer2) {}

	ngOnInit(): void {
		this.contextFilters$.subscribe((_contextFilters: any) => {
			const arr = [];
			if(!_contextFilters || !_contextFilters.metadata) return;
			_contextFilters.metadata.enumsFields.forEach(({isChecked}, key) => {
				if(isChecked) {
					arr.push(key);
				}
			});
			this.contextFilters = arr
		});
	}

	show(top, left) {
		this.top = top;
		this.left = left;
		this.elem.nativeElement.focus();
	}

	clickNext (event$, subFilter?: string) {
		event$.stopPropagation();
		this.store.dispatch(new ContextMenuNextAction(subFilter));
	}
	clickPrev (event$, subFilter?: string) {
		event$.stopPropagation();
		this.store.dispatch(new ContextMenuPrevAction(subFilter));
	}
	clickBest (event$, subFilter?: string) {
		event$.stopPropagation();
		this.store.dispatch(new ContextMenuBestAction(subFilter));
	}
	clickFirst (event$, subFilter?: string) {
		event$.stopPropagation();
		this.store.dispatch(new ContextMenuFirstAction(subFilter));
	}
	clickLast (event$, subFilter?: string) {
		event$.stopPropagation();
		this.store.dispatch(new ContextMenuLastAction(subFilter));
	}



}
