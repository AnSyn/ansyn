import { Inject, Injectable } from '@angular/core';
import { SetMapsDataActionStore, UpdateMapSizeAction } from '../../../actions/map.actions';
import { Store } from '@ngrx/store';
import { DOCUMENT } from '@angular/common';
import { forkJoin, fromEvent } from 'rxjs';
import { take, tap } from 'rxjs/operators';
import { IMapSettings } from '@ansyn/imagery';

export interface IDragDropData {
	dragElement: HTMLElement;
	dropElement?: HTMLElement;
	dragElementInitialBoundingBox: ClientRect;
	targetElementInitialBoundingBox: ClientRect;
	ids: string[];
	entities: IMapSettings[];
}

@Injectable()
export class DragDropMapService {
	TRANSITION_DURATION = 500;
	data: IDragDropData = null;

	constructor(protected store: Store<any>, @Inject(DOCUMENT) protected document: any) {
	}

	onMouseDown($event, dragElement: HTMLElement, ids: string[], entities: IMapSettings[]) {
		this.document.body.style.userSelect = 'none';
		dragElement.querySelector<HTMLElement>('.active-border').style.height = '100%';
		dragElement.querySelector<HTMLElement>('button.drag-me i').style.opacity = '1';

		const { currentTarget: target } = $event;
		const dragElementInitialBoundingBox = dragElement.getBoundingClientRect();
		const targetElementInitialBoundingBox = target.getBoundingClientRect();

		this.data = { dragElement, dragElementInitialBoundingBox, targetElementInitialBoundingBox, ids, entities };
		this.document.addEventListener('mousemove', this.mouseMove);
		this.document.addEventListener('mouseup', this.mouseUp);
	}

	mouseMove = ($event) => {
		const { dragElement, dropElement, targetElementInitialBoundingBox } = this.data;
		const { width: targetWidth, height: targetHeight, left: targetLeft, top: targetTop } = targetElementInitialBoundingBox;
		const { left, top, width, height } = dragElement.getBoundingClientRect();
		if (dropElement) {
			dropElement.style.filter = null;
			dropElement.querySelector<HTMLElement>('.active-border').style.height = null;
		}
		dragElement.style.pointerEvents = 'none';
		const pointElem = this.document.elementFromPoint(left + (width / 2), top + (height / 2));
		const newDropElement = <HTMLElement>pointElem && pointElem.closest('.map-container-wrapper');
		if (newDropElement) {
			newDropElement.style.filter = 'blur(2px)';
			newDropElement.querySelector('.active-border').style.height = '100%';
		}
		this.data.dropElement = newDropElement;
		dragElement.style.transition = null;
		dragElement.style.zIndex = '200';
		dragElement.style.transform = `translate(${ $event.clientX - targetLeft - (targetWidth / 2) }px, ${ $event.clientY - targetTop - (targetHeight / 2) }px)`;
	};

	mouseUp = () => {
		this.document.removeEventListener('mousemove', this.mouseMove);
		this.document.removeEventListener('mouseup', this.mouseUp);
		const { dragElement, dropElement, dragElementInitialBoundingBox, ids: mapIds, entities } = this.data;
		const { left: initialLeft, top: initialTop, width: dragWidth, height: dragHeight } = dragElementInitialBoundingBox;
		this.document.body.style.userSelect = null;
		dragElement.style.transition = `transform ${ this.TRANSITION_DURATION }ms`;
		const dragEnd = fromEvent(dragElement, 'transitionend').pipe(take(1));
		const dropEnd = fromEvent(dropElement, 'transitionend').pipe(take(1));

		const transitionsEnd = tap(([dragEvent, dropEvent]: [any, any?]) => {
			const dragElement = dragEvent.target.closest('.map-container-wrapper');
			dragElement.querySelector('.active-border').style.height = null;
			dragElement.querySelector('button.drag-me i').style.opacity = null;
			dragElement.style.pointerEvents = null;
			dragElement.style.transition = null;
			dragElement.style.transform = null;
			dragElement.style.zIndex = null;
			dragElement.style.width = null;
			dragElement.style.height = null;
			if (dropEvent) {
				const dropElement = dropEvent.target.closest('.map-container-wrapper');
				dropElement.style.transform = null;
				dropElement.style.zIndex = null;
				dropElement.style.transition = null;
				dropElement.querySelector('.active-border').style.height = null;
				const ids = [...mapIds];
				const id1 = dragElement.id;
				const id2 = dropElement.id;
				const indexOf1 = ids.indexOf(id1);
				const indexOf2 = ids.indexOf(id2);
				ids[indexOf1] = id2;
				ids[indexOf2] = id1;
				const mapsList = ids.map((id) => entities.find(entity => entity.id === id));
				this.store.dispatch(SetMapsDataActionStore({ mapsList }));
				dropElement.style.width = null;
				dropElement.style.height = null;
				setTimeout(() => {
					this.store.dispatch(UpdateMapSizeAction());
				}, 0);
			}
		});

		if (dropElement) {
			forkJoin([dragEnd, dropEnd]).pipe(transitionsEnd).subscribe();
			const { left: dropLeft, top: dropTop, width: dropWidth, height: dropHeight } = dropElement.getBoundingClientRect();
			dropElement.style.filter = null;
			dropElement.style.transition = `transform ${ this.TRANSITION_DURATION }ms`;
			dropElement.style.transform = `translate(${ initialLeft - dropLeft }px, ${ initialTop - dropTop }px)`;
			dragElement.style.transform = `translate(${ dropLeft - initialLeft }px, ${ dropTop - initialTop }px)`;
			dropElement.style.zIndex = '199';
			dropElement.classList.remove('droppable');
			dragElement.style.width = `${ dropWidth }px`;
			dragElement.style.height = `${ dropHeight }px`;
			dropElement.style.width = `${ dragWidth }px`;
			dropElement.style.height = `${ dragHeight }px`;
			this.store.dispatch(UpdateMapSizeAction());
		} else {
			forkJoin([dragEnd]).pipe(transitionsEnd).subscribe();
			dragElement.style.transform = `translate(0, 0)`;
		}

		this.data = null;
	};
}
