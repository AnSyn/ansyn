import { Injectable, OnDestroy, OnInit } from '@angular/core';
import { Action, Store } from '@ngrx/store';
import { SetLayoutAction, SetWindowLayout, WindowLayout } from '@ansyn/core/index';
import { Actions } from '@ngrx/effects';
import { LoadDefaultCaseAction } from '@ansyn/menu-items';
import { VisualizersAppEffects } from '@ansyn/ansyn';
import { Overlay } from '@ansyn/core';
import { DisplayOverlayAction } from '@ansyn/overlays';
import { IMapState, MapEffects, mapStateSelector } from '@ansyn/map-facade';
import { Subscription } from 'rxjs/Subscription';
import { MapActionTypes } from '@ansyn/map-facade/actions/map.actions';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class AnsynApi implements OnInit, OnDestroy {

	mouseShadow = this.visualizersAppEffects$.onStartMapShadow$.map(res => {
		console.log(res);
	});

	mapPosition$ = this.actions$.ofType<Action>(MapActionTypes.POSITION_CHANGED);

	activateMap$ = <Observable<string>>this.store.select(mapStateSelector)
		.pluck<IMapState, string>('activeMapId')
		.do(activeMapId => {
			this.activeMapId = activeMapId
			console.log(this.activeMapId)
		})
		.distinctUntilChanged();

	activeMapId;
	private subscriptions: Array<Subscription>;

	constructor(public store: Store<any>, protected actions$: Actions, protected visualizersAppEffects$: VisualizersAppEffects) {


	}

	ngOnInit() {
		this.subscriptions.push(
			this.activateMap$.subscribe(),
			this.mouseShadow.subscribe(res => console.log(res)));
	}

	ngOnDestroy() {
		this.subscriptions.forEach(subscription => subscription.unsubscribe());
	}

	displayOverLay(overlay: Overlay) {
		this.store.dispatch(new DisplayOverlayAction({ overlay, mapId: this.activeMapId, forceFirstDisplay: true }));
	}

	changeMapLayout(layout) {
		this.store.dispatch(new SetLayoutAction(layout));
	}

	loadDefaultCase() {
		this.store.dispatch(new LoadDefaultCaseAction());
	}


	changeWindowLayout(windowLayout: WindowLayout) {
		this.store.dispatch(new SetWindowLayout({ windowLayout }));
	}



}
