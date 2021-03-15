import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';
import { tap, filter, retryWhen } from 'rxjs/operators';

@Component({
	selector: 'ansyn-auto-complete',
	templateUrl: './auto-complete.component.html',
	styleUrls: ['./auto-complete.component.less']
})
@AutoSubscriptions()
export class AutoCompleteComponent<T> implements OnInit, OnDestroy {
	options: T[];
	@Input() dbClickFn: Function;
	@Input() onInputChangeFn: (string) => T[];
	@Input() keyFromText: string;
	@Output() selectChange = new EventEmitter<T>(true);
	control = new FormControl();

	@AutoSubscription
	onValueChange$ = this.control.valueChanges.pipe(
		tap( () => this.options = []),
		filter( (value: string) => value.length > 1),
		tap( (value: string) => this.options = this.onInputChangeFn(value)),
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
	onDbClick() {
		this.options = this.dbClickFn();
	}

}
