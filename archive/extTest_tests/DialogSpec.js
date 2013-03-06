tests.unit.ui.add( new Ext.test.Case( {
                                                 
    name: 'ui.Dialog',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	
	"Running findById() on the Dialog should find components in its bottom bar Container as well as in its child items (as opposed to only in its child items)" : function() {
		var dialog = new ui.Dialog( {
			buttons : [
				{
					text : "Test",
					id : 'testButton'
				}
			]
		} );
		
		Y.Assert.isNotNull( dialog.findById( 'testButton' ), "The 'testButton' should have been found in the Dialog's bottom bar" );
	}
	
} ) );