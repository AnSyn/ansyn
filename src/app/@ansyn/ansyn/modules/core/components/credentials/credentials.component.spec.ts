import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';

import { CredentialsComponent } from './credentials.component';
import { CredentialsService } from '../../services/credentials/credentials.service';
import { HttpClientModule } from '@angular/common/http';
import { credentialsConfig } from '../../services/credentials/config';

describe('CredentialsComponent', () => {
	let component: CredentialsComponent;
	let fixture: ComponentFixture<CredentialsComponent>;

	beforeEach(async(() => {
		TestBed.configureTestingModule({
			imports: [HttpClientModule],
			declarations: [CredentialsComponent],
			providers: [
				{
					provide: CredentialsService,
					useValue: {
						getCredentials: () => {}
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

	beforeEach(inject([CredentialsService], (_credentialsService: CredentialsService) => {
		fixture = TestBed.createComponent(CredentialsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	}));

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
