function countValues(from_object, counted_value) {
    return Object.values(from_object).filter( function(val){ return val == counted_value; }).length;
}

function arrayFlip( trans ) {
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

BSDEM.Router.reopen({
    rootURL: '/test_scripts/formbuilder/'
});

BSDEM.FormRoute = Ember.Route.extend({
    queryParams:["formId"],
    formId: null,
    model: function () {
        console.log(this.get("formId"));
        return this.store.find('app-form',1);
    },
    renderTemplate: function() {
        this.render({ outlet: 'form' });
    }
});

/* Models */
var attr = DS.attr;
var model = DS.Model;

BSDEM.AppForm = model.extend({
    app_form_fields: DS.hasMany('AppFormField', {embedded:'always', async:true}),
    name: attr("string")
});

BSDEM.AppFormField = model.extend({
    app_form_id: DS.belongsTo('AppForm'),
    display_order: attr("number"),
    type: attr("string"),
    is_new: attr("boolean", {defaultValue: true}),
    label: attr("string"),
    name: attr("string"),
    isRequired: attr("boolean"),
    valueIfBlank: attr("string"),
    valueIfChecked: attr("string"),
    valueIfUnchecked: attr("string"),
    default: attr("string"),
    staticHtml: attr("string"),
    options: DS.hasMany('AppFormFieldFieldOption', {embedded:'always', async:true}), //["value", "value", "value"]
    isIncludedOnTaxReciept: attr("boolean"),
    validationRule: attr("string")
});

BSDEM.AppFormFieldFieldOption = model.extend({
    name: attr("string"),
    default: attr("boolean"),
    looksDefault: Ember.computed.oneWay("default")
});

BSDEM.AppFormSerializer = DS.RESTSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        app_form_fields: {embedded: 'always'}
    }
});

BSDEM.AppFormFieldSerializer = DS.ActiveModelSerializer.extend(DS.EmbeddedRecordsMixin, {
    attrs: {
        options: {embedded: 'always'}
    }
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

BSDEM.AppFormField.reopenClass({
    FIXTURES:[
        {
            id: 1,
            app_form_id: 1,
            display_order: 1,
            type: "radio",
            is_new: true,
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
            id: 2,
            app_form_id: 1,
            display_order: 2,
            type: "textarea",
            is_new: true,
            label: "wat",
            name: "wat2",
            isRequired: false,
            valueIfBlank: "thing",
            valueIfChecked: "thing",
            valueIfUnchecked: "thing",
            default: "thing",
            options: Ember.A(),
            isIncludedOnTaxReciept: false

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
   data name that corresponds to the widget (ie, textarea, radio, checkbox, etc), and "field supertype"
   which groups these types into logical categories that share an admin panel.  To make it obvious
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

    queryParams:["formId"],
    formId: null,

    supertypeOptions: Ember.computed(function(){
        var options = Ember.A();
        for (var fieldSupertype in BSDEM.fieldSupertypeNames) {
            if(BSDEM.fieldSupertypeNames.hasOwnProperty(fieldSupertype)) {
                options.push({label: BSDEM.fieldSupertypeNames[fieldSupertype], value: fieldSupertype});
            }
        }
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
            console.log(this.get("formId"));
            1 && console.log(JSON.stringify(this.store.all('app-form').get('content.0').serialize()));
        },
        addField: function () {
            this.get('model.app_form_fields').pushObject(
                this.store.createRecord('AppFormField',
                    {
                        type: arrayFlip(BSDEM.fieldSupertypeMap)[this.get('selectedSupertype')]
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
            return BSDEM.fieldSupertypeMap[field.get("type")].toLowerCase() + "Field";
        }
        // Illegal setup.  This field shouldn't be returned by the computed BSDEM.FormController.fields property.
        return false;
    }
});

BSDEM.FieldController = Ember.Controller.extend({
    editable: true,
    deleted: false,
    showTypeLine: true,
    showHtmlEditor: false,
    isMultipleOptions: false,
    isSingleCheckbox: false,
    htmlEditorHideable: true,
    showValidationOptions: false,

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
            this.get('model.options').forEach(function(option){
                if(!option || !option.get("name")) {
                    store.deleteRecord(option);
                }
            })
        },
        addOption: function(){
            this.get('model.options').pushObject(
                this.store.createRecord('AppFormFieldFieldOption',{name:""})
            );
        },
        showHideHtmlEditor: function () {
            this.set('showHtmlEditor', !this.get('showHtmlEditor'));
        },
        delete: function () {
            this.set('deleted', true);
        },
        undelete: function () {
            this.set('deleted', false);
        }
    }


});

BSDEM.TextFieldController = BSDEM.FieldController.extend({
    showValidationOptions: true,
    validationOptions: Ember.A([
        {label: "Anything", value: "isAllChars"},
        {label: "Numbers Only (no decimals)", value: "isInteger"},
        {label: "Numbers Only (decimals allowed)", value: "isDecimal"},
        {label: "Letters Only", value: "isLetterOnly"},
        {label: "Letters/Numbers Only (no spaces)", value: "isAlphaNumeric"},
        {label: "Valid Email Address", value: "isEmail"}
    ])
});

BSDEM.MultipleFieldController = BSDEM.FieldController.extend({
    isMultipleOptions: true,
    singleDefault: Ember.computed('model.type', function() {
        return this.get("model.type") != "multi_checkbox";
    }),
    actions: {
        // Uncheck everything else when a user sets a default to a non-multi-checbox option.
        checked: function (checked_item) {
            var that = this;
            this.get('model.options').forEach(function (option) {
                if (option && option.get("id") != checked_item && that.get("singleDefault")) {
                    option.set("default", false);
                }
            })
        }
    }
});

BSDEM.CheckboxFieldController = BSDEM.FieldController.extend({
    isSingleCheckbox: true
});

BSDEM.StaticFieldController = BSDEM.FieldController.extend({
    htmlEditorHideable: false,
    showHtmlEditor: true
});


BSDEM.OptionsController = Ember.ArrayController.extend({
    lookupItemController: function(option) {
        return "option";
    }
});

BSDEM.OptionController = Ember.Controller.extend({
    needs: ['options', 'field'],
    options: Ember.computed.alias('controllers.options'),
    field: Ember.computed.alias('controllers.field'),

    defaultChanged: Ember.observer('model.default', function() {
        if(this.get("model.default")) {
            this.send('checked', this.get("model.id"));
        }
    })

});

/* Views */

