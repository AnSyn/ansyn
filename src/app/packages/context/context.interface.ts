//	 docker run -p 9200:9200 -v  /esdata1:/usr/share/elasticsearch/data -e "http.host=0.0.0.0" -e "transport.host=127.0.0.1" -e "http.cors.enabled=true" -e "http.cors.allow-origin=/.*/" -e "http.cors.allow-credentials=true" -e "http.cors.allow-headers=X-Requested-With, Content-Type, Content-Length, Authorization" docker.elastic.co/elasticsearch/elasticsearch:5.4.3

export interface IContextSource {
	readonly providerType: string;
	find(ContextCriteria): any;
	remove(id);
	create(Context);
	update(id, Context);
	parseToSource(any);
	parseFromSource(any);
}



export interface IContextSourceConfig {
	type: string;
	uri: string;
	bucket: string;
	available: boolean;
	log?: string;
	auth?: string;

}

export class ContextCriteria {
	start: number;
	limit: number;
	constructor(options: {start, limit}) {
		this.start = options.start;
		this.limit = options.limit;
	}
}

export interface Context {
	id: string;
	title: string;
}

