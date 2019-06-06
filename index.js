var api = "localhost:8080/"

var countrySelector
var citySelector
var currentforecast

var cityChoose = new Vue({
  el: '#cityChoose',
  data:
  {
    city: null,
    country: null
  }
})

Vue.component('select2', {
    props: ['options', 'value'],
    template: '#country-template',
    mounted: function () {
      var vm = this
      $(this.$el)
        // init select2
        .select2({ 
            templateResult: formatCountry,
            data: this.options })
        .val(this.value)
        .trigger('change')
        // emit event on change.
        .on('change', function () {
          vm.$emit('input', this.value)         
        })
    },
    watch: {
      value: function (value) {
        // update value
        $(this.$el)
            .val(value)
            .trigger('change')
            
          console.log("selector changed " + value)
          
          if(value.length == 2) //country changes
          {
            console.log("type: country")
            cityChoose.country = value
            cityLoad(value)             //load city list
          }
          else if (value.length > 2)//city changes - do nothing
          {
            console.log("type: city")
            cityChoose.city = value
          }
      },
      options: function (options) {
        // update options
        $(this.$el).empty().select2({ data: options })
      }
    },
    destroyed: function () {
      $(this.$el).off().select2('destroy')
    }
  })  
  
countrySelector = new Vue({
  el: '#countrySelector',
  template: '#demo-template',    
  data: {
    selected: null,
    options: countries
  }
})

citySelector = new Vue({    
  el: '#citySelector',
  template: '#demo-template',    
  data: {
    selected: "",
    options: []
  }
})

currentforecast = new Vue({
  el: '#currentforecast',
  data:
  {
    city: null,    
    date: null,
    humidity: null,
    temp: null
  }
})

if(localStorage.getItem('city') && localStorage.getItem('country'))
{    
    cityChoose.city = localStorage.getItem('city')
    cityChoose.country = localStorage.getItem('country')
    console.log("retrived form local storage: " + cityChoose.city + " " + cityChoose.country)

    $.get(`http://${api}currentforecasts?country=${cityChoose.country}&city=${cityChoose.city}`, (data)=>
    {
      currentforecast.city = data.city
      currentforecast.temp = data.temp 
    })
  }


//helpers functrions
function cityLoad(country)
{ 
  citySelector.selected = ""
  cityChoose.city = null

  $.get(`http://${api}cities?country=${cityChoose.country}`, (data)=>
  {            
      citySelector.options = data
  }) 
}


function formatCountry (country) 
{
  if (!country.id) { return country.text; }
  var $country = $(
    '<span class="flag-icon flag-icon-'+ country.id.toLowerCase() +' flag-icon-squared"></span>' +
    '<span class="flag-text">'+ country.text+"</span>"
  )
  return $country
}

function onSubmit()
{
    $.get(`http://${api}currentforecasts?country=${cityChoose.country}&city=${cityChoose.city}`, (data)=>
    {        
      currentforecast.city = data.city
      currentforecast.temp = data.temp      
      
      if($('#remember').prop("checked") == true)
      {
          console.log("Checkbox is checked. saved to local storage: " + cityChoose.city + " " + cityChoose.country)

          localStorage.setItem("city", cityChoose.city)
          localStorage.setItem("country", cityChoose.country)
      }

    })     
     
  
}
