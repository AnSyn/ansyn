// https://github.com/wbkd/d3-extended
import { selection } from 'd3-selection';


declare namespace d3 {
	interface ISelection<T, O, N, U> {
		moveToFront: ISelection<T, O, N, U>[];
	}
}


selection.prototype.moveToFront = function () {
	return this.each(function () {
		this.parentNode.appendChild(this);
	});
};

selection.prototype.moveToBack = function () {
	return this.each(function () {
		const firstChild = this.parentNode.firstChild;
		if (firstChild) {
			this.parentNode.insertBefore(this, firstChild);
		}
	});
};
