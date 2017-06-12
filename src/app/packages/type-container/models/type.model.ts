export interface Type extends Function {
    new (...args: any[]): any;
}