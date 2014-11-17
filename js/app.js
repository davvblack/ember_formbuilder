function countValues(from_object, counted_value) {
    return Object.values(from_object).filter( function(val){ return val == counted_value; }).length;
}

Object.values = function(obj) {
    return Object.keys(obj).map(function(key){return obj[key];})
};

/*

 */

BSDEM = Ember.Application.create();

BSDEM.ApplicationStore = DS.Store.extend();

BSDEM.Router.map(function() {
    this.resource('form', {path: '/'});


});

BSDEM.FormRoute = Ember.Route.extend({
    model: function () {
        return this.store.find('app-form',1);
    },
    renderTemplate: function() {
        this.render({ outlet: 'form' });
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
    settings: DS.belongsTo('AppFormFieldSettings', {embedded:'always', async:true}),
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
    options: DS.hasMany('AppFormFieldFieldOption', {async:true}), //["value", "value", "value"]
    isIncludedOnTaxReciept: attr("boolean")
});

BSDEM.AppFormFieldFieldOption = DS.Model.extend({
    name: attr("string"),
    disabled: attr("boolean")
});


/* Fixtures for debugging */

BSDEM.ApplicationAdapter = DS.FixtureAdapter;

BSDEM.AppFormFieldFieldOption.reopenClass({
    FIXTURES:[
        {
            id:1,
            name:"Option A"
        },
        {
            id:2,
            name:"Option B"
        },
        {
            id:3,
            name:"Option C"
        },
        {
            id:4,
            name:"Option D"
        },
        {
            id:5,
            name:"Option E"
        },
        {
            id:6,
            name:"Option F"
        }
        ]
});

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
            options: Ember.A([1,2,3]),
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
            options: Ember.A([4,5,6]),
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
            app_form_fields: [1,2]
        }
    ]
});



/* Controllers */

/* To represent the relationship between similar types of fields, this app uses "field type", which is the
   data name that corresponds to the widget (ie, textarea, radio, checkbox, etc).

   "field supertype" groups these types into logical categories that share an admin panel.  To make it obvious
   which is which, supertypes are always ALL CAPS, and types are lowercase.  Only types are stored in the database.
   For example, "radio" and "dropdown" are both supertype "MULTIPLE", and they both use the same BSDEM.MultipleFieldController,
   which subclasses BSDEM.FieldController.  Users are allowed to change between types within the same supertype.
 */

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
};

BSDEM.fieldTypeNames = {
    text: "Single Line",
    textarea: "Multiple Line",
    checkbox: "Single Checkbox",
    hidden: "Hidden Field",
    dropdown: "Dropdown Menu",
    radio: "Radio Button",
    multi_checkbox: "Multiple Checkbox",
    static: "Static HTML"
};


BSDEM.FormController = Ember.Controller.extend({
    supertypeOptionLabels: Object.keys(BSDEM.fieldSupertypeNames),
    supertypeOptionValues: Object.values(BSDEM.fieldSupertypeNames)
});

BSDEM.FieldsController = Ember.ArrayController.extend({
    lookupItemController: function(field) {
        // "radio" => "multipleField" => "MultipleFieldController"
        console.log(field.get("type"));
        console.log(field.get("model"));
        console.log(field);
        window.myField = field;
        if(field.get("type")) {
            console.log(BSDEM.fieldSupertypeMap[field.get("type")].toLowerCase() + "Field");
            return BSDEM.fieldSupertypeMap[field.get("type")].toLowerCase() + "Field";
        }
        // While the model is loading, need a fallback controller.  This will pick the abstract FieldController.
        return "Field";
    }
});

BSDEM.FieldController = Ember.Controller.extend({
    editable: true,
    showTypeLine: true,
    showHtmlEditor: false,
    htmlEditorHideable: true,
    isSingleCheckbox: false,
    isMultipleOptions: true,
    previewComponent: Ember.computed('model.type', function(){
        return this.get('model.type') + "-preview";
    }),
    hasTypeOptions: Ember.computed('model.type', function(){
       return countValues(BSDEM.fieldSupertypeMap, this.get('model.type'))>1;
    }),
    typeOptionLabels: Ember.computed('typeOptionValues', function(){
        return this.get('typeOptionsValues').map(function(typeOptionValues){
            return BSDEM.fieldTypeNames[typeOptionValues];
        })
    }),
    typeOptionValues: Ember.computed('model.type', 'supertype', function(){
        types = Em.Array();
        for (fieldType in BSDEM.fieldSupertypeMap) {
            if(BSDEM.fieldSupertypeMap.hasOwnProperty(fieldSupertype)) {
                if(BSDEM.fieldSupertypeMap[fieldType] = this.get('supertype')) {
                    types.push(fieldSupertype);
                }
            }
        }
        return types;
    }),
    typeName: Ember.computed('model.type', function(){
        return BSDEM.fieldTypeNames[this.get('model.type')];
    }),
    supertype: Ember.computed('model.type', function(){
        return BSDEM.fieldSupertypeMap[this.get('model.type')]
    }),
    supertypeName: Ember.computed('supertype', function(){
        return BSDEM.fieldSupertypeNames[this.get('supertype')];
    }),
    actions: {
        edit: function(){
            this.set('editable', true);
        },
        doneEdit: function(){
            this.set('editable', false);
            // Empties out empty options from the array.
            this.set('model.settings.options', this.get('model.settings.options').filter(function(option){
                return option.name;
            }));
        },
        addOption: function(){
            console.log(this.get('model.settings.options'));
            this.get('model.settings.options').pushObject(
                this.store.createRecord('AppFormFieldFieldOption',{name:""})
            );
        }
    }
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

