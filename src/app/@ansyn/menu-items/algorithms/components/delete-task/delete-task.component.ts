import { Component, EventEmitter, HostBinding, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { ITasksState, selectAlgorithmsModal } from '../../reducers/tasks.reducer';
import { CloseModalAction, DeleteTaskAction } from '../../actions/tasks.actions';
import { animate, style, transition, trigger } from '@angular/animations';
import { TasksService } from '../../services/tasks.service';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/internal/operators';
import { tap } from 'rxjs/operators';
import { AlgorithmTaskPreview } from '../../models/tasks.model';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('modalContent', [
		transition(':enter', [style({
			'backgroundColor': '#27b2cf',
			transform: 'translate(0, 100%)'
		}), animate(animationsDuring, style({ 'backgroundColor': 'white', transform: 'translate(0, 0)' }))]),
		transition(':leave', [style({
			'backgroundColor': 'white',
			transform: 'translate(0, 0)'
		}), animate(animationsDuring, style({ 'backgroundColor': '#27b2cf', transform: 'translate(0, 100%)' }))])
	])
];

@Component({
	selector: 'ansyn-delete-task',
	templateUrl: './delete-task.component.html',
	styleUrls: ['./delete-task.component.less'],
	animations
})

export class DeleteTaskComponent implements OnInit {
	@HostBinding('@modalContent') readonly modalContent = true;

	activeTask$ = this.store
		.select(selectAlgorithmsModal)
		.pipe(map((modal) => modal.id));

	activeTask: AlgorithmTaskPreview;

	@Output() submitTask = new EventEmitter();

	constructor(protected store: Store<ITasksState>, protected tasksService: TasksService) {
	}

	ngOnInit() {
		this.activeTask$.subscribe((activeTask) => this.activeTask = activeTask);
	}

	close(): void {
		this.store.dispatch(new CloseModalAction());
	}

	onSubmitRemove() {
		(<Observable<any>>this.tasksService.removeTask(this.activeTask.id))
			.pipe(
				tap(() => this.store.dispatch(new DeleteTaskAction(this.activeTask.id))),
				catchError(() => of(false)),
				tap(() => this.close())
			)
			.subscribe();
	}

}
