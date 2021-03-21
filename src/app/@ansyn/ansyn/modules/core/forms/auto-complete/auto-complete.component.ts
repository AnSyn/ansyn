import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap, filter, retryWhen, switchMap, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
	selector: 'ansyn-auto-complete',
	templateUrl: './auto-complete.component.html',
	styleUrls: ['./auto-complete.component.less']
})
@AutoSubscriptions()
export class AutoCompleteComponent<T> implements OnInit, OnDestroy {
	lastValue: string;
	options: T[];
	@Input() onInputChangeFn: (string) => Observable<T[]>;
	@Input() keyFromText: string;
	@Input() allEntities: T[];
	@Output() selectChange = new EventEmitter<T>(true);
	control = new FormControl();

	@AutoSubscription
	onValueChange$ = this.control.valueChanges.pipe(
		tap( (value) => {
			this.lastValue = value;
			this.options = []
		}),
		filter( (value: string) => value.length > 1),
		switchMap( (value) =>  this.onInputChangeFn(value)),
		tap( (options: T[]) => this.options = options),
		retryWhen((err) => {
			return err.pipe(
				tap( () => this.options = [])
			)
		})
	);

	constructor() {
	}

	ngOnInit(): void {
	}
	ngOnDestroy(): void {
	}

	dbClick() {
		if (this.lastValue) {
			this.onInputChangeFn(this.lastValue).pipe(
				take(1),
				tap((options) => this.options = options)
			).subscribe()
		}
		else {
			this.options = this.allEntities;
		}
	}

	onSelect() {
		this.control.setValue('');
		this.options = undefined;
	}
}
