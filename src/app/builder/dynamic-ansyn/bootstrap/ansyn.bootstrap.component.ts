import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { selectDropMarkup, selectLoading } from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef, Component, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { selectWindowLayout, WindowLayout } from 'app/builder/reducers/builder.reducer';

@Injectable()
export class AnsynCustomComponent extends AnsynComponent implements OnInit {
	windowLayout$: Observable<WindowLayout> = this.store$.select(selectWindowLayout);

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
		styleUrls: ['../../../@ansyn/ansyn/ansyn/ansyn.component.less']
	})(AnsynCustomComponent)
);
