/*global jQuery, Ext, Y, tests, ui */
tests.unit.ui.formFields.add( new Ext.test.Suite( {
                                                 
    name: 'TextAreaField',
	
	
	setUp : function() {
		
	},
	

	// ---------------------------------
	
	
	items : [
		
		/*
		 * Test onRender()
		 */
		{
			name : "Test onRender()"
			
			
			// -------------------------------------
			
			// Tests for the 'height' config, and sizing the <textarea> itself to be at the correct height within the component
			
			// TODO: Add tests for this. There should be a stylesheet of known margins/paddings for the elements inside the
			//       TextAreaField so that tests can be written that check that the size of the <textarea> itself is calculated
			//       correctly.
			
			// TODO: Add tests (and implementations...) for if a top 'label' or the 'help' text is changed, that the textarea itself
			//       is resized.
			
		},
			
	
	
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

} ) );