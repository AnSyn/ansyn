import { Component, HostBinding, OnInit, OnDestroy } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { Store } from '@ngrx/store';
import { casesStateSelector, ICasesState } from '../../reducers/cases.reducer';
import { Observable, of } from 'rxjs';
import { AddCaseAction, CloseModalAction, LogRenameCase, UpdateCaseAction } from '../../actions/cases.actions';
import { cloneDeep } from 'lodash';
import { CasesService } from '../../services/cases.service';
import { map, take, tap } from 'rxjs/operators';
import { ICase, ICasePreview } from '../../models/case.model';
import { AutoSubscriptions, AutoSubscription } from 'auto-subscriptions';

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
	selector: 'ansyn-edit-case',
	templateUrl: './edit-case.component.html',
	styleUrls: ['./edit-case.component.less'],
	animations
})
@AutoSubscriptions()
export class EditCaseComponent implements OnInit, OnDestroy {
	@HostBinding('@modalContent') readonly modalContent = true;

	casesState$: Observable<ICasesState> = this.store.select(casesStateSelector);

	@AutoSubscription
	activeCase$: Observable<ICase> = this.casesState$.pipe(
		map(this.getCloneActiveCase.bind(this)),
		tap( (activeCase: ICase) => this.caseModel = activeCase)

	);

	@AutoSubscription
	contextsList$: Observable<any[]> = of([]).pipe(
		map(this.addDefaultContext),
		tap( (contextList) => this.contextsList = contextList)
	);

	contextsList: any[];
	caseModel: ICase;
	editMode = false;
	activeCaseName: string;

	constructor(
		protected store: Store<ICasesState>,
		protected casesService: CasesService
	) {
	}

	addDefaultContext(context: any[]): any[] {
		return [
			{ id: 'default', name: 'Default ICase', creationTime: new Date() },
			...context
		];
	}

	getCloneActiveCase(caseState: ICasesState): ICasePreview {
		let sCase: ICasePreview = caseState.entities[caseState.modal.id];
		if (sCase) {
			this.editMode = true;
			sCase = cloneDeep(sCase);
		} else {
			const selectedCase = cloneDeep(caseState.selectedCase);
			sCase = this.getEmptyCase(selectedCase);
		}

		return sCase;
	}

	getEmptyCase(selectedCase: ICase): ICase {
		let activeMap = selectedCase.state.maps.data.find(({ id }) => id === selectedCase.state.maps.activeMapId);
		if (!Boolean(activeMap)) {
			activeMap = selectedCase.state.maps.data[0];
		}

		return {
			name: '',
			owner: '',
			id: '',
			autoSave: true,
			lastModified: new Date(),
			creationTime: new Date(),
			state: {
				...selectedCase.state,
				maps: {
					layout: 'layout1',
					activeMapId: activeMap.id,
					data: [activeMap]
				},
				time: {
					from: new Date(0),
					to: new Date()
				},
				favoriteOverlays: [],
				overlaysManualProcessArgs: {}
			}
		};
	}

	ngOnInit(): void {

		this.activeCase$.pipe(take(1)).subscribe((activeCase: ICase) => {
			this.caseModel = activeCase;
			this.activeCaseName = activeCase && activeCase.name;
		});

		this.contextsList$.subscribe((_contextsList: any[]) => {
			this.contextsList = _contextsList;
		});
	}

	ngOnDestroy(): void {
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitCase(contextIndex: number) {
		if (this.editMode) {
			this.store.dispatch(new LogRenameCase({ oldName: this.activeCaseName, newName: this.caseModel.name }));
			this.store.dispatch(new UpdateCaseAction({ updatedCase: this.caseModel, forceUpdate: true }));
		} else {
			const selectContext = this.contextsList[contextIndex];
			this.caseModel = cloneDeep(this.casesService.updateCaseViaContext(selectContext, this.caseModel));
			this.casesService.createCase(this.caseModel)
				.subscribe((addedCase: ICase) => {
					this.store.dispatch(new AddCaseAction(addedCase));
				});
		}
		this.close();
	}
}
