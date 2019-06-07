//init vars
var api = "localhost:8080/"
var countrySelector
var citySelector
var currentforecast
var settings
var interval = 60000 //refresh interval milliseconds

//iniv vue components
settings = new Vue({
  el: '#settings',
  data:
  {
    city: null,
    country: null,
    isSettingsShown: false,
    forecastDays: 1
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

//helpers functrions
function cityLoad(country)
{ 
  citySelector.selected = ""
  settings.city = null

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
    $.get(`http://${api}currentforecasts?country=${settings.country}&city=${settings.city}`, (data)=>
    {        
      currentforecast.city = data.city
      currentforecast.temp = data.temp 
      currentforecast.description = data.description
      currentforecast.icon = data.icon      
      
      if($('#remember').prop("checked") == true)
      {
          console.log("Checkbox is checked. saved to local storage: " + settings.city + " " + settings.country)

          localStorage.setItem("city", settings.city)
          localStorage.setItem("country", settings.country)
      }
    }) 
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
  console.log("refresh forecast")
  if(currentforecast.city != null)

  $.get(`http://${api}currentforecasts?country=${settings.country}&city=${settings.city}`, (data)=>
  {
    currentforecast.city = data.city
    currentforecast.temp = data.temp 
    currentforecast.description = data.description
    currentforecast.icon = data.icon
  })
}

//main script
if(localStorage.getItem('city') && localStorage.getItem('country'))
{    
    settings.city = localStorage.getItem('city')
    settings.country = localStorage.getItem('country')
    console.log("retrived form local storage: " + settings.city + " " + settings.country)

    $.get(`http://${api}currentforecasts?country=${settings.country}&city=${settings.city}`, (data)=>
    {
      currentforecast.city = data.city
      currentforecast.temp = data.temp 
      currentforecast.description = data.description
      currentforecast.icon = data.icon
    })
}

setInterval(refresh, interval) //update forecast every minure