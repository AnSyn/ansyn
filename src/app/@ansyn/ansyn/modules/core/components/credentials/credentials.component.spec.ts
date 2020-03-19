import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CredentialsComponent } from './credentials.component';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { HttpClientModule } from '@angular/common/http';
import { credentialsConfig } from '../../services/credentials/config';
import { TranslateModule } from '@ngx-translate/core';
import { Store, StoreModule } from '@ngrx/store';
import { UnSelectMenuItemAction } from '@ansyn/menu';
import { EMPTY } from 'rxjs';

describe('CredentialsComponent', () => {
	let component: CredentialsComponent;
	let fixture: ComponentFixture<CredentialsComponent>;
	let store: Store<any>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [
				HttpClientModule,
				TranslateModule.forRoot(),
				StoreModule.forRoot({})
			],
			declarations: [CredentialsComponent],
			providers:
				[
					{
						provide: CredentialsService,
						useValue: {
							user: {name: 'user'},
							error: {message: ''},
							getCredentials() {
								return EMPTY;
							}
						}
					},
					{
						provide: credentialsConfig,
						useValue: {
							noCredentialsMessage: 'TEST'
						}
					}
				]
		}).compileComponents();
	}));

	beforeEach(inject([CredentialsService, Store], (_credentialsService: CredentialsService, _store: Store<any>) => {
		fixture = TestBed.createComponent(CredentialsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
		store = _store;
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});

	it('on click on X close the panel' , () => {
		spyOn(store, 'dispatch');
		fixture.nativeElement.querySelector('.close-btn').click();
		expect(store.dispatch).toHaveBeenCalledWith(new UnSelectMenuItemAction());
	})
});
