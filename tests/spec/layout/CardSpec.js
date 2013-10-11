/*global define, describe, beforeEach, afterEach, it, expect */
define( [
	'jqg/Component',
	'jqg/Container',
	'jqg/layout/Card'
], function( Component, Container, CardLayout ) {
	
	describe( 'jqg.layout.Card', function() {
		
		describe( "Test setActiveItem()", function() {
			
			it( "setActiveItem() should accept a number, or direct component reference to set the active item", function() {
				var cmp1 = new Component(),
				    cmp2 = new Component(),
					cmp3 = new Component();
					
				var container = new Container( {
					layout : 'card',
					
					items : [ cmp1, cmp2 ]  // just cmp1 and cmp2, not cmp3
				} );
				
				var layout = container.getLayout();
				expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "initial condition failed. the active item should be the first component"
				
				
				// Run these tests with both the Container unrendered (not laid out), and rendered
				var runSetActiveItemTests = function() {
					// Tests with setting the active item to a number in an unlaid-out (unrendered) Container
					layout.setActiveItem( 0 );
					expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active item to 0 should have the first component set"
					layout.setActiveItem( 1 );
					expect( layout.getActiveItem() ).toBe( cmp2 );  // orig YUI Test err msg: "setting the active item to 0 should have the second component set"
					layout.setActiveItem( 0 );
					expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active item back to 0 should have the first component set"
					
					layout.setActiveItem( 2 );
					expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "setting the active item to 2 (out of range) should have no component set (should be null)"
					
					layout.setActiveItem( 0 );   // first reset back to the 1st component
					layout.setActiveItem( -1 );  // now set to -1
					expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "setting the active item to -1 (out of range) should have no component set (should be null)"
					layout.setActiveItem( -1 );  // set to -1 again (to make sure the 'active item' as -1 doesn't throw an error)
					expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "setting the active item to -1 again (out of range) should have no component set (should be null)"
					
					layout.setActiveItem( 0 );   // make sure we can set back to a component
					expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active item back to 0 from a -1 activeItem should have the first component set"
					
					
					// Tests with setting the active item to a component in an unlaid-out (unrendered) Container
					layout.setActiveItem( cmp1 );
					expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active item to cmp1 should have the first component set"
					layout.setActiveItem( cmp2 );
					expect( layout.getActiveItem() ).toBe( cmp2 );  // orig YUI Test err msg: "setting the active item to cmp2 should have the second component set"
					layout.setActiveItem( cmp1 );
					expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active item back to cmp1 should have the first component set"
					
					layout.setActiveItem( cmp3 );
					expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "setting the active item back to cmp3 should have no component set (cmp3 doesn't exist in the Container)"
					
					layout.setActiveItem( cmp1 );  // first reset back to the 1st component
					layout.setActiveItem( null );  // now set to null
					expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "setting the active item to null should have no component set (cmp3 doesn't exist in the Container)"
					layout.setActiveItem( null );  // set to null again (to make sure the 'active item' as a null doesn't throw an error)
					expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "setting the active item to null again should have no component set (cmp3 doesn't exist in the Container)"
					
					layout.setActiveItem( cmp1 );  // make sure we can set back to a component
					expect( layout.getActiveItem() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active item back to cmp1 from a null activeItem should have the first component set"
				};
				
				// First run the tests on the unrendered Container
				runSetActiveItemTests();
				
				// Now render the Container, and run the tests again
				container.render( document.body );
				runSetActiveItemTests();
				
				container.destroy();  // clean up DOM
			} );
			
		} );
		
		
		describe( "Test getActiveItem()", function() {
			
			it( "getActiveItem() should work with no child items", function() {
				var container = new Container( {
					layout : 'card',
					
					items : [
						// no items for now
					]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "getting the active item in a container with no children should have returned null."
				
				container.destroy();  // clean up
			} );
			
			
			it( "getActiveItem() should work with one child item, and the `activeItem` config set to 0", function() {
				var cmp = new Component();
				var container = new Container( {
					layout : {
						type : 'card',
						activeItem : 0
					},
					
					items : [ cmp ]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItem() ).toBe( cmp );  // orig YUI Test err msg: "getting the active item in a container with one child should have returned the component."
				
				container.destroy();  // clean up
			} );
			
			
			it( "getActiveItem() should work with one child item, and the `activeItem` config set to 1 (which should be the *second* component)", function() {
				var cmp = new Component();
				var container = new Container( {
					layout : {
						type : 'card',
						activeItem : 1   // the second component, which doesn't exist in the container!
					},
					
					items : [ cmp ]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItem() ).toBe( null );  // orig YUI Test err msg: "getting the active item in a container with one child, but an activeItem config set to the 2nd child, should have returned null."
				
				container.destroy();  // clean up
			} );
			
			
			it( "getActiveItem() should work with one child item, and the `activeItem` config set to the reference of the component", function() {
				var cmp = new Component();
				var container = new Container( {
					layout : {
						type : 'card',
						activeItem : cmp
					},
					
					items : [ cmp ]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItem() ).toBe( cmp );  // orig YUI Test err msg: "getting the active item in a container with one child, with activeItem config set to the component itself, should have returned the component."
				
				container.destroy();  // clean up
			} );
			
		} );
		
		
		describe( "Test getActiveItemIndex", function() {
			
			it( "getActiveItemIndex() should work with no child items, and a number for the 'activeItem' config", function() {
				var container = new Container( {
					layout : {
						type : 'card',
						activeItem : 0    // this is the default, but testing explicitly
					},
					
					items : [
						// no items for now
					]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItemIndex() ).toBe( 0 );  // orig YUI Test err msg: "getActiveItemIndex() should have returned 0 (the value of its activeItem config) for an unlaid-out Container"
				
				container.destroy();  // clean up
			} );
			
			
			it( "getActiveItemIndex() should work with one child item, and an `activeItem` config that is out of bounds of the number of children", function() {
				var container = new Container( {
					layout : {
						type : 'card',
						activeItem : 1    // out of bounds for the number of children
					},
					
					items : [
						new Component()
					]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItemIndex() ).toBe( 1 );  // orig YUI Test err msg: "getActiveItemIndex() should have returned 1 (the value of its activeItem config) for an unlaid-out Container"
				
				// render the container, and then check the active item index
				container.render( document.body );
				expect( layout.getActiveItemIndex() ).toBe( -1 );  // orig YUI Test err msg: "getActiveItemIndex() should have now returned -1 for the out of bounds original activeItem config, now that the Container has been rendered (and it's layout run)" 
				
				container.destroy();  // clean up DOM
			} );
			
			
			it( "getActiveItemIndex() should work with no child items, and a component for the `activeItem` config", function() {
				var container = new Container( {
					layout : {
						type : 'card',
						activeItem : new Component()  // just a random component for this config
					},
					
					items : [
						// no items for now
					]
				} );
				
				var layout = container.getLayout();
				expect( layout instanceof CardLayout ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had CardsLayout."
				expect( layout.getActiveItemIndex() ).toBe( -1 );  // orig YUI Test err msg: "getActiveItemIndex() should have returned -1 with an activeItem config of a Component that doesn't exist in the Container"
				
				container.destroy();
			} );
			
		} );
		
	} );
	
} );