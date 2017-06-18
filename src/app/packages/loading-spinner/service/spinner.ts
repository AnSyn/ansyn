/**
 * Created by AsafMas on 15/06/2017.
 */
export class Spinner {

	private element;
	private outerDiv;
	private wrapper: any;
	private text: string;

	constructor (el) {
		this._setElement(el);
	}

	_setElement (el){
		this.element = el;
		if(typeof this.element === 'string'){
			this.element = document.querySelector(el);
		}
		if(this.element === undefined){
			return ;
		}
		this.wrapper = this.element.offsetHeight;
	}
	_setText (text){
		this.text = text;
	}
	setElement (el) {
		this._setElement(el);
	}

	start(text, color){
		//console.log('start',this.element);
		if(!this.element){
			console.warn('this.element is not defined',this.element);
			return;
		}

		if(text){
			this.text = text;
		}

		this.outerDiv = document.createElement('div');
		this.outerDiv.classList.add('spinner-wrapper');

		let innerDiv = document.createElement('div');
		innerDiv.classList.add('spinner-before');
		this.element.style.position = 'relative';
		let textDiv = undefined;

		if(this.text){
			textDiv = document.createElement('div');
			textDiv.innerHTML = this.text;
			textDiv.classList.add('spinner-text');
		}

		if(screen.height > this.element.offsetHeight && screen.width > this.element.offsetWidth ){
			innerDiv.style.height = this.element.offsetHeight + 'px';
			innerDiv.style.width = this.element.offsetWidth + 'px';
			if(this.text){
				textDiv.style.height = this.element.offsetHeight + 'px';
				textDiv.style.width = this.element.offsetWidth + 'px';
				textDiv.style.top = '50px';
				textDiv.style.position = 'relative';

			}
			if(color) {
				innerDiv.style.backgroundColor = color;
				textDiv.style.color = 'black';
			}

		}else{
			innerDiv.style.height = "100%";
			innerDiv.style.width = "100%";
			innerDiv.style.position = 'fixed';
			this.element = document.querySelector('body');
			if(this.text){
				textDiv.style.height = "100%";
				textDiv.style.width = "100%";
				textDiv.style.position = 'fixed';
			}
		}

		this.outerDiv.appendChild(innerDiv);
		if(this.text){
			this.outerDiv.appendChild(textDiv);
		}
		//console.log(document.querySelector(this.element));
		this.element.appendChild(this.outerDiv);

		/*var color = window.getComputedStyle(
		 document.querySelector('.element'), ':before')
		 .getPropertyValue('color');*/
	}

	stop(){
		if(!this.element){
			console.warn('this.element is not defined',this.element);
			return;
		}
		//let spinner =
		//console.log('stop',el);
		this.element.removeChild(this.outerDiv);
		this.outerDiv = null;
	}
}
