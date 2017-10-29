declare module '*.json' {
	const value: any;
	export default value;
}

declare module '*package.json' {
	const value: {
		version: string;
	};
	export default value;
}
