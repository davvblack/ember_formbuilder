/*

 */

BSDEM = Ember.Application.create();
BSDEM.Router.map(function() {
    this.resource('form', { path: '/' });

});
/*
BSDEM.IndexRoute = Ember.Route.extend({
    model: function() {
        return ['red', 'yellow', 'blue'];
    }
});
*/
var attr = DS.attr();

/* Models */

// This won't be posted by the app.
BSDEM.AppForm = DS.Model.extend({
    id: attr,
    app_form_fields: DS.hasMany(BSDEM.AppFormField)
});

BSDEM.AppFormField = DS.Model.extend({
    id: attr("number"),
    app_form_id: DS.belongsTo(BSDEM.AppForm),
    display_order: attr("number"),
    type: attr("string"),
    settings: DS.belongsTo(BSDEM.AppFormFieldSettings, {embedded:'always'}),
    is_new: attr("boolean", {defaultValue: true})
});

BSDEM.AppFormFieldSettings = DS.Model.extend({
    id: attr("number"),
    label: attr("string"),
    name: attr("string"),
    isRequired: attr("boolean"),
    valueIfBlank: attr("string"),
    valueIfChecked: attr("string"),
    valueIfUnchecked: attr("string"),
    default: attr("string"),
    options: attr, //["value", "value", "value"]
    isIncludedOnTaxReciept: attr("boolean")
});

/* Fixtures */

BSDEM.AppForm.reopenClass({
    FIXTURES:[
        {
            id: 1,
            app_form_fields: [1]
        }
    ]
});

/* Controllers */

BSDEM.fieldSupertypeMap = {
    text: "TEXT",
    textarea: "TEXT",
    checkbox: "CHECKBOX",
    hidden: "TEXT",
    dropdown: "MULTIPLE",
    radio: "MULTIPLE",
    multi_checkbox: "MULTIPLE",
    static: "STATIC"
};

BSDEM.fieldSupertypeList = Ember.Set([
    "TEXT",
    "MULTIPLE",
    "CHECKBOX",
    "STATIC"
]);

BSDEM.fieldSupertypeNames = {
    TEXT: "Open Text Field",
    MULTIPLE: "Multiple Choice",
    CHECKBOX: "Single Checkbox",
    STATIC: "Static HTML"
}

BSDEM.fieldTypeNames = {
    text: "Single Line",
    textarea: "Multiple Line",
    checkbox: "Single Checkbox",
    hidden: "Hidden Field",
    dropdown: "Dropdown Menu",
    radio: "Radio Button",
    multi_checkbox: "Multiple Checkbox",
    static: "Static HTML"
}

BSDEM.FormController = Ember.Controller.extend({

});

BSDEM.FieldsController = Ember.ArrayController.extend({
    lookupItemController: function(object) {
        return object.get("type");//multi_checkbox
    }
});

BSDEM.FieldController = Ember.Controller.extend({
    showHtmlEditor: false,
    fieldSupertype: Ember.computed('model.type', function(){
        return BSDEM.fieldSupertypeMap[this.get("model.type")];
    }),
    htmlEditorHideable: true,
    isSingleCheckbox: false,
    isMultipleOptions: false,
    previewComponent: Ember.computed('model.type', function(){
        return this.get('model.type') + "-preview";
    }),
    hasTypeOptions: Ember.computed('model.type', function(){
       return countValues(BSDEM.fieldSupertypeMap, this.get('model.type'))>1;
    }),
    typeOptionLabels: Ember.computed('model.type', function(){

    }),
    typeOptionValues: Ember.computed('model.type', function(){

    })
});

BSDEM.MultipleFieldController = BSDEM.FieldController.extend({
    isMultipleOptions: true
});

BSDEM.CheckboxFieldController = BSDEM.FieldController.extend({
    isSingleCheckbox: true
});

BSDEM.StaticFieldController = BSDEM.FieldController.extend({
    htmlEditorHideable: true,
    showHtmlEditor: false
});

BSDEM.OptionsController = Ember.ArrayController.extend({

});

BSDEM.OptionController = Ember.Controller.extend({

});

/* Views */

//BSDEM.

function countValues(from_object, counted_value) {
    return Object.values(from_object).filter( function(val){ return val == counted_value; }).length;
}

Object.values = function(obj) {
    return Object.keys(obj).map(function(key){return obj[key];})
};