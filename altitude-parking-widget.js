if (Date.prototype.addHours == undefined) {
  Date.prototype.addHours = function(h) {
    this.setTime(this.getTime() + (h*60*60*1000));
    return this;
  }
}

(function(jQuery){
  $ = jQuery.noConflict();

  var defaults = {
      // inputFormat: "J M Y H:i",
      inputFormat: "J M Y",
      dateFormat: 'Y-m-d',
      timeFormat: 'H:i',
      dowFormat: "l",
      leadTime: 5,
      defaultDuration: 5,
      defaultArrHours: 10,
      defaultArrMins: 30,
      defaultDepHours: 17,
      defaultDepMins: 30,
      minuteIncrement: 15,
      time_24hr: false
  };

  var AltitudeParkingWidget = function(form, options)
  {
    var self = this;
    this.options = $.extend({}, defaults, AltitudeParkingWidget.defaultOptions, options);

    this.$form = $(form)
    this.$form.on('submit', function() { return self.onSubmit() });

    this.$arrivalDateTime = $('[data-arrival-date-time]', this.$form)
    this.$arrivalDate = $('[data-arrival-date]', this.$form)
    this.$arrivalTime = $('[data-arrival-time]', this.$form)
    this.$arrivalDow = $('[data-arrival-dow]', this.$form)

    this.$departureDateTime = $('[data-departure-date-time]', this.$form)
    this.$departureDate = $('[data-departure-date]', this.$form)
    this.$departureTime = $('[data-departure-time]', this.$form)
    this.$departureDow = $('[data-departure-dow]', this.$form)

    var minLeadTime = (new Date()).addHours(this.options.leadTime);

    var defaultArrDate = new Date();
    defaultArrDate.setHours(this.options.defaultArrHours, this.options.defaultArrMins)

    if (minLeadTime >= defaultArrDate) {
        defaultArrDate = (new Date()).fp_incr(1);
        defaultArrDate.setHours(this.options.defaultArrHours, this.options.defaultArrMins)
    }

    this.$arrivalDateTime.flatpickr({
      enableTime: true,
      dateFormat: this.options.inputFormat,
      minuteIncrement: this.options.minuteIncrement,
      time_24hr: this.options.time_24hr,
      defaultDate: defaultArrDate,
      minDate: minLeadTime,
      maxDate: new Date().fp_incr(365),
      onChange: function(selectedDates, dateStr, instance) {
        self.arrivalDateChanged(selectedDates[0])
      }
    });

    var defaultDepDate = defaultArrDate.fp_incr(this.options.defaultDuration);
    defaultDepDate.setHours(this.options.defaultDepHours, this.options.defaultDepMins)

    this.$departureDateTime.flatpickr({
      enableTime: true,
      dateFormat: this.options.inputFormat,
      minuteIncrement: this.options.minuteIncrement,
      time_24hr: this.options.time_24hr,
      defaultDate: defaultDepDate,
      minDate: defaultArrDate,
      maxDate: new Date().fp_incr(365),
      onChange: function(selectedDates, dateStr, instance) {
        self.departureDateChanged(selectedDates[0])
      }
    });

    this.arrivalPicker = this.$arrivalDateTime[0]._flatpickr;
    this.departurePicker = this.$departureDateTime[0]._flatpickr;

    $('[data-arrival-toggle]', this.$form).on('click', function() {
      self.arrivalPicker.open()
    })

    $('[data-departure-toggle]', this.$form).on('click', function() {
      self.departurePicker.open()
    })

    this.updateDates()
  }

  AltitudeParkingWidget.defaultOptions = defaults;

  AltitudeParkingWidget.prototype.arrivalDateChanged = function(date) {
    var depDate = this.departurePicker.selectedDates[0];
    if (depDate <= date)
    {
        var newDepartureDate = date.fp_incr(5);
        newDepartureDate.setHours(depDate.getHours(), depDate.getMinutes());
        this.departurePicker.setDate(newDepartureDate)
    }

    this.departurePicker.set('minDate', date)

    if (this.departurePicker.isOpen)
      this.departurePicker.redraw()
    this.updateDates()
  };

  AltitudeParkingWidget.prototype.departureDateChanged = function(date) {
    this.updateDates()
  };

  AltitudeParkingWidget.prototype.updateDates = function(arrDate, depDate) {
    arrDate = arrDate || this.arrivalPicker.selectedDates[0]
    depDate = depDate || this.departurePicker.selectedDates[0]

    this.$arrivalTime.not(':input').text(flatpickr.formatDate(arrDate, this.options.timeFormat))
    this.$arrivalTime.val(flatpickr.formatDate(arrDate, this.options.timeFormat))

    this.$departureTime.not(':input').text(flatpickr.formatDate(depDate, this.options.timeFormat))
    this.$departureTime.val(flatpickr.formatDate(depDate, this.options.timeFormat))

    this.$arrivalDate.val(flatpickr.formatDate(arrDate, this.options.dateFormat))
    this.$departureDate.val(flatpickr.formatDate(depDate, this.options.dateFormat))

    this.$arrivalDow.text(flatpickr.formatDate(arrDate, this.options.dowFormat))
    this.$departureDow.text(flatpickr.formatDate(depDate, this.options.dowFormat))
  }

  AltitudeParkingWidget.prototype.onSubmit = function() {
    this.updateDates()
    return true;
  }

  AltitudeParkingWidget.init = function(slector, options) {
    $(slector || '[data-altitude-parking]').each(function(i, form){
      var widget = new AltitudeParkingWidget(form, options);
    })
  }

  window.AltitudeParkingWidget = AltitudeParkingWidget;

  // $(function() {

  //   $('[data-altitude-parking]').each(function(i, form){
  //     var widget = new AltitudeParkingWidget(form);

  //     if (window.parkingWidget == undefined)
  //       window.parkingWidget = widget;
  //   })

  // })

})(jQuery)
;