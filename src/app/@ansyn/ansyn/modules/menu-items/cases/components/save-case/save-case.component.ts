import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { ICasesState, selectSelectedCase } from '../../reducers/cases.reducer';
import { CloseModalAction, SaveCaseAsAction, UpdateCaseAction } from '../../actions/cases.actions';
import { CasesService } from '../../services/cases.service';
import { take, tap } from 'rxjs/operators';
import { cloneDeep } from '../../../../core/utils/rxjs/operators/cloneDeep';
import { ICase } from '../../models/case.model';
import { UUID } from 'angular2-uuid';

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

	caseName: string;

	constructor(protected store: Store<ICasesState>,
				protected casesService: CasesService) {
	}

	close(): void {
		this.store.dispatch(CloseModalAction());
	}

	onSubmitCase() {
		this.store.select(selectSelectedCase)
			.pipe(
				take(1),
				cloneDeep(),
				tap((selectedCase: ICase) => {
					const currentActive = selectedCase.state.maps.activeMapId;
					selectedCase.state.maps.data.forEach( map => {
						const mapId = map.id;
						map.id = UUID.UUID();
						if (mapId === currentActive) {
							selectedCase.state.maps.activeMapId = map.id;
						}
					});
					this.store.dispatch(SaveCaseAsAction({ ...selectedCase, name: this.caseName }));
					this.close();
				})
			).subscribe();
	}
}

