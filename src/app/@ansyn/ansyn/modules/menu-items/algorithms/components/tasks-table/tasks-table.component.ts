import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { DeleteTaskAction, LoadTasksAction, SelectTaskAction, SetTasksPageToShow } from '../../actions/tasks.actions';
import { getTimeFormat } from '@ansyn/map-facade';
import { TasksEffects } from '../../effects/tasks.effects';
import { Observable } from 'rxjs';
import {
	ITasksState, selectAlgorithmTasksAreLoading,
	selectAlgorithmTasksSelectedTaskId,
	selectTaskEntities,
	selectTasksIds
} from '../../reducers/tasks.reducer';
import { animate, style, transition, trigger } from '@angular/animations';
import { AutoSubscription, AutoSubscriptions } from 'auto-subscriptions';
import { tap } from 'rxjs/internal/operators';
import { Dictionary } from '@ngrx/entity/src/models';
import { AlgorithmTaskPreview, ITaskModalData, TasksPageToShow } from '../../models/tasks.model';

const animations: any[] = [
	trigger('leaveAnim', [
		transition(':leave', [style({ height: '57px' }), animate('0.2s', style({ height: '0' }))])
	])
];

@Component({
	selector: 'ansyn-tasks-table',
	templateUrl: './tasks-table.component.html',
	styleUrls: ['./tasks-table.component.less'],
	animations
})
@AutoSubscriptions({
	init: 'ngOnInit',
	destroy: 'ngOnDestroy'
})
export class TasksTableComponent implements OnInit, OnDestroy {
	@ViewChild('tbodyElement') tbodyElement: ElementRef;

	ids$: Observable<string[] | number[]> = this.store$.select(selectTasksIds);
	entities$: Observable<Dictionary<AlgorithmTaskPreview>> = this.store$.select(selectTaskEntities);

	isLoading$: Observable<boolean> = this.store$.select(selectAlgorithmTasksAreLoading);

	@AutoSubscription
	selectedTaskId$: Observable<string> = this.store$.select(selectAlgorithmTasksSelectedTaskId).pipe(
		tap((selectedTaskId) => this.selectedTaskId = selectedTaskId)
	);

	selectedTaskId: string;

	modal: ITaskModalData;

	constructor(
		protected store$: Store<ITasksState>,
		protected tasksEffects: TasksEffects
	) {
		this.tasksEffects.onAddTask$.subscribe(this.onTasksAdded.bind(this));
	}

	ngOnInit(): void {
		this.loadTasks();
	}

	ngOnDestroy(): void {
	}

	loadTasks() {
		this.store$.dispatch(new LoadTasksAction());
	}

	onTasksAdded() {
		if (this.tbodyElement) {
			this.tbodyElement.nativeElement.scrollTop = 0;
		}
	}

	onMouseEnterTaskRow(taskMenu: HTMLDivElement, taskRow: HTMLDivElement, tbodyElement: HTMLDivElement) {
		let offsetTop = taskRow.offsetTop;
		let scrollTop = tbodyElement.scrollTop;
		taskMenu.style.top = `${offsetTop - scrollTop + 1}px`;
		taskRow.classList.add('mouse-enter');
	}

	onMouseLeaveTaskRow(taskRow: HTMLDivElement) {
		taskRow.classList.remove('mouse-enter');
	}

	taskMenuClick($event: MouseEvent, taskRow: HTMLDivElement) {
		taskRow.classList.remove('mouse-enter');
		$event.stopPropagation();
	}

	selectTask(taskId: string): void {
		this.store$.dispatch(new SelectTaskAction(taskId));
		this.store$.dispatch(new SetTasksPageToShow(TasksPageToShow.TASK_FORM));
	}

	formatTime(timeToFormat: Date): string {
		return getTimeFormat(timeToFormat);
	}

	showModal(id, name = '??') {
		this.modal = {
			id: id,
			name: name,
			show: true
		}
	}

	hideModal() {
		this.modal.show = false;
	}

	onModalResult(value: boolean) {
		if (value) {
			this.removeTask(this.modal.id)
		}
		this.hideModal();
	}

	removeTask(id) {
		this.store$.dispatch(new DeleteTaskAction(id));
	}
}
