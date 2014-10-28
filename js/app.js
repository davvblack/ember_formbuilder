/*
 BSDEM.Router.map(function() {
 // put your routes here
 });

 BSDEM.IndexRoute = Ember.Route.extend({
 model: function() {
 return ['red', 'yellow', 'blue'];
 }
 });
 */

BSDEM = Ember.Application.create();

var attr = DS.attr();

/* This won't be posted by the app. */
BSDEM.AppForm = DS.Model.extend({
    id: attr,
    app_form_fields: DS.hasMany(BSDEM.AppFormField)
})

BSDEM.AppFormField = DS.Model.extend({
    id: attr,
    app_form_id: DS.belongsTo(BSDEM.AppForm),
    display_order: attr,
    type: attr,
    settings: DS.belongsTo(BSDEM.AppFormFieldSettings, {embedded:'always'}),
    is_new: attr
})

BSDEM.AppFormFieldSettings = DS.Model.extend({
    label: attr,
    name: attr,
    isRequired: attr,
    valueIfBlank: attr,
    valueIfChecked: attr,
    valueIfUnchecked: attr,
    default: attr,
    options: attr
    isIncludedOnTaxReciept: attr,
})

BSDEM.AppForm.reopenClass({
    FIXTURES:{
        id: 1,
        app_form_fields: []
    }
})