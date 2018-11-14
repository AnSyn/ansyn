import { Component, ComponentFactoryResolver, OnDestroy, OnInit, ViewChild, ViewContainerRef } from '@angular/core';
import { animate, style, transition, trigger } from '@angular/animations';
import { TasksEffects } from '../../effects/tasks.effects';
import { Observable } from 'rxjs';
import { tasksStateSelector, ITaskModal, ITasksState } from '../../reducers/tasks.reducer';
import { Store } from '@ngrx/store';
import { CloseModalAction, OpenModalAction } from '../../actions/tasks.actions';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';

const animationsDuring = '0.2s';

const animations: any[] = [
	trigger('blackScreen', [
		transition(':enter', [style({ opacity: 0 }), animate(animationsDuring, style({ opacity: 1 }))]),
		transition(':leave', [style({ opacity: 1 }), animate(animationsDuring, style({ opacity: 0 }))])
	])
];

@Component({
	selector: 'ansyn-tasks-modal-container',
	templateUrl: './tasks-modal-container.component.html',
	styleUrls: ['./tasks-modal-container.component.less'],
	animations
})
export class TasksModalContainerComponent implements OnInit, OnDestroy {
	@ViewChild('modalContent', { read: ViewContainerRef }) modalContent: ViewContainerRef;
	show$: Observable<boolean> = this.store.select(tasksStateSelector).pipe(
		pluck<ITasksState, ITaskModal>('modal'),
		map((modal: ITaskModal) => modal.show),
		distinctUntilChanged()
	);

	selectedComponentRef;

	constructor(public tasksEffects: TasksEffects, protected componentFactoryResolver: ComponentFactoryResolver, protected store: Store<ITasksState>) {
	}

	close() {
		this.store.dispatch(new CloseModalAction());
	}

	ngOnInit() {
		this.tasksEffects.openModal$.subscribe(this.buildTemplate.bind(this));
		this.tasksEffects.closeModal$.subscribe(this.destroyTemplate.bind(this));
	}

	buildTemplate(action: OpenModalAction) {
		let factory = this.componentFactoryResolver.resolveComponentFactory(action.payload.component);
		this.selectedComponentRef = this.modalContent.createComponent(factory);
	}

	destroyTemplate() {
		if (this.selectedComponentRef) {
			this.selectedComponentRef.destroy();
		}
	}

	ngOnDestroy(): void {
		this.close();
	}

}
