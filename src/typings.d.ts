/* SystemJS module definition */
/*declare var module: {
 id: string;
 };
 */

declare module '*.json' {
	const value: any;
	export default value;
}
