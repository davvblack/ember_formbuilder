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
    id: attr("number"),
    app_form_id: DS.belongsTo(BSDEM.AppForm),
    display_order: attr("number"),
    type: attr("string"),
    settings: DS.belongsTo(BSDEM.AppFormFieldSettings, {embedded:'always'}),
    is_new: attr("boolean", {defaultValue: true})
})

BSDEM.AppFormFieldSettings = DS.Model.extend({
    label: attr("string"),
    name: attr("string"),
    isRequired: attr("boolean"),
    valueIfBlank: attr("string"),
    valueIfChecked: attr("string"),
    valueIfUnchecked: attr("string"),
    default: attr("string"),
    options: attr,
    isIncludedOnTaxReciept: attr("boolean"),
})

BSDEM.AppForm.reopenClass({
    FIXTURES:{
        id: 1,
        app_form_fields: []
    }
})