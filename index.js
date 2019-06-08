//init vars
var api = "localhost:8080/"
var countrySelector
var citySelector
var currentforecast
var settings
var interval = 60000 //refresh interval milliseconds
var forecastDays

//iniv vue components
settings = new Vue({
  el: '#settings',
  data:
  {
    city: null,
    country: null,
    isSettingsShown: false,
    days: 0
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
            settings.country = value
            cityLoad(value)             //load city list
          }
          else if (value.length > 2)//city changes - do nothing
          {
            console.log("type: city")
            settings.city = value
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
    temp: null,
    description: null,
    icon: null
  }
})

forecastDays = new Vue({
  el: '#forecastDays',  
  data: { 
    days: 0,
    forecasts: []
  }
})

//helpers functrions
function cityLoad(country)
{ 
  citySelector.selected = ""
  settings.city = null

  //load city list for country
  $.get(`http://${api}cities?country=${settings.country}`, (data)=>
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
    settings.days = $( "#days" ).val()  

    callCurrent()    

    if(settings.days > 0)       
      callForecasts()

    forecastDays.days = settings.days  
    
    if($('#remember').prop("checked") == true)
    {
        console.log("Checkbox is checked. saved to local storage: " + settings.city + " " + settings.country + " " +  settings.days)

        localStorage.setItem("city", settings.city)
        localStorage.setItem("country", settings.country)
        localStorage.setItem("days", settings.days)
    }
}

function showSettings()
{ 
  if(settings.isSettingsShown)   
    settings.isSettingsShown = false 
  else   
    settings.isSettingsShown = true   
}

function refresh()
{  
  if(currentforecast.city != null)
  {
    console.log("refresh current")
    callCurrent()
    
    if(settings.days > 0)      
      callForecasts()
  }  
}

//main script
if(localStorage.getItem('city') && localStorage.getItem('country'))
{    
    settings.city = localStorage.getItem('city')
    settings.country = localStorage.getItem('country')
    settings.days = localStorage.getItem('days')

    console.log("retrived form local storage: " + settings.city + " " + settings.country + " " + settings.days + " days")

    callCurrent()

    if(settings.days > 0)      
      callForecasts()

    forecastDays.days = settings.days  

}

function callForecasts()
{
  $.get(`http://${api}forecasts?country=${settings.country}&city=${settings.city}&days=${settings.days}`, (data)=>
  {
      forecastDays.forecasts = data.forecasts
      console.log(forecastDays.forecasts)
      forecastDays.days = settings.days
  })
    
}

function callCurrent()
{
    $.get(`http://${api}currentforecasts?country=${settings.country}&city=${settings.city}`, (data)=>
    {
      currentforecast.city = data.city
      currentforecast.temp = data.temp 
      currentforecast.description = data.description
      currentforecast.icon = data.icon
    })
}

setInterval(refresh, interval) //update forecast