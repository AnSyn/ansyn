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
	public result: any = {hits: [{hit: {}}]};

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
		this.result = {hits: [{hit: {}}]};
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
		this.editItem = this.result.hits.hits.find((hit: any) => hit._id === id);
		this.contextBody = JSON.stringify({title: this.editItem._source.title});
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
			.update(this.editItem._id, JSON.parse(this.contextBody))
			.switchMap(() => this.find$()));
		this.clear();

	}


	clear() {
		this.editItem = {};
		this.contextBody = '';
	}


}
