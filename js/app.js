function countValues(from_object, counted_value) {
    return Object.values(from_object).filter( function(val){ return val == counted_value; }).length;
}

function arrayFlip( trans )
{
    var key, tmp_ar = {};
    for ( key in trans )
    {
        if ( trans.hasOwnProperty( key ) )
        {
            tmp_ar[trans[key]] = key;
        }
    }
    return tmp_ar;
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
    app_form_fields: DS.hasMany('AppFormField', {embedded:'always', async:true}),
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
    options: DS.hasMany('AppFormFieldFieldOption', {embedded:'always', async:true}), //["value", "value", "value"]
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

    selectedSupertype: "",

    supertypeOptions: Ember.computed(function(){
        var options = Ember.A();
        for (var fieldSupertype in BSDEM.fieldSupertypeNames) {
            if(BSDEM.fieldSupertypeNames.hasOwnProperty(fieldSupertype)) {
                options.push({label: BSDEM.fieldSupertypeNames[fieldSupertype], value: fieldSupertype});
            }
        }
        console.log(options);
        return options;
    }),

    fields: Ember.computed('model.app_form_fields.@each.type', function () {
        var fields = this.get('model.app_form_fields');
        return fields.filterBy('type');
    }),

    noSelectedSupertype: Ember.computed('selectedSupertype', function(){
        return !this.get('selectedSupertype');
    }),

    actions: {
        logEverything: function() {

            console.log(this.store.all('app-form'));
            console.log(this.store.all('app-form').get('content.0'));
            console.log(this.store.all('app-form').get('content.0').toJSON());
            console.log(this.store.all('app-form-field'));
            console.log(this.store.all('app-form-field').get('content.0'));
            console.log(this.store.all('app-form-field').get('content.0').toJSON());
            console.log(this.store.all('app-form-field-settings'));
            console.log(this.store.all('app-form-field-settings').get('content.0'));
            console.log(this.store.all('app-form-field-settings').get('content.0').toJSON());

        },
        addField: function () {
            console.log("adding field");
            this.get('model.app_form_fields').pushObject(
                this.store.createRecord('AppFormField',
                    {
                        type: arrayFlip(BSDEM.fieldSupertypeMap)[this.get('selectedSupertype')],
                        settings: this.store.createRecord('AppFormFieldSettings')
                    }
                )
            );
        }
    }
});

BSDEM.FieldsController = Ember.ArrayController.extend({
    lookupItemController: function(field) {
        // "radio" => "multipleField" => "MultipleFieldController"
        if(field.get("type")) {
            console.log(BSDEM.fieldSupertypeMap[field.get("type")].toLowerCase() + "Field");
            return BSDEM.fieldSupertypeMap[field.get("type")].toLowerCase() + "Field";
        }
        // Illegal setup.  This field shouldn't be returned by the computed BSDEM.FormController.fields property.
        return false;
    }
});

BSDEM.FieldController = Ember.Controller.extend({
    editable: true,
    showTypeLine: true,
    showHtmlEditor: false,
    isMultipleOptions: false,
    isSingleCheckbox: false,
    htmlEditorHideable: true,

    previewComponent: Ember.computed('model.type', function(){
        return this.get('model.type') + "-preview";
    }),
    hasTypeOptions: Ember.computed('supertype', function(){
        return countValues(BSDEM.fieldSupertypeMap, this.get('supertype'))>1;
    }),
    typeOptions: Ember.computed('supertype', function(){
        var options = Ember.A();
        for (var fieldType in BSDEM.fieldSupertypeMap) {
            if(BSDEM.fieldSupertypeMap.hasOwnProperty(fieldType)) {
                if(BSDEM.fieldSupertypeMap[fieldType] === this.get('supertype')) {
                    options.push({label: BSDEM.fieldTypeNames[fieldType], value: fieldType});
                }
            }
        }
        return options;
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
            var store = this.store; //that this or this this?
            this.get('model.settings.options').forEach(function(option){
                if(!option.get("name")) {
                    store.deleteRecord(option);
                }
            })
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

