import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CasePanelComponent } from './case-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule, Store } from '@ngrx/store';
import { StatusBarReducer, statusBarFeatureKey, IStatusBarState } from '../../reducers/status-bar.reducer';
import { CopySnapshotShareLinkAction } from '../../actions/status-bar.actions';
import { cold } from 'jasmine-marbles';

describe('CasePanelComponent', () => {
	let component: CasePanelComponent;
	let fixture: ComponentFixture<CasePanelComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			declarations: [CasePanelComponent],
			imports: [TranslateModule.forRoot(),
			EffectsModule.forRoot([]),
			StoreModule.forRoot({[statusBarFeatureKey]: StatusBarReducer})]
		})
			.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(CasePanelComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	beforeEach(inject([Store], (_store: Store<IStatusBarState>) => {
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('click on share shold fire CopySnapshotShareLinkAction action', () => {
		fixture.nativeElement.querySelector('.share').click();
		const expectedResults = cold('a', {
			a: new CopySnapshotShareLinkAction()
		});
		expect(component.copyLink).toBeObservable(expectedResults);
	});
});
