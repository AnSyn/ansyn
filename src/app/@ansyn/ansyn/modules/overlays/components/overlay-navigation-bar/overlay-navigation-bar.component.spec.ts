import { ComponentFixture, inject, TestBed, waitForAsync } from '@angular/core/testing';
import { OverlayNavigationBarComponent } from './overlay-navigation-bar.component';
import { StatusBarConfig } from '../../../status-bar/models/statusBar.config';
import { Store, StoreModule } from '@ngrx/store';
import {
	IStatusBarState,
	statusBarFeatureKey,
	StatusBarReducer
} from '../../../status-bar/reducers/status-bar.reducer';
import { ExpandAction, GoAdjacentOverlay } from '../../../status-bar/actions/status-bar.actions';
import { TranslateModule } from '@ngx-translate/core';
import {
	mapFeatureKey,
	MapReducer,
	selectActiveMapId,
	selectMapsList,
	selectOverlayOfActiveMap
} from '@ansyn/map-facade';
import {
	overlayStatusFeatureKey,
	OverlayStatusReducer,
} from '../../overlay-status/reducers/overlay-status.reducer';
import { of } from 'rxjs';
import { KeysListenerService } from "../../../core/services/keys-listener.service";
import { EventEmitter } from "@angular/core";

describe('OverlayNavigationBarComponent', () => {
	let component: OverlayNavigationBarComponent;
	let fixture: ComponentFixture<OverlayNavigationBarComponent>;
	let store: Store<any>;
	let keyListenerService: KeysListenerService;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [OverlayNavigationBarComponent],
			imports: [StoreModule.forRoot({
				[mapFeatureKey]: MapReducer,
				[statusBarFeatureKey]: StatusBarReducer,
				[overlayStatusFeatureKey]: OverlayStatusReducer
			}), TranslateModule.forRoot()],
			providers: [
				{
					KeysListenerService,
					provide: StatusBarConfig,
					useValue: { toolTips: {} }
				}
			]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(OverlayNavigationBarComponent);
		component = fixture.componentInstance;
		keyListenerService = new KeysListenerService();
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		store = _store;
		const mockStore = new Map<any, any>([
			[selectMapsList, [{ id: 'activeMap' }]],
			[selectActiveMapId, 'activeMap'],
			[selectOverlayOfActiveMap, undefined]
		]);

		spyOn(store, 'select').and.callFake(type => of(mockStore.get(type)));
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	describe('clicks', () => {
		it('clickGoPrev should dispatch action GoPrevAction', () => {
			spyOn(store, 'dispatch');
			component.clickGoAdjacent(false);
			expect(store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({ isNext: false }));
		});
		it('clickGoNext should dispatch action GoNextAction', () => {
			spyOn(store, 'dispatch');
			component.clickGoAdjacent(true);
			expect(store.dispatch).toHaveBeenCalledWith(new GoAdjacentOverlay({ isNext: true }));
		});
		it('clickExpand should dispatch action ExpandAction', () => {
			spyOn(store, 'dispatch');
			component.clickExpand();
			expect(store.dispatch).toHaveBeenCalledWith(new ExpandAction());
		});
	});

	[{ k: 'ArrowRight', n: 'goNextActive', f: 'clickGoAdjacent' }, {
		k: 'ArrowLeft',
		n: 'goPrevActive',
		f: 'clickGoAdjacent'
	}].forEach(key => {
		it(`onkeyup should call ${ key.n } when key = "${ key.k }"`, () => {
			spyOn(component, <'clickGoAdjacent'>key.f);
			expect(component[key.n]).toEqual(false);
			const $event = {
				key: key.k,
				currentTarget: {
					document: {
						activeElement: {
							className: []
						}
					}
				}
			};

			component.onKeyDownEventCheck(new KeyboardEvent('keydown', {'key': key.k}));
			expect(component[key.n]).toEqual(true);

			component.onKeyUpEventCheck(new KeyboardEvent('keyup', {'key': key.k}))
			expect(component[key.n]).toEqual(false);
			expect(component[key.f]).toHaveBeenCalled();
		});

			// spyOn(keyListenerService, 'keydown').and.returnValue(<any>of($event));
			// spyOn(keyListenerService, 'keyup').and.returnValue(<any>of($event));

			// component.onKeyDown$().subscribe(() => {
			// 	expect(component[key.n]).toEqual(false);
			// });
			// component.onKeyUp$().subscribe(() => {
			// 	expect(component[key.n]).toEqual(false);
			// 	expect(component[key.f]).toHaveBeenCalled();
			// });
			// spyOn(keyListenerService.keydown, 'emit');
			// spyOn(keyListenerService.keyup, 'emit');
			// fixture.nativeElement.dispatchEvent(new KeyboardEvent('keydown', {'key': key.k}))
			// keyListenerService.keydown.emit();
			//
			// keyListenerService.keyup.next(new KeyboardEvent('keyup'));
			});
	});
// });
