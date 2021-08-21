/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 10,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
    db: {
      url: '//localhost:3131',
      products: 'products',
      orders: 'orders',
    },
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
  };

  let token = 1;

  class Product{
    constructor(id, data){
      const thisProduct = this;

      thisProduct.id = id;
      thisProduct.data = data;

      //console.time('crayan timer');

      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.initAmountWidget();
      thisProduct.processOrder();


      //console.timeEnd('crayan timer');

      //console.log('new Product:', thisProduct);
    }

    renderInMenu(){
      const thisProduct = this;

      /* Generate HTML based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      //console.log('gentdHTML: ', generatedHTML);

      /* Create element using utils.createElementFromHtml */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      //console.log('gentdDOM: ', thisProduct.element);

      /* Find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);

      /* Add element to menu */
      menuContainer.appendChild(thisProduct.element);

    }

    getElements(){
      const thisProduct = this;

      thisProduct.dom = {};

      thisProduct.dom.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
      thisProduct.imageWrapper = thisProduct.element.querySelector(select.menuProduct.imageWrapper);
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(select.menuProduct.amountWidget);
    }

    initAccordion(){
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */
      //const clickableTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);

      /* START: add event listener to clickable trigger on event click */
      thisProduct.dom.accordionTrigger.addEventListener('click', function(event) {

        /* prevent default action for event */
        event.preventDefault();

        /* find active product (product that has active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
        //console.log('activeProduct: ', activeProduct);

        /* if there is active product and it's not thisProduct.element, remove class active from it */
        if(activeProduct != null && activeProduct != thisProduct.element){
          activeProduct.classList.remove('active');
        }

        /* toggle active class on thisProduct.element */
        thisProduct.element.classList.toggle('active');

      });

    }

    initOrderForm(){
      const thisProduct = this;
      //console.log('initOrderForm()');

      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });

      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });

    }

    processOrder(){
      const thisProduct = this;
      //console.log('processOrder()');

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);
      //console.log('formData2:', formData);

      // set price to default price
      let price = thisProduct.data.price;
      //console.log('price:', price);

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log('paramId, param: ',paramId, param);

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('paramId-optionId', paramId + '-' + optionId);

          const activeImage = thisProduct.imageWrapper.querySelector('.'+paramId + '-' + optionId);

          //console.log('optionId, option: ', optionId, option);
          //console.log('formData[paramId]:', formData[paramId]);
          //if(formData[paramId].includes(optionId)) { console.log('Wybrano '+optionId); }
          //console.log('option[price]: '+option['price']);
          //console.log('option[default]: '+option['default']);
          if(formData[paramId].includes(optionId)) {
            //console.log('optionId, option: ', optionId, option);
            //console.log('formData[paramId]:', formData[paramId]);
            //console.log('option[default]:', option['default']);
            //console.trace();


            if(activeImage != null){
              activeImage.classList.add(classNames.menuProduct.imageVisible);
              //console.log('activeImage:', activeImage);
            }



            if(option['default']) {
              //console.log('t02');
              //console.log('price: ', optionId + ' ' + option['price']);
            }
            else{
              price = price + option['price'];
            }
          }
          else{

            if(activeImage != null){
              activeImage.classList.remove(classNames.menuProduct.imageVisible);
              //console.log('activeImage:', activeImage);
            }


            if(option['default']) {
              price = price - option['price'];
            }
          }
        }
      }

      //console.log('params our: ', thisProduct);

      thisProduct.priceSingle = price;

      /* multiply price by amount */
      //console.log('thisProduct.amountWidget:', thisProduct.amountWidget);
      price *= thisProduct.amountWidget.value;

      // update calculated price in the HTML
      thisProduct.price = price;
      //console.log('thisProduct.priceSingle:', thisProduct.priceSingle);
      thisProduct.priceElem.innerHTML = price;
      //console.log('thisProduct.priceElem.innerHTML:', thisProduct.priceElem.innerHTML);

    }

    initAmountWidget(){
      const thisProduct = this;

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
      //console.log('thisProduct.amountWidget:', thisProduct.amountWidget);
      //console.log('thisProduct.amountWidgetElem:', thisProduct.amountWidgetElem);

      //console.log('test06');

      thisProduct.amountWidgetElem.addEventListener('updated', function(){
        //console.log('test07');
        //console.log('test08');
        thisProduct.processOrder();
      });
    }

    addToCart(){
      const thisProduct = this;

      app.cart.add(thisProduct.prepareCartProduct());
    }

    prepareCartProduct(){
      const thisProduct = this;

      const productSummary = {};

      productSummary.id = thisProduct.id;
      productSummary.name = thisProduct.data.name;
      productSummary.amount = thisProduct.amountWidget.value;
      productSummary.priceSingle = thisProduct.priceSingle;
      productSummary.price = thisProduct.price;
      productSummary.tokenId = token;
      token++;

      //console.log('productSummary.tokenId: ', productSummary.tokenId);

      productSummary.params = {};

      productSummary.params = thisProduct.prepareCartProductParams();

      //console.log('productSummary: ', productSummary);

      return productSummary;
    }

    prepareCartProductParams(){
      const thisProduct = this;
      //console.log('thisProduct: ', thisProduct);
      const retParams = {};


      //console.log('thisProduct.data.params: ', thisProduct.data.params);

      // covert form to object structure e.g. { sauce: ['tomato'], toppings: ['olives', 'redPeppers']}
      const formData = utils.serializeFormToObject(thisProduct.form);

      // for every category (param)...
      for(let paramId in thisProduct.data.params) {
        //console.log('test12');
        // determine param value, e.g. paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        //console.log('paramId, param: ',paramId, param);
        // create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
        retParams[paramId] = {
          label: param.label,
          options: {}
        };

        // for every option in this category
        for(let optionId in param.options) {
          // determine option value, e.g. optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          //console.log('paramId-optionId', paramId + '-' + optionId);
          /*
          console.log('paramId: ', paramId);
          console.log('param: ', param);
          console.log('optionId: ', optionId);
          console.log('option: ', option);
          */


          if(formData[paramId].includes(optionId)) {
            retParams[paramId].options[optionId] = option.label;
          }

        }
      }

      //console.log('retParams: ', retParams);
      return retParams;


    }
  }

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
        //console.log('event.detail.cartProduct: ', event.detail.cartProduct);
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
        console.log('test17');
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

      let token = obj.tokenId;

      thisCart.dom.liTokenId = thisCart.dom.wrapper.querySelector('[tokenid="' + token + '"]');

      thisCart.dom.liTokenId.innerHTML = '';


      for(let i in thisCart.products){
        //console.log('thisCart.products[i].tokenId: ', thisCart.products[i].tokenId);
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
        //console.log('test21');
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

  const app = {

    initData: function(){
      const thisApp = this;

      thisApp.data = {};

      const url = settings.db.url + '/' + settings.db.products;

      fetch(url)
        .then(function(rawResponse){
          return rawResponse.json();
        })
        .then(function(parsedResponse){
          console.log('parsedResponse: ', parsedResponse);

          /* save parsedResponse as thisApp.data.products */
          thisApp.data.products = parsedResponse;

          /* execute initMenu method */
          thisApp.initMenu();
        });
    },

    initMenu: function(){
      const thisApp = this;

      console.log('thisApp.data:', thisApp.data);

      for(let productData in thisApp.data.products){
        new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        //console.log('productData:', productData);
        //console.log('thisApp.data.products[productData]: ', thisApp.data.products[productData]);
      }
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart);
      //console.log('cartElem: ', cartElem);
      thisApp.cart = new Cart(cartElem);
      //console.log('thisApp.cart: ', thisApp.cart);
    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);

      thisApp.initData();
      thisApp.initCart();
    },


  };

  app.init();
}
