Ext.test.Session.addTest( 'ui.formFields', {
                                                 
    name: 'Kevlar.ui.formFields.AbstractField',
	
	
	setUp : function() {
		// An AbstractField with implemented setValue() and getValue() methods used for testing.
		this.TestAbstractField = Kevlar.extend( ui.formFields.AbstractField, {
			setValue : function( val ) { this.value = val; },
			getValue : function() { return this.value; }
		} );
	},
	
	
	// --------------------------------
	
	
	// Initialization tests
	"The 'value' should be undefined if it was not provided" : function() {
		for( var rendered = 0; rendered <= 1; rendered++ ) {
			var field = new this.TestAbstractField( {
				renderTo: ( rendered ) ? document.body : undefined
				// value: "my value"             -- intentionally leaving this here
			} );
			
			Y.Assert.isUndefined( field.getValue(), "the initial value should be undefined. rendered = " + !!rendered );
			
			field.destroy();  // clean up
		}
	}
	
} );