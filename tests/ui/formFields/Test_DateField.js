Ext.test.Session.addTest( 'ui.formFields', {
                                                 
    name: 'Kevlar.ui.formFields.DateField',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
    
	"The emptyText value of the field should accept the string 'now', which should set it to the current date" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			// Test initializing the value to the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
			var field = new ui.formFields.DateField( { 
				renderTo: ( rendered ) ? document.body : undefined,
				emptyText : 'now'
			} );
			
			Y.Assert.areSame( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ), field.getEmptyText(), "rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	},
	
	
	"The emptyText value of the field should accept the string 'now' when set using setEmptyText(), which should set it to the current date" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			// Test initializing the value to the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
			var field = new ui.formFields.DateField( { 
				renderTo: ( rendered ) ? document.body : undefined
			} );
			
			field.setEmptyText( "now" );
			Y.Assert.areSame( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ), field.getEmptyText(), "rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	},
	
	
	"The initial value of the field should accept the string 'now', which should set it to the current date" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			// Test initializing the value to the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
			var field = new ui.formFields.DateField( { 
				renderTo: ( rendered ) ? document.body : undefined,
				value : 'now'
			} );
			
			Y.Assert.areSame( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ), field.getValue(), "The field should have had its value set to the current date in mm/dd/yyyy format when set to the special string 'now'. rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	},
	
    
	"setValue() should accept the special string 'now', which should set it to the current date" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			// Test setting the special value "now", which should be replaced by the current date in mm/dd/yyyy format.
			var field = new ui.formFields.DateField( {
				renderTo: ( rendered ) ? document.body : undefined
			} );
			
			field.setValue( "now" );
			Y.Assert.areSame( jQuery.datepicker.formatDate( 'mm/dd/yy', new Date() ), field.getValue(), "The field should have had its value set to the current date in mm/dd/yyyy format when set to the special string 'now'. rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	}
	
} );