/*global jQuery, Ext, Y, ui */
Ext.test.Session.addSuite( 'ui.formFields', {
                                                 
    name: 'Kevlar.ui.formFields.TextAreaField',
	
	
	setUp : function() {
		
	},
	

	// ---------------------------------
	
	
	items : [
	
		/*
		 * Test destroy() 
		 */
		{
			name : "Test destroy()",
			
			
			"destroy() should remove the $autoGrowTwinDiv element" : function() {
				var textAreaField = new ui.formFields.TextAreaField( {
					renderTo: document.body,
					value : "test value",
					autoGrow : true
				} );
				
				var $autoGrowTwinDiv = textAreaField.$autoGrowTwinDiv;
				Y.Assert.areSame( 1, jQuery( 'body' ).has( $autoGrowTwinDiv ).length, "initial condition: the element should be in the DOM" );
				
				textAreaField.destroy();
				Y.Assert.areSame( 0, jQuery( 'body' ).has( $autoGrowTwinDiv ).length, "the element should no longer be in the DOM" );
			},
			
			
			
			"calling destroy() should not error on an unrendered TextAreaField" : function() {
				var textAreaField = new ui.formFields.TextAreaField();
				textAreaField.destroy();
				
				// Test should not error
			},
			
			
			"calling destroy() should not error on an unrendered TextAreaField, with autogrow set to true" : function() {
				var textAreaField = new ui.formFields.TextAreaField( {
					autoGrow: true
				} );
				textAreaField.destroy();
				
				// Test should not error
			}
		}
		
	]

} );