import { AnsynComponent } from '@ansyn/ansyn';
import { selectDropMarkup, selectLoading } from '@ansyn/overlays';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef, Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IWindowLayout, selectWindowLayout } from '../../reducers/builder.reducer';

@Injectable()
export class AnsynCustomComponent extends AnsynComponent implements OnInit {
	windowLayout$: Observable<IWindowLayout> = this.store$.select(selectWindowLayout);

	isLoading$: Observable<boolean> = this.store$.select(selectLoading)
		.skip(1)
		.filter(loading => !loading)
		.take(1)
		.do(() => {
			setTimeout(() => {
				this.ref.detectChanges();
			}, 0);
		});

	hoveredOverlay$: Observable<any> = this.store$.select(selectDropMarkup)
		.do(() => {
			setTimeout(() => {
				this.ref.detectChanges();
			}, 0);
		});

	constructor(private store: Store<any>, private ref: ChangeDetectorRef) {
		super(store);
	}

	ngOnInit() {
		this.isLoading$.subscribe();
		this.hoveredOverlay$.subscribe();
	}

}




export const buildAnsynCustomComponent = (selector) => (
	Component({
		selector,
		templateUrl: './ansyn.bootstrap.component.html',
		styleUrls: ['../../../@ansyn/ansyn/ansyn/ansyn.component.less', './ansyn.bootstrap.component.less']
	})(AnsynCustomComponent)
);
