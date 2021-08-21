import {select, settings} from '../settings.js';

class AmountWidget{
  constructor(element, amount){ //if(undefined) ==> amount value is not passed
    const thisWidget = this;


    thisWidget.getElements(element);

    //console.log('element: ', element);


    if(typeof amount === 'undefined'){
      thisWidget.setValue(settings.amountWidget.defaultValue);
    }
    else{
      thisWidget.setValue(amount);
    }

    thisWidget.initActions();

  }

  getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    /*
    console.log('thisWidget.element: ', thisWidget.element);
    console.log('thisWidget.input: ', thisWidget.input);
    console.log('thisWidget.linkDecrease: ', thisWidget.linkDecrease);
    console.log('thisWidget.linkIncrease: ', thisWidget.linkIncrease);
    */
  }

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);
    //console.log('isNaN(newValue): ', isNaN(newValue));

    /* TODO: Add validation */
    if(thisWidget.value !== newValue && !isNaN(newValue) && newValue >= settings.amountWidget.defaultMin && newValue <= settings.amountWidget.defaultMax){
      thisWidget.value = newValue;
      //console.log('test04');
      thisWidget.announce();
    }

    thisWidget.input.value = thisWidget.value;
  }

  initActions(){
    const thisWidget = this;

    thisWidget.input.addEventListener('change', function(){
      //console.log('thisWidget.input.value: ', thisWidget.input.value);
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(){
      //console.log('thisWidget.input.value: ', thisWidget.input.value);
      event.preventDefault();
      thisWidget.setValue(thisWidget.value-1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(){
      //console.log('thisWidget.input.value: ', thisWidget.input.value);
      event.preventDefault();
      thisWidget.setValue(thisWidget.value+1);
    });
  }

  announce(){
    const thisWidget = this;
    //console.log('test05');

    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }
}

export default AmountWidget;
