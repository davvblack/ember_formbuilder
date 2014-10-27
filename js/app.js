BSDEM = Ember.Application.create();

BSDEM.Router.map(function() {
  // put your routes here
});

BSDEM.IndexRoute = Ember.Route.extend({
  model: function() {
    return ['red', 'yellow', 'blue'];
  }
});

var attr = DS.attr();

BSDEM.AppFormField = DS.Model.extend({
    id: attr,
    app_form_id: attr,
    display_order: attr,
    type: attr,
    settings: DS.belongsTo(BSDEM.AppFormFieldSettings,{embedded:'always'})
})

BSDEM.AppFormFieldSettings = DS.Model.extend({
    label: attr,
    isRequired: attr,
    isIncludedOnTaxReciept: attr,
    valueIfBlank: attr,
    valueIfChecked: attr,
    valueIfUnchecked: attr,
    name: attr
})

