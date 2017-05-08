
  // https://github.com/wbkd/d3-extended
import * as d3_ from 'd3';

declare namespace d3{
  interface Selection<T,O,N,U>{
    moveToFront:Selection<T,O,N,U>[]
  }
}


    d3_.selection.prototype.moveToFront = function() {  
      return this.each(function(){
        this.parentNode.appendChild(this);
      });
    };

    d3_.selection.prototype.moveToBack = function() {  
        return this.each(function() { 
            var firstChild = this.parentNode.firstChild; 
            if (firstChild) { 
                this.parentNode.insertBefore(this, firstChild); 
            } 
        });
    };
