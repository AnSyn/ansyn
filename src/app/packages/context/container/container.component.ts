import { Component, OnInit } from '@angular/core';
import { ContextProviderService } from '../providers/context-provider.service';
import { ContextCriteria } from '../context.interface';
import 'rxjs/add/observable/fromEvent';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/merge';
import 'rxjs/add/operator/startWith';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/delay';
import { logger } from 'codelyzer/util/logger';
import { Context } from '../';

@Component({
	selector: 'ansyn-context-container',
	templateUrl: './container.component.html',
	styleUrls: ['./container.component.css']
})

export class ContainerComponent implements OnInit {

	public providerType: string;
	public contextProviders: string[];
	public contextBody: string;
	public findStream: Subject<any>;
	public editItem: any;
	public result: Context[] = [];

	constructor(public contextProviderService: ContextProviderService) {
		this.contextProviders = this.contextProviderService.keys();

		this.findStream = new Subject();

		this.findStream
			.switchMap(result =>{
				console.log('flat map ',result);
				return result;
			})
			.subscribe((res: any) => {
				console.log(res);
				if (res.hits) {
					this.result = res;
				}
			});
	}

	changeSourceProvider(key) {
		this.providerType = key;
		this.result = [];
	}


	ngOnInit() {
		this.providerType = 'Proxy';
		this.find();
	}

	create() {
		const context = JSON.parse(this.contextBody);
		this.findStream.next(this.contextProviderService
			.provide(this.providerType)
			.create(context)
			.delay(1000)
			.switchMap(() => this.find$()));

		this.clear();
	}

	find(): void {
		this.findStream.next(this.find$());
		this.clear();
	}

	find$() {
		console.log('find');
		const criteria = new ContextCriteria({start: 0, limit: 20});
		return this.contextProviderService.provide(this.providerType).find(criteria);
	}

	edit(id) {
		console.log('edit', id);
		this.editItem = this.result.find((context: any) => context.id === id);
		const contextBody = {};
		Object.keys(this.editItem).forEach((key) => {
			if(key !== 'id'){
				contextBody[key] = this.editItem[key];
			}
		});
		this.contextBody = JSON.stringify(contextBody);
	}

	delete(id) {
		console.log('delete', id);
		this.findStream.next((this.contextProviderService
			.provide(this.providerType)
			.remove(id)
			.switchMap(() => this.find$())));
	}

	update() {
		this.findStream.next(this.contextProviderService
			.provide(this.providerType)
			.update(this.editItem.id, JSON.parse(this.contextBody))
			.switchMap(() => this.find$()));
		this.clear();
	}


	clear() {
		this.editItem = {};
		this.contextBody = '';
	}


}
