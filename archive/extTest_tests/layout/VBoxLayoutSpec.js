/*global Ext, Y, JsMockito, jQuery, Class, tests, Jux, ui */
ui.layout.VBoxLayoutTest = Class.extend( ui.layout.LayoutTest, {
	
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
		return new ui.layout.VBoxLayout();
	}
	
} );


tests.unit.ui.layout.add( new Ext.test.Suite( {
	
	name: 'VBoxLayout',
	
	
	items : [
		/*
		 * Test doLayout()
		 */
		new ui.layout.VBoxLayoutTest( {
			name : "Test doLayout()",
			
			
			"doLayout() should properly lay out 2 child components, one regularly sized, and the other flexed" : function() {
				var childComponents = this.createChildComponents( 2 );
				JsMockito.when( this.container ).getItems().thenReturn( childComponents );
				
				var cmp0Height = 20;
				JsMockito.when( childComponents[ 0 ] ).getOuterHeight().thenReturn( cmp0Height );
				childComponents[ 1 ].flex = 1;  // Set the flex config on the 2nd component
				
				var layout = this.layout;
				layout.doLayout();
				
				try {
					// Note: Changed implementation to always use width: 100% to allow the browser to resize the components
					JsMockito.verify( childComponents[ 1 ] ).setSize( /*this.targetWidth*/ '100%', this.targetHeight - cmp0Height );
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			},
			
			
			"doLayout() should properly lay out 4 child components, all flexed" : function() {
				var childComponents = this.createChildComponents( 4 );
				JsMockito.when( this.container ).getItems().thenReturn( childComponents );
				
				// Set the flex configs
				childComponents[ 0 ].flex = 1;  // 1/6 * 200 = 33.33 ~= 33 and .33 remainder
				childComponents[ 1 ].flex = 2;  // 2/6 * 200 = 66.66 ~= 66 and .66 remainder
				childComponents[ 2 ].flex = 1;  // 1/6 * 200 = 33.33 ~= 33 and .33 remainder
				childComponents[ 3 ].flex = 2;  // 2/6 * 200 = 66.66 ~= 66 and .66 remainder
				                                // Remainder pixel = Math.floor( 1.98 ) = 1 total pixel trimmed from other components, which will be added to the last component
				
				var layout = this.layout;
				layout.doLayout();
				
				try {
					// Note: Changed implementation to always use width: 100% to allow the browser to resize the components
					JsMockito.verify( childComponents[ 0 ] ).setSize( /*this.targetWidth*/ '100%', Math.floor( 1/6 * this.targetHeight ) );
					JsMockito.verify( childComponents[ 1 ] ).setSize( /*this.targetWidth*/ '100%', Math.floor( 2/6 * this.targetHeight ) );
					JsMockito.verify( childComponents[ 2 ] ).setSize( /*this.targetWidth*/ '100%', Math.floor( 1/6 * this.targetHeight ) );
					JsMockito.verify( childComponents[ 3 ] ).setSize( /*this.targetWidth*/ '100%', Math.floor( 2/6 * this.targetHeight ) + 1 );  // the + 1 is the floored sum of the trimmed off decimal remainders from flexing other components
				} catch( e ) {
					Y.Assert.fail( typeof e === 'string' ? e : e.message );
				}
			}
			
		} )
	]
	
} ) );