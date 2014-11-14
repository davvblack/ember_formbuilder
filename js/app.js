/*

 */

BSDEM = Ember.Application.create();
BSDEM.Router.map(function() {
    //this.resource('form', {path: '/'});
    this.resource('fields', {path: '/'});
    /*
    this.resource('formbuilder', { path: '/' }, function () {
        this.route('form');
        this.route('fields');
    });
    */

});

BSDEM.FormRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('app-form',1);
    },
    renderTemplate: function() {
        this.render({ outlet: 'form' });
    }
});

BSDEM.FieldsRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('app-form-field');
    },
    renderTemplate: function() {
        this.render({ outlet: 'fields' });
    }
});

var attr = DS.attr;

/* Models */

// This won't be posted by the app.
BSDEM.AppForm = DS.Model.extend({
    app_form_fields: DS.hasMany('AppFormField', {async:true}),
    name: attr("string")
});

BSDEM.AppFormField = DS.Model.extend({
    app_form_id: DS.belongsTo('AppForm'),
    display_order: attr("number"),
    type: attr("string"),
    settings: DS.belongsTo('AppFormFieldSettings', {embedded:'always'}),
    is_new: attr("boolean", {defaultValue: true})
});

BSDEM.AppFormFieldSettings = DS.Model.extend({
    label: attr("string"),
    name: attr("string"),
    isRequired: attr("boolean"),
    valueIfBlank: attr("string"),
    valueIfChecked: attr("string"),
    valueIfUnchecked: attr("string"),
    default: attr("string"),
    options: attr(), //["value", "value", "value"]
    isIncludedOnTaxReciept: attr("boolean")
});

/* Fixtures for debugging */

BSDEM.ApplicationAdapter = DS.FixtureAdapter;

BSDEM.AppFormFieldSettings.reopenClass({
    FIXTURES:[
        {
            id:1,
            label: "Hi",
            name: "Whatever",
            isRequired: false,
            valueIfBlank: "thing",
            valueIfChecked: "thing",
            valueIfUnchecked: "thing",
            default: "thing",
            options: ["value", "value", "value"],
            isIncludedOnTaxReciept: false
        },
        {
            id:3,
            label: "wat",
            name: "wat2",
            isRequired: false,
            valueIfBlank: "thing",
            valueIfChecked: "thing",
            valueIfUnchecked: "thing",
            default: "thing",
            options: ["value", "value", "value"],
            isIncludedOnTaxReciept: false
        }
    ]
});

BSDEM.AppFormField.reopenClass({
    FIXTURES:[
        {
            id: 1,
            app_form_id: 1,
            display_order: 1,
            type: "radio",
            settings: 1,
            is_new: true
        },
        {
            id: 2,
            app_form_id: 1,
            display_order: 2,
            type: "textarea",
            settings: 3,
            is_new: true
        }
    ]
});


BSDEM.AppForm.reopenClass({
    FIXTURES:[
        {
            id: 1,
            name: "steve2",
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

BSDEM.fieldSupertypeList = new Ember.Set([
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

BSDEM.FormbuilderFormController = Ember.Controller.extend({
    thing: "whatever"
});

BSDEM.FormbuilderFieldsController = Ember.ArrayController.extend({
    lookupItemController: function(object) {
        //"radio"=>"multipleField"=>"MultipleFieldController"
        return BSDEM.fieldSupertypeMap[object.get("type")].toLowerCase() + "Field";
    }
});

BSDEM.FieldController = Ember.Controller.extend({
    showTypeLine: true,
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
        for (BSDEM.fieldSupertypeMap in BSDEM.fieldSupertypeMap) {

        }
    })
});

BSDEM.TextFieldController = BSDEM.FieldController.extend({

});

BSDEM.MultipleFieldController = BSDEM.FieldController.extend({
    isMultipleOptions: true
});

BSDEM.CheckboxFieldController = BSDEM.FieldController.extend({
    isSingleCheckbox: true
});

BSDEM.StaticFieldController = BSDEM.FieldController.extend({
    htmlEditorHideable: false,

    showHtmlEditor: true
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