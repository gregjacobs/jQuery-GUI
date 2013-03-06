/*global Ext, Y, JsMockito, jQuery, Class, tests, Jux, ui */
ui.layout.AccordionLayoutTest = Class.extend( ui.layout.LayoutTest, {
	
	
	setUp : function() {
		this._super( arguments );
		
		
	},
	
	
	/**
	 * Creates the appropriate layout for the test subclass.
	 * 
	 * This method must be overridden in each TestCase subclass.
	 * 
	 * @method createLayout
	 * @return {ui.layout.FitLayout}
	 */
	createLayout : function() {
		return new ui.layout.AccordionLayout();
	}
	
} );


tests.unit.ui.layout.add( new Ext.test.Suite( {
	
	name: 'FitLayout',
	
	
	items : [
		/*
		 * Test doLayout()
		 */
		new ui.layout.AccordionLayoutTest( {
			name : "Test doLayout()",
			
			
			
			
		} )
	]

} ) );