/*global ui, _, describe, beforeEach, afterEach, it, expect */
describe( "unit.ui.layout.TabsLayout", function() {
	
	describe( "Test normalizeTabIndex()", function() {
		
		it( "normalizeTabIndex() should return -1 if the container has no components for all arguments", function() {
			var container = new ui.Container( {
				layout : 'tabs'
			} );
			var layout = container.getLayout();
			
			expect( layout.normalizeTabIndex( undefined ) ).toBe( -1 );  // orig YUI Test err msg: 'given: undefined'
			expect( layout.normalizeTabIndex( null ) ).toBe( -1 );  // orig YUI Test err msg: 'given: null'
			expect( layout.normalizeTabIndex( 0 ) ).toBe( -1 );  // orig YUI Test err msg: 'given: 0'
			expect( layout.normalizeTabIndex( 1 ) ).toBe( -1 );  // orig YUI Test err msg: 'given: 1'
			expect( layout.normalizeTabIndex( "0" ) ).toBe( -1 );  // orig YUI Test err msg: 'given: "0"'
			expect( layout.normalizeTabIndex( "asdf" ) ).toBe( -1 );  // orig YUI Test err msg: 'given: "asdf"'
			expect( layout.normalizeTabIndex( new ui.Component() ) ).toBe( -1 );  // orig YUI Test err msg: 'given: new ui.Component()'
		} );
		
		
		it( "normalizeTabIndex(), given an integer, should return an integer within range of the number of components in the container", function() {
			var cmp1 = new ui.Component(), cmp2 = new ui.Component(), cmp3 = new ui.Component(); 
			var container = new ui.Container( {
				layout : 'tabs',
				items : [ cmp1, cmp2, cmp3 ]
			} );
			var layout = container.getLayout();
			
			// Normal cases, getting components within range
			expect( layout.normalizeTabIndex( 0 ) ).toBe( 0 );  // orig YUI Test err msg: "cmp1 should have been retrieved with 0"
			expect( layout.normalizeTabIndex( 1 ) ).toBe( 1 );  // orig YUI Test err msg: "cmp2 should have been retrieved with 1"
			expect( layout.normalizeTabIndex( 2 ) ).toBe( 2 );  // orig YUI Test err msg: "cmp3 should have been retrieved with 2"
			
			// Test out of range
			expect( layout.normalizeTabIndex( -1 ) ).toBe( 0 );  // orig YUI Test err msg: "0 should have been retrieved for -1 argument"
			expect( layout.normalizeTabIndex( 3 ) ).toBe( 2 );  // orig YUI Test err msg: "2 (the highest) should have been retrieved for 3 argument"
		} );
		
		
		it( "normalizeTabIndex(), given a string, should return an integer within range of the number of components", function() {
			var cmp1 = new ui.Component(), cmp2 = new ui.Component(), cmp3 = new ui.Component(); 
			var container = new ui.Container( {
				layout : 'tabs',
				items : [ cmp1, cmp2, cmp3 ]
			} );
			var layout = container.getLayout();
			
			// Normal cases, getting components within range
			expect( layout.normalizeTabIndex( "0" ) ).toBe( 0 );  // orig YUI Test err msg: "cmp1 should have been retrieved with 0"
			expect( layout.normalizeTabIndex( "1" ) ).toBe( 1 );  // orig YUI Test err msg: "cmp2 should have been retrieved with 1"
			expect( layout.normalizeTabIndex( "2" ) ).toBe( 2 );  // orig YUI Test err msg: "cmp3 should have been retrieved with 2"
			
			// Test out of range
			expect( layout.normalizeTabIndex( "-1" ) ).toBe( 0 );  // orig YUI Test err msg: "0 should have been retrieved for '-1' argument"
			expect( layout.normalizeTabIndex( "3" ) ).toBe( 2 );  // orig YUI Test err msg: "2 (the highest) should have been retrieved for '3' argument"
		} );
		
		
		it( "normalizeTabIndex() should return an integer based on a ui.Component instance, but only if it exists within the container", function() {
			var cmp1 = new ui.Component(), cmp2 = new ui.Component(), cmp3 = new ui.Component(); 
			var cmp4 = new ui.Component();  // won't be added to Container
			var container = new ui.Container( {
				layout : 'tabs',
				items : [ cmp1, cmp2, cmp3 ]
			} );
			var layout = container.getLayout();
			
			expect( layout.normalizeTabIndex( cmp1 ) ).toBe( 0 );  // orig YUI Test err msg: "0 should have been returned with cmp1 as the argument"
			expect( layout.normalizeTabIndex( cmp2 ) ).toBe( 1 );  // orig YUI Test err msg: "1 should have been returned with cmp2 as the argument"
			expect( layout.normalizeTabIndex( cmp3 ) ).toBe( 2 );  // orig YUI Test err msg: "2 should have been returned with cmp3 as the argument"
			expect( layout.normalizeTabIndex( cmp4 ) ).toBe( 0 );  // orig YUI Test err msg: "0 should have been returned with cmp4 as the argument (a Component that doesn't exist within the Container)"
		} );
		
	} );
	
	
	describe( "Test activeTab functionality", function() {
		
		it( "The activeTab should be able to be specified as an integer", function() {
			
		} );
		
		
		it( "Specifying an out of range integer activeTab argument should correct it to be within range", function() {
			
		} );
		
		
		it( "The activeTab should be able to be specified as a ui.Component instance (one that exists within the container)", function() {
			
		} );
		
		
		it( "Specifying a ui.Component instance that does not exist within the Container should default the activeTab to 0 (the first item)", function() {
			
		} );
		
	} );
	
	
	describe( "Test setActiveTab()", function() {
		
		it( "setActiveTab() should work with both integer and ui.Component arguments, in both unrendered and rendered mode", function() {
			var cmp1 = new ui.Component(),
			    cmp2 = new ui.Component(),
				cmp3 = new ui.Component();
				
			var container = new ui.Container( {
				layout : 'tabs',
				
				items : [ cmp1, cmp2 ]  // just cmp1 and cmp2, not cmp3
			} );
			
			var layout = container.getLayout();
			expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "initial condition failed. The active tab should be the first component"
			
			
			// Run these tests with both the Container unrendered (not laid out), and rendered
			var runSetActiveTabTests = function() {
				// Tests with setting the active tab to a number in an unlaid-out (unrendered) Container
				layout.setActiveTab( 0 );
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab to 0 should have the first component set"
				layout.setActiveTab( 1 );
				expect( layout.getActiveTab() ).toBe( cmp2 );  // orig YUI Test err msg: "setting the active tab to 1 should have the second component set"
				layout.setActiveTab( 0 );
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab back to 0 should have the first component set"
				
				layout.setActiveTab( 2 );
				expect( layout.getActiveTab() ).toBe( cmp2 );  // orig YUI Test err msg: "setting the active tab to 2 (out of range) should have the last (the second) component set"
				
				layout.setActiveTab( 0 );   // first reset back to the 1st component
				layout.setActiveTab( -1 );  // now set to -1
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab to -1 (out of range) should have the first component set"
				
				
				// Tests with setting the active tab to a component
				layout.setActiveTab( cmp1 );
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab to cmp1 should have the first component set"
				layout.setActiveTab( cmp2 );
				expect( layout.getActiveTab() ).toBe( cmp2 );  // orig YUI Test err msg: "setting the active tab to cmp2 should have the second component set"
				layout.setActiveTab( cmp1 );
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab back to cmp1 should have the first component set"
				
				layout.setActiveTab( cmp3 );
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab back to cmp3 should have the first component set (cmp3 doesn't exist in the Container)"
				
				layout.setActiveTab( null );  // now set to null
				expect( layout.getActiveTab() ).toBe( cmp1 );  // orig YUI Test err msg: "setting the active tab to null should have the first component set"
			};
			
			// First run the tests on the unrendered Container
			runSetActiveTabTests();
			
			// Now render the Container, and run the tests again
			container.render( document.body );
			runSetActiveTabTests();
			
			container.destroy();  // clean up DOM
		} );
		
	} );
	
	
	describe( "Test getActiveTab()", function() {
		
		it( "getActiveTab() should work", function() {
			// Test with no child tabs
			var container = new ui.Container( {
				layout : 'tabs',
				
				items : [
					// no tabs for now
				]
			} );
			
			var layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTab() ).toBe( null );  // orig YUI Test err msg: "getting the active tab in a container with no children should have returned null."
			
			
			// Test with one child tab, and activeTab config set to 0
			var cmp = new ui.Component();
			container = new ui.Container( {
				layout : {
					type : 'tabs',
					activeTab : 0
				},
				
				items : [ cmp ]
			} );
			
			layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTab() ).toBe( cmp );  // orig YUI Test err msg: "getting the active tab in a container with one child should have returned the component."
			
			
			// Test with one child tab, and activeTab config set to 1 (which should be the *second* component)
			cmp = new ui.Component();
			container = new ui.Container( {
				layout : {
					type : 'tabs',
					activeTab : 1   // the second component, which doesn't exist in the container!
				},
				
				items : [ cmp ]
			} );
			
			layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTab() ).toBe( cmp );  // orig YUI Test err msg: "getting the active tab in a container with one child, but an activeTab config set to the 2nd child, should have returned the first."
			
			
			// Test with one child tab, and activeTab config set to the reference of the component
			cmp = new ui.Component();
			container = new ui.Container( {
				layout : {
					type : 'tabs',
					activeTab : cmp
				},
				
				items : [ cmp ]
			} );
			
			layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTab() ).toBe( cmp );  // orig YUI Test err msg: "getting the active tab in a container with one child, with activeTab config set to the component itself, should have returned the component."
		} );
		
	} );
	
	
	describe( "Test getActiveTabIndex()", function() {
		
		it( "getActiveTabIndex() should work", function() {
			// Test with no child tabs, and a number for activeTab
			var container = new ui.Container( {
				layout : {
					type : 'tabs',
					activeTab : 0    // this is the default, but testing explicitly
				},
				
				items : [
					// no tabs for now
				]
			} );
			
			var layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTabIndex() ).toBe( -1 );  // orig YUI Test err msg: "getActiveTabIndex() should have returned -1 since the Container has no items"
			
			
			// Test with one child tab, and an activeTab that is out of bounds of the number of children
			container = new ui.Container( {
				layout : {
					type : 'tabs',
					activeTab : 1    // out of bounds for the number of children
				},
				
				items : [
					new ui.Component()
				]
			} );
			
			layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTabIndex() ).toBe( 0 );  // orig YUI Test err msg: "getActiveTabIndex() should have returned 0 for the out of bounds original activeTab"
			
			// render the container, and then check the active tab index
			container.render( document.body );
			expect( layout.getActiveTabIndex() ).toBe( 0 );  // orig YUI Test err msg: "getActiveTabIndex() should still return 0 for the out of bounds original activeTab config, now that the Container has been rendered (and it's layout run)" 
			
			container.destroy();  // clean up DOM
			
			
			// Test with no child tabs, and a component for activeTab
			container = new ui.Container( {
				layout : {
					type : 'tabs',
					activeTab : new ui.Component()  // just a random component for this config
				},
				
				items : [
					ui.Component  // a different component than the activeTab config
				]
			} );
			
			layout = container.getLayout();
			expect( layout instanceof ui.layout.Tab ).toBe( true );  // orig YUI Test err msg: "initial condition failed. Container should have had TabsLayout."
			expect( layout.getActiveTabIndex() ).toBe( 0 );  // orig YUI Test err msg: "getActiveTabIndex() should have returned 0 with an activeTab config of a Component that doesn't exist in the Container"
		} );
		
	} );
	
} );