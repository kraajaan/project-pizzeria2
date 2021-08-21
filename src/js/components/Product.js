import {select, classNames, templates} from '../settings.js';
import {token, incToken} from '../app.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';

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
    const deal = thisProduct.prepareCartProduct();

    // app.cart.add(thisProduct.prepareCartProduct());

    const event = new CustomEvent('add-to-cart', {
      bubbles: true,
      detail: {
        product: deal,
      },
    });

    thisProduct.element.dispatchEvent(event);
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
    console.log('token: ', token);
    incToken();

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

export default Product;
