import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { cloneDeep, ICase } from '@ansyn/core';
import { Store } from '@ngrx/store';
import { ICasesState, selectSelectedCase } from '../../reducers/cases.reducer';
import { CloseModalAction, SaveCaseAsAction } from '../../actions/cases.actions';
import { CasesService } from '../../services/cases.service';
import { take } from 'rxjs/internal/operators';
import { tap } from 'rxjs/operators';
import { AuthService } from '../../../../../app/login/services/auth.service';
import { get as _get } from 'lodash';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, -100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, -100%)' }))])
	])
];

@Component({
	selector: 'ansyn-save-case',
	templateUrl: './save-case.component.html',
	styleUrls: ['./save-case.component.less'],
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations
})
export class SaveCaseComponent {
	@HostBinding('@modalContent')
	get modalContent() {
		return true;
	};

	role = _get(this.authService, 'user.role');
	caseName: string;

	constructor(protected store: Store<ICasesState>,
				protected casesService: CasesService,
				protected authService: AuthService) {
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase() {
		this.store.select(selectSelectedCase)
			.pipe(
				take(1),
				cloneDeep(),
				tap((selectedCase: ICase) => {
					this.store.dispatch(new SaveCaseAsAction(<any>{ ...selectedCase, name: this.caseName, role: this.role }));
					this.close();
				})
			).subscribe();
	}
}

