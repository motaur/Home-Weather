var api = "localhost:8080/"
var city;
var country;
var cityAdded = false

Vue.component('select2', {
    props: ['options', 'value'],
    template: '#select2-template',
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
            
            if(cityAdded == false)
            {
              cityadded = true
              addCitySelector(value)
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
  
var countrySelector = new Vue({
  el: '#countrySelector',
  template: '#demo-template',    
  data: {
    selected: "",
    options: countries
  }
})

  function addCitySelector(country)
  {
    new Vue({    
      el: '#citySelector',
      template: '#demo-template',    
      data: {
        selected: "",
        options: []
      },
      created()
      {
        $.get(`http://${api}cities?country=${country}`, (data, status)=>
        {   
            console.log(data)

            for(var i in data)
                this.options.push({id: data[i], text: data[i].key})

            console.log(this.options)
        })
      }
    })        


    //     fetch(`http://${api}cities?country=${country}`, {mode: 'no-cors'})
    //       .then(response => response.json())
    //       .then(json => {              
    //         this.options = json.options
    //       })
    //   }
      
    // }) 
  }
  

  function formatCountry (country) {
              if (!country.id) { return country.text; }
              var $country = $(
                '<span class="flag-icon flag-icon-'+ country.id.toLowerCase() +' flag-icon-squared"></span>' +
                '<span class="flag-text">'+ country.text+"</span>"
              );
              return $country;
            };