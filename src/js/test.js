/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';
  /*
  let btn = document.querySelector("#bt1");

  btn.addEventListener("click", function(e){
    console.log("The button was clicked.");
  })

  let students = [{name:"Mary",score:90,school:"EAST"},{name:"James",score: 40,school:"east"},{name:"Matt", score: 90,school:"West"}];

  let procStud = function(data, callback) {
    for(let i=0; i< data.length; i++){
      if (data[i].school.toLowerCase() === "east"){
        if (typeof callback === "function"){
          callback(data[i]);
        }
      }
    }
  }

  procStud(students, function(obj){
    if(obj.score > 60){
      console.log(obj.name + " passed.");
    }
  });

  */


  /*

  const products = [
    {
      id: 1,
      name: 'Pencil',
      attributes: {
        material: 'wood/graphite',
      },
    },
    {
      id: 2,
      name: 'Pen',
      attributes: {
        material: 'metal/plastic',
      },
    },
  ];

  const productsJSON = JSON.stringify(products);
  console.log(productsJSON);

  const productsParsed = JSON.parse(productsJSON);
  console.log(productsParsed[0].name); // "Pencil"
  console.log(JSON.stringify(products, null, '  '));
  */

  /*
  const url = 'https://reqres.in/api/users';

  const request = fetch(url);

  const parseServerResponse = request.then(function(rawResponse){
    return rawResponse.json();
  })

  parseServerResponse.then(function(parsedResponse){
    console.log(parsedResponse)
  });
  */

  /*
  const url = 'https://reqres.in/api/users';

  fetch(url)
    .then(function(rawResponse){
      return rawResponse.json();
    })
    .then(function(parsedResponse){
      console.log(parsedResponse)
  });
  */


  /*
  const url = 'https://reqres.in/api/users';

  fetch(url)
    .then(rawResponse => rawResponse.json())
    .then(parsedResponse => {
      console.log(parsedResponse)
  });
  */

  /*
  const url = 'https://reqres.in/api/users';

  const payload = {
    name: 'Mack Tubby',
    job: 'Top Cat',
  };

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  fetch(url, options)
    .then(rawResponse => rawResponse.json())
    .then(parsedResponse => {
      console.log(parsedResponse)
  });
  */

  /*
  const urlWithBadDomain = 'https://not-really-a-website.nope/api/users';

  fetch(urlWithBadDomain)
    .then(rawResponse => rawResponse.json())
    .then(parsedResponse => {
      console.log(parsedResponse)
    })
    .catch((error) => {
      console.warn('CONNECTION ERROR', error)
    });
    */


  /*
    const urlWithBadDomain = 'https://reqres.in/wrong/page';

    fetch(urlWithBadDomain)
      .then(rawResponse => {
        if (rawResponse.status >= 200 && rawResponse.status < 300) {
          return rawResponse.json();
        } else {
          return Promise.reject(rawResponse.status + ' ' + rawResponse.statusText);
        }
      })
      .then(parsedResponse => {
        console.log(parsedResponse)
      })
      .catch((error)=>{
        console.log('CONNECTION ERROR', error)
    });
    */


























}
