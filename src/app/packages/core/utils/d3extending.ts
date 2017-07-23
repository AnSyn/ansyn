
  // https://github.com/wbkd/d3-extended
//import * as d3_ from 'd3';
import { selection } from 'd3-selection';


declare namespace d3{
  interface Selection<T,O,N,U>{
    moveToFront:Selection<T,O,N,U>[];
  }
}


    selection.prototype.moveToFront = function() {
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    selection.prototype.moveToBack = function() {
        return this.each(function() {
            const firstChild = this.parentNode.firstChild;
            if (firstChild) {
                this.parentNode.insertBefore(this, firstChild);
            }
        });
    };
