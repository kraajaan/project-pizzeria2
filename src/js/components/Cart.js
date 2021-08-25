import {select, classNames, settings, templates} from '../settings.js';
import {token, setToken} from '../app.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';

class Cart{
  constructor(element){
    const thisCart = this;

    //console.log('element: ', element);
    //console.log('new Cart1: ', thisCart);

    thisCart.products = [];

    //console.log('new Cart2: ', thisCart);

    thisCart.getElements(element);
    thisCart.initActions();

    //console.log('new Cart3: ', thisCart);
    //console.log('thisCart.products: ', thisCart.products);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};

    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);


  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      //event.preventDefault();
      //console.log('test10');
      thisCart.dom.wrapper.classList.toggle(classNames.menuProduct.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      //console.log('test20');
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(){
      console.log('event.detail.cartProduct: ', event.detail.cartProduct);
      thisCart.remove(event.detail.cartProduct);
      //console.log('thisCart.products: ', thisCart.products);
    });

    thisCart.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  add(menuProduct){
    const thisCart = this;
    //console.log('menuProduct: ', menuProduct);

    /* Generate HTML based on template */
    const generatedHTML = templates.cartProduct(menuProduct);
    //console.log('gentdHTML: ', generatedHTML);

    /* Create element using utils.createElementFromHtml */
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    //console.log('gentdDOM: ', generatedDOM);

    /* Add element to menu */
    thisCart.dom.productList.appendChild(generatedDOM);

    /* add product to final cart */
    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));

    //console.log('thisCart.products: ', thisCart.products);

    thisCart.update();
  }

  update(){
    const thisCart = this;
    //console.log('test16');

    const deliveryFee = settings.cart.defaultDeliveryFee;
    //console.log('deliveryFee: ', deliveryFee);
    let totalNumber = 0,
      subTotalPrice = 0;


    for(let i in thisCart.products){
      let objValue = thisCart.products[i].amountWidget.value,
        objPriceSingle = thisCart.products[i].priceSingle;

      totalNumber = totalNumber + objValue;
      subTotalPrice = subTotalPrice + objPriceSingle * objValue;
    }

    if(totalNumber > 0){
      thisCart.totalPrice = subTotalPrice + deliveryFee;
      thisCart.deliveryFee = deliveryFee;
      thisCart.subtotalPrice = subTotalPrice;
      thisCart.totalNumber = totalNumber;

      thisCart.dom.deliveryFee.innerHTML = deliveryFee;

      //console.log('test17');
    }
    else {
      //console.log('test17');
      thisCart.totalPrice =  0;
      thisCart.deliveryFee = 0;
      thisCart.totalNumber = 0;
      thisCart.dom.deliveryFee.innerHTML = 0;
    }



    //console.log('subTotalPrice: ', subTotalPrice);

    thisCart.dom.totalNumber.innerHTML = totalNumber;
    thisCart.dom.subtotalPrice.innerHTML = subTotalPrice;

    for(const elem of thisCart.dom.totalPrice){
      elem.innerHTML = thisCart.totalPrice;
    }


  }

  remove(obj){
    const thisCart = this;
    //console.log('obj: ', obj.tokenId);

    setToken(obj.tokenId);
    // console.log

    thisCart.dom.liTokenId = thisCart.dom.wrapper.querySelector('[tokenid="' + token + '"]');

    thisCart.dom.liTokenId.innerHTML = '';


    for(let i in thisCart.products){

      if(token == thisCart.products[i].tokenId){
        thisCart.products.splice(i, 1);
      }

    }

    thisCart.update();

    console.log('thisCart.products2: ', thisCart.products);


  }

  sendOrder(){
    const thisCart = this;
    const payload = {};

    const url = settings.db.url + '/' + settings.db.orders;


    payload.address = thisCart.dom.address.value;
    payload.phone = thisCart.dom.phone.value;
    payload.totalPrice = thisCart.totalPrice;
    payload.subtotalPrice = thisCart.subtotalPrice;
    payload.totalNumber = thisCart.totalNumber;
    payload.deliveryFee = thisCart.deliveryFee;
    payload.products = [];

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }



    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    };

    fetch(url, options)
      .then(function(response){
        return response.json();
      }).then(function(parsedResponse){
        console.log('parsedResponse: ', parsedResponse);
      }).catch(function(error) {
        console.warn(error);
      });



  }

}

export default Cart;
