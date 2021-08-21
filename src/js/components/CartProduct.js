import {select} from '../settings.js';
import AmountWidget from './AmountWidget.js';

class CartProduct{
  constructor(menuProduct, element){
    const thisCartProduct = this;

    //console.log('menuProduct: ', menuProduct.id);


    thisCartProduct.id = menuProduct.id;
    thisCartProduct.name = menuProduct.name;
    thisCartProduct.amount = menuProduct.amount;
    thisCartProduct.params = menuProduct.params;
    thisCartProduct.price = menuProduct.price;
    thisCartProduct.priceSingle = menuProduct.priceSingle;
    thisCartProduct.tokenId = menuProduct.tokenId;

    thisCartProduct.getElements(element);
    //console.log('thisCartProduct: ', thisCartProduct);
    thisCartProduct.initAmountWidget();
    thisCartProduct.initActions();
  }

  getElements(element){
    const thisCartProduct = this;

    thisCartProduct.dom = {};
    thisCartProduct.dom.wrapper = element;
    thisCartProduct.dom.amountWidget = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.amountWidget);
    thisCartProduct.dom.price = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.price);
    thisCartProduct.dom.edit = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.edit);
    thisCartProduct.dom.remove = thisCartProduct.dom.wrapper.querySelector(select.cartProduct.remove);
    //thisCartProduct.dom.amountWidget.input = thisCartProduct.dom.amountWidget.querySelector(select.widgets.amount.input);
    //console.log('thisCartProducts-getElements: ', thisCartProduct);
  }

  initAmountWidget(){
    const thisCartProduct = this;

    thisCartProduct.amountWidget = new AmountWidget(thisCartProduct.dom.amountWidget, thisCartProduct.amount);
    //console.log('thisProduct.amountWidget:', thisProduct.amountWidget);
    //console.log('thisProduct.amountWidgetElem:', thisProduct.amountWidgetElem);

    //console.log('test06');



    thisCartProduct.dom.amountWidget.addEventListener('updated', function(){
      //thisCartProduct.processCartProduct();
      thisCartProduct.dom.price.innerHTML = thisCartProduct.priceSingle;
    });

  }

  processCartProduct(){
    //const thisCartProduct = this;
    //console.log('thisCartProduct.amountWidget.value: ' + JSON.stringify(thisCartProduct.amountWidget));

    //let amount = thisCartProduct.amountWidget.value;
    //let price = thisCartProduct.price;

    //price = amount * thisCartProduct.priceSingle;

    //thisCartProduct.dom.price.innerHTML = price;

    //console.log('test13');

  }

  remove(){
    const thisCartProduct = this;

    const event = new CustomEvent('remove', {
      bubbles: true,
      detail: {
        cartProduct: thisCartProduct,
      },
    });

    //console.log('thisCartProduct: ', thisCartProduct);

    //console.log('test19');

    thisCartProduct.dom.wrapper.dispatchEvent(event);
  }

  initActions(){
    const thisCartProduct = this;

    thisCartProduct.dom.edit.addEventListener('click', function(){

    });

    thisCartProduct.dom.remove.addEventListener('click', function(){
      thisCartProduct.remove();

    });

  }

  getData(){
    const thisCartProduct = this;
    //console.log('thisCartProduct: ',thisCartProduct);

    const miniObj = {};
    miniObj.id = thisCartProduct.id;
    miniObj.amount = thisCartProduct.amount;
    miniObj.price = thisCartProduct.price;
    miniObj.priceSingle = thisCartProduct.priceSingle;
    miniObj.name = thisCartProduct.name;
    miniObj.params = thisCartProduct.params;
    miniObj.tokenId = thisCartProduct.tokenId;


    return miniObj;

  }
}


export default CartProduct;
