import { AfterViewInit, Component, ElementRef, Inject, Renderer2, ViewChild } from '@angular/core';
import * as packageJson from '../../package.json';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs/Observable';
import { IOverlayState } from '@ansyn/overlays/reducers/overlays.reducer';
import { ICasesState } from '@ansyn/menu-items/cases/reducers/cases.reducer';
import { Case } from "@ansyn/core";
import { CaseMapState } from '@ansyn/core/models/case.model';
import { MapsLayout } from '@ansyn/core/models/maps-layout';
import { IStatusBarState } from '@ansyn/status-bar/reducers/status-bar.reducer';
import { Overlay } from '@ansyn/core/models/overlay.model';
import { isEqual, isNil, isEmpty, get as _get} from 'lodash';
import { Store } from '@ngrx/store';
import { IAppState } from './app-reducers/app-reducers.module';
import '@ansyn/core/utils/clone-deep';

@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.less']
})
export class AppComponent implements  AfterViewInit {
	@ViewChild('mapsContainer') mapsContainer;

	selected_case$: Observable<Case> = this.store.select('cases')
		.map((state: ICasesState) => state.selected_case)
		.cloneDeep()
		.distinctUntilChanged(isEqual);

	overlays_count$ = this.store.select('overlays')
		.map((state: IOverlayState) => state.count)
		.distinctUntilChanged(isEqual);

	displayedOverlay$ = this.store.select('cases')
		.filter((cases: ICasesState) => !isNil(cases.selected_case))
		.map((cases: ICasesState) => {
			const activeMap: CaseMapState = cases.selected_case.state.maps.data.find((map) => map.id === cases.selected_case.state.maps.active_map_id);
			return activeMap.data.overlay;
		});

	selected_layout$: Observable<MapsLayout> = this.store.select('status_bar')
		.map((state: IStatusBarState) => state.layouts[state.selected_layout_index])
		.distinctUntilChanged(isEqual);

	favoritesOverlays$ = this.store.select('cases')
		.map((cases:ICasesState) => cases.selected_case)
		.filter((selectedCase: Case) => !isEmpty(selectedCase) &&  !isNil(selectedCase.state.favoritesOverlays) )
		.map((selectedCase: Case) => {
			const activeMap = selectedCase.state.maps.data.find( mapItem => mapItem.id === selectedCase.state.maps.active_map_id);
			return activeMap.data.overlay && (  selectedCase.state.favoritesOverlays.indexOf(activeMap.data.overlay.id) > -1);
		});



	overlays_count = 0;
	displayedOverlay: Overlay;
	selected_layout: MapsLayout = {id:"", description:"", maps_count: 0};
	selected_case: Case;
	editMode = false;
	isFavoriteOverlay: boolean;
	counter = 0;

	constructor(public renderer: Renderer2, @Inject(DOCUMENT) private document: any,public store: Store<IAppState> ){
	}

	ngAfterViewInit(){
		const metaTag =  this.renderer.createElement('meta');
		metaTag.setAttribute('version',<any>packageJson['version']);
		this.renderer.appendChild(this.document.head,metaTag);

		this.selected_case$.subscribe( selected_case => { this.selected_case = selected_case});//; console.log('c',++this.counter); });

		this.selected_layout$.subscribe( selected_layout => { this.selected_layout = selected_layout});//; console.log('l',++this.counter); });

		this.overlays_count$.subscribe(_overlays_count => { this.overlays_count = _overlays_count});//; console.log('oc',++this.counter); });

		this.displayedOverlay$.subscribe((_displayedOverlay: Overlay) => { this.displayedOverlay = _displayedOverlay});//; console.log('do',++this.counter);

		this.favoritesOverlays$.subscribe((isFavorite: boolean) => { this.isFavoriteOverlay = isFavorite});//; console.log("fo",++this.counter );


	}

	toggleEditMode($event){
		this.editMode = !this.editMode;
	}
}
