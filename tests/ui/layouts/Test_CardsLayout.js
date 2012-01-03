Ext.test.Session.addTest( 'ui.layouts', {
                                                 
    name: 'Kevlar.ui.layouts.CardsLayout',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	
	/*
	 * Test ui.layouts.CardsLayout.onLayout()
	 */
	test_onLayout : function() {
		// TODO
		
	},
	
	
	
	/*
	 * Test ui.layouts.CardsLayout.getActiveItem()
	 */
	test_setActiveItem : function() {
		var cmp1 = new ui.Component(),
		    cmp2 = new ui.Component(),
			cmp3 = new ui.Component();
			
		var container = new ui.Container( {
			layout : 'cards',
			
			items : [ cmp1, cmp2 ]  // just cmp1 and cmp2, not cmp3
		} );
		
		var layout = container.getLayout();
		Y.Assert.areSame( cmp1, layout.getActiveItem(), "initial condition failed. the active item should be the first component" );
		
		
		// Run these tests with both the Container unrendered (not laid out), and rendered
		var runSetActiveItemTests = function() {
			// Tests with setting the active item to a number in an unlaid-out (unrendered) Container
			layout.setActiveItem( 0 );
			Y.Assert.areSame( cmp1, layout.getActiveItem(), "setting the active item to 0 should have the first component set" );
			layout.setActiveItem( 1 );
			Y.Assert.areSame( cmp2, layout.getActiveItem(), "setting the active item to 0 should have the second component set" );
			layout.setActiveItem( 0 );
			Y.Assert.areSame( cmp1, layout.getActiveItem(), "setting the active item back to 0 should have the first component set" );
			
			layout.setActiveItem( 2 );
			Y.Assert.isNull( layout.getActiveItem(), "setting the active item to 2 (out of range) should have no component set (should be null)" );
			
			layout.setActiveItem( 0 );   // first reset back to the 1st component
			layout.setActiveItem( -1 );  // now set to -1
			Y.Assert.isNull( layout.getActiveItem(), "setting the active item to -1 (out of range) should have no component set (should be null)" );
			layout.setActiveItem( -1 );  // set to -1 again (to make sure the 'active item' as -1 doesn't throw an error)
			Y.Assert.isNull( layout.getActiveItem(), "setting the active item to -1 again (out of range) should have no component set (should be null)" );
			
			layout.setActiveItem( 0 );   // make sure we can set back to a component
			Y.Assert.areSame( cmp1, layout.getActiveItem(), "setting the active item back to 0 from a -1 activeItem should have the first component set" );
			
			
			// Tests with setting the active item to a component in an unlaid-out (unrendered) Container
			layout.setActiveItem( cmp1 );
			Y.Assert.areSame( cmp1, layout.getActiveItem(), "setting the active item to cmp1 should have the first component set" );
			layout.setActiveItem( cmp2 );
			Y.Assert.areSame( cmp2, layout.getActiveItem(), "setting the active item to cmp2 should have the second component set" );
			layout.setActiveItem( cmp1 );
			Y.Assert.areSame( cmp1, layout.getActiveItem(), "setting the active item back to cmp1 should have the first component set" );
			
			layout.setActiveItem( cmp3 );
			Y.Assert.isNull( layout.getActiveItem(), "setting the active item back to cmp3 should have no component set (cmp3 doesn't exist in the Container)" );
			
			layout.setActiveItem( cmp1 );  // first reset back to the 1st component
			layout.setActiveItem( null );  // now set to null
			Y.Assert.isNull( layout.getActiveItem(), "setting the active item to null should have no component set (cmp3 doesn't exist in the Container)" );
			layout.setActiveItem( null );  // set to null again (to make sure the 'active item' as a null doesn't throw an error)
			Y.Assert.isNull( layout.getActiveItem(), "setting the active item to null again should have no component set (cmp3 doesn't exist in the Container)" );
			
			layout.setActiveItem( cmp1 );  // make sure we can set back to a component
			Y.Assert.areSame( cmp1, layout.getActiveItem(), "setting the active item back to cmp1 from a null activeItem should have the first component set" );
		};
		
		// First run the tests on the unrendered Container
		runSetActiveItemTests();
		
		// Now render the Container, and run the tests again
		container.render( document.body );
		runSetActiveItemTests();
		
		container.destroy();  // clean up DOM
	},
	
	
	
	/*
	 * Test ui.layouts.CardsLayout.getActiveItem()
	 */
	test_getActiveItem : function() {
		// Test with no child items
		var container = new ui.Container( {
			layout : 'cards',
			
			items : [
				// no items for now
			]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.isNull( layout.getActiveItem(), "getting the active item in a container with no children should have returned null." );
		
		
		// Test with one child item, and activeItem config set to 0
		var cmp = new ui.Component();
		var container = new ui.Container( {
			layout : {
				type : 'cards',
				activeItem : 0
			},
			
			items : [ cmp ]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.areSame( cmp, layout.getActiveItem(), "getting the active item in a container with one child should have returned the component." );
		
		
		// Test with one child item, and activeItem config set to 1 (which should be the *second* component)
		var cmp = new ui.Component();
		var container = new ui.Container( {
			layout : {
				type : 'cards',
				activeItem : 1   // the second component, which doesn't exist in the container!
			},
			
			items : [ cmp ]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.isNull( layout.getActiveItem(), "getting the active item in a container with one child, but an activeItem config set to the 2nd child, should have returned null." );
		
		
		// Test with one child item, and activeItem config set to the reference of the component
		var cmp = new ui.Component();
		var container = new ui.Container( {
			layout : {
				type : 'cards',
				activeItem : cmp
			},
			
			items : [ cmp ]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.areSame( cmp, layout.getActiveItem(), "getting the active item in a container with one child, with activeItem config set to the component itself, should have returned the component." );
		
	},
	
	
	
	/*
	 * Test ui.layouts.CardsLayout.getActiveItemIndex()
	 */
	test_getActiveItemIndex : function() {
		// Test with no child items, and a number for activeItem
		var container = new ui.Container( {
			layout : {
				type : 'cards',
				activeItem : 0    // this is the default, but testing explicitly
			},
			
			items : [
				// no items for now
			]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.areSame( 0, layout.getActiveItemIndex(), "getActiveItemIndex() should have returned 0 (the value of its activeItem config) for an unlaid-out Container" );
		
		
		// Test with one child item, and an activeItem that is out of bounds of the number of children
		var container = new ui.Container( {
			layout : {
				type : 'cards',
				activeItem : 1    // out of bounds for the number of children
			},
			
			items : [
				new ui.Component()
			]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.areSame( 1, layout.getActiveItemIndex(), "getActiveItemIndex() should have returned 1 (the value of its activeItem config) for an unlaid-out Container" );
		
		// render the container, and then check the active item index
		container.render( document.body );
		Y.Assert.areSame( -1, layout.getActiveItemIndex(), "getActiveItemIndex() should have now returned -1 for the out of bounds original activeItem config, now that the Container has been rendered (and it's layout run)" ); 
		
		container.destroy();  // clean up DOM
		
		
		// Test with no child items, and a component for activeItem
		var container = new ui.Container( {
			layout : {
				type : 'cards',
				activeItem : new ui.Component()  // just a random component for this config
			},
			
			items : [
				// no items for now
			]
		} );
		
		var layout = container.getLayout();
		Y.Assert.isInstanceOf( ui.layouts.CardsLayout, layout, "initial condition failed. Container should have had CardsLayout." );
		Y.Assert.areSame( -1, layout.getActiveItemIndex(), "getActiveItemIndex() should have returned -1 with an activeItem config of a Component that doesn't exist in the Container" );
		
	}
	
} );