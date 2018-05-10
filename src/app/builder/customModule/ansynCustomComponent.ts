import { AnsynComponent } from '@ansyn/ansyn/ansyn/ansyn.component';
import { selectLoading } from '@ansyn/overlays/reducers/overlays.reducer';
import { Store } from '@ngrx/store';
import { ChangeDetectorRef, Injectable, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AnsynCustomComponent extends AnsynComponent implements OnInit {
	isLoading$: Observable<boolean> = this.store$.select(selectLoading)
		.skip(1)
		.filter(loading => !loading)
		.take(1)
		.do(() => {
			setTimeout(() => {
				this.ref.detectChanges();
			}, 0);
		});

	constructor(private store: Store<any>, private ref: ChangeDetectorRef) {
		super(store);
	}

	ngOnInit() {
		super.ngOnInit();
		this.isLoading$.subscribe();
	}

}




