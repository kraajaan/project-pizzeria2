import {select, templates, settings, classNames} from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking{
  constructor(element){
    const thisBooking = this;

    thisBooking.selectedTable = 0;

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

  }

  getData(){
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate),
      endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    // console.log('thisBooking', thisBooking);

    const params = {
      bookings: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        endDateParam,
      ],
    };

    // console.log('getData params', params);

    const urls = {
      bookings:      settings.db.url + '/' + settings.db.bookings
                                     + '?' + params.bookings.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsCurrent.join('&'),
      eventsRepeat:  settings.db.url + '/' + settings.db.events
                                     + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function(allResponses){
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function([bookings, eventsCurrent, eventsRepeat]){
        // console.log('bookings:', bookings);
        // console.log('eventsCurrent:', eventsCurrent);
        // console.log('eventsRepeat:', eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });


    //console.log('getData urls', urls);
  }

  parseData(bookings, eventsCurrent, eventsRepeat){
    const thisBooking = this;

    thisBooking.booked = {};

    for(let item of eventsCurrent){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for(let item of bookings){
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for(let item of eventsRepeat){
      if(item.repeat == 'daily'){
        for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    // console.log('thisBooking.booked:', thisBooking.booked);

    thisBooking.updateDOM();

  }

  makeBooked(date, hour, duration, table){
    const thisBooking = this;

    if(typeof thisBooking.booked[date] == 'undefined'){
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for(let hourBlock = startHour; hourBlock < (startHour + duration); hourBlock += 0.5){
      //console.log('loop', hourBlock);
      if(typeof thisBooking.booked[date][hourBlock] == 'undefined'){
        thisBooking.booked[date][hourBlock] = [];
      }

      thisBooking.booked[date][hourBlock].push(table);
    }

    // console.log('thisBooking.booked:', thisBooking.booked);

  }

  updateDOM(){
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if(
      typeof thisBooking.booked[thisBooking.date] == 'undefined'
      ||
      typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
    ){
      allAvailable = true;
    }

    for(let table of thisBooking.dom.tables){
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);

      if(!isNaN(tableId)){
        tableId = parseInt(tableId);
      }

      if(
        !allAvailable
        &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
      ){
        table.classList.add(classNames.booking.tableBooked);
      }
      else {
        table.classList.remove(classNames.booking.tableBooked);
      }


    }

  }

  render(element){
    const thisBooking = this;

    const generatedHTML = templates.bookingWidget();
    thisBooking.dom = {};
    thisBooking.dom.wrapper = element;
    /* Add element to menu */
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

    thisBooking.dom.form = thisBooking.dom.wrapper.querySelector(select.booking.bookingForm);
    thisBooking.dom.date = thisBooking.dom.wrapper.querySelector(select.booking.date);
    thisBooking.dom.hour = thisBooking.dom.wrapper.querySelector(select.booking.hour);
    thisBooking.dom.people = thisBooking.dom.wrapper.querySelector(select.booking.people);
    thisBooking.dom.duration = thisBooking.dom.wrapper.querySelector(select.booking.duration);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);

    console.log('thisBooking.dom.wrapper:', thisBooking.dom.wrapper);


  }

  initWidgets(){
    const thisBooking = this;

    thisBooking.peopleAmount = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmount = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function(){
      thisBooking.updateDOM();
      thisBooking.rmSelected();
    });

    for(const elem of thisBooking.dom.tables){
      elem.addEventListener('click', function(e){
        thisBooking.initTables(e);
      });
    }

    // const floor = thisBooking.dom.podloga;
    // floor.addEventListener('click', function(e){
    //   e.target.class == table ||
    // });




    thisBooking.dom.form.addEventListener('submit', function(){
      event.preventDefault();
      if(thisBooking.selectedTable != 0){
        thisBooking.sendBooking();
      }
    });
  }

  initTables(e){
    const thisBooking = this;

    const classSelected = classNames.booking.tableSelected;
    // debugger;
    thisBooking.rmSelected();

    if(e.target.classList.contains('booked')){
      // setTimeout(alertBooked, 0);
      alert('This table is booked at a given time. Choose another table!');
    }
    else {
      e.target.classList.add(classSelected);
      thisBooking.selectedTable = e.target.getAttribute('data-table');
    }
    console.log('thisBooking.selectedTable:', thisBooking.selectedTable);

    // function alertBooked() {
    //   alert('This table is booked at a given time. Choose another table!');
    // }
  }

  rmSelected(){
    const thisBooking = this;

    const classSelected = classNames.booking.tableSelected;

    for(const elem of thisBooking.dom.tables){
      elem.classList.remove(classSelected);
    }
    thisBooking.selectedTable = 0;
    console.log('thisBooking.selectedTable2:', thisBooking.selectedTable);
  }

  sendBooking(){
    const thisBooking = this;
    const payload = {};

    const url = settings.db.url + '/' + settings.db.bookings;

    payload.starters = [];

    payload.date = thisBooking.dom.date.value;
    payload.hour = utils.numberToHour(thisBooking.dom.hour.value);
    payload.table = parseInt(thisBooking.selectedTable);
    payload.ppl = parseInt(thisBooking.dom.people.value);
    payload.duration = parseInt(thisBooking.dom.duration.value);
    payload.address = thisBooking.dom.address.value;
    payload.phone = thisBooking.dom.phone.value;

    for(const elem of thisBooking.dom.starters){
      if(elem.checked == true){
        payload.starters.push(elem.value);
      }
    }

    // console.log('payload.starters:', payload.starters);



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
        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        thisBooking.initTables();
      }).catch(function(error) {
        console.warn(error);
      });



  }

}

export default Booking;
