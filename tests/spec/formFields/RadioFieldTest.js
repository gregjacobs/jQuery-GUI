/*global Ext, Y, tests, ui */
tests.unit.ui.formFields.add( new Ext.test.Case( {
                                                 
    name: 'RadioField',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
    
	
	"No initial value should cause the RadioField to have the value of its first option" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var field = new ui.formFields.RadioField( {
				renderTo: ( rendered ) ? document.body : undefined,
				options : [ 
					{ text: "Option 1", value: "value1" }, 
					{ text: "Option 2", value: "value2" }	
				]
			} );
			
			Y.Assert.areSame( "value1", field.getValue(), "The initial value for the field should have been the value of the first option. rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	},
	
	
	"setting a value that does not exist in the RadioField's options should leave the field unchanged" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var field = new ui.formFields.RadioField( {
				renderTo: ( rendered ) ? document.body : undefined,
				options : [ 
					{ text: "Option 1", value: "value1" }, 
					{ text: "Option 2", value: "value2" }	
				],
				value: "value1"
			} );
			
			field.setValue( 'someValue' );
			Y.Assert.areEqual( 'value1', field.getValue(), "value should *not* have been set. rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	},
		
	
	"setting a value that does exist in the RadioField's options should change the field's value" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var field = new ui.formFields.RadioField( {
				renderTo: ( rendered ) ? document.body : undefined,
				options : [ 
					{ text: "Option 1", value: "value1" }, 
					{ text: "Option 2", value: "value2" }	
				],
				value: "value1"
			} );
			
			field.setValue( 'value2' );
			Y.Assert.areEqual( 'value2', field.getValue(), "value should have been set. rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	}
	
} ) );