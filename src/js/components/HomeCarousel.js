import {select, templates} from '../settings.js';
// import utils from '../utils.js';

class HomeCarousel{
  constructor(element){
    const thisHomeCarousel = this;

    thisHomeCarousel.render(element);

  }


  render(element){
    const thisHomeCarousel = this;

    thisHomeCarousel.dom = {};
    thisHomeCarousel.dom.wrapper = element;

    // thisHome.dom.gallery = thisHome.dom.wrapper.querySelectorAll(select.home.galleryTile);
    // thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    // thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    // thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
    // thisHome.dom.wholeGallery = thisHome.dom.wrapper.querySelector(select.home.galleryTiles);


    // for(const elem of thisHome.dom.gallery){
    //   elem.innerHTML = '<a href="#"><i class="fas fa-heart"></i></a>';
    //   console.log('thisHome.dom.gallery:', thisHome.dom.gallery);
    //   console.log('elem:', elem);
    // }

    // console.log('thisHome.dom.wholeGallery:', thisHome.dom.wholeGallery);
    // const divGal = utils.createDOMFromHTML('<div><a href="#"><i class="fas fa-heart"></i></a></div>');
    // const divGalHTML = '<div><a href="#"><i class="fas fa-heart"></i></a></div>';

    // for(let i=1;i<=6;i++){
    //   let divGal2 = document.createElement('div');
    //   divGal2.innerHTML = '<div><a href="#"><i class="fas fa-heart"></i></a><a href="#"><i class="fas fa-share-alt"></i></a></div>';
    //   thisHome.dom.wholeGallery.appendChild(divGal2);
    // }

    // console.log('thisHome.dom.wrapper:', thisHome.dom.wrapper);


  }

}

export default HomeCarousel;
