/*global Ext, Y, tests, ui */
tests.unit.ui.layout.add( new Ext.test.Suite( {
                                                 
    name: 'TabsLayout',
	
	
	setUp : function() {
		
	},
	
	
	// --------------------------------
	
	
	items : [
		
		/*
		 * Test normalizeTabIndex()
		 */
		{
			name : "Test normalizeTabIndex()",
			
			"normalizeTabIndex() should return -1 if the container has no components for all arguments" : function() {
				var container = new ui.Container( {
					layout : 'tabs'
				} );
				var layout = container.getLayout();
				
				Y.Assert.areSame( -1, layout.normalizeTabIndex( undefined ), 'given: undefined' );
				Y.Assert.areSame( -1, layout.normalizeTabIndex( null ), 'given: null' );
				Y.Assert.areSame( -1, layout.normalizeTabIndex( 0 ), 'given: 0' );
				Y.Assert.areSame( -1, layout.normalizeTabIndex( 1 ), 'given: 1' );
				Y.Assert.areSame( -1, layout.normalizeTabIndex( "0" ), 'given: "0"' );
				Y.Assert.areSame( -1, layout.normalizeTabIndex( "asdf" ), 'given: "asdf"' );
				Y.Assert.areSame( -1, layout.normalizeTabIndex( new ui.Component() ), 'given: new ui.Component()' );
			},
			
			
			"normalizeTabIndex(), given an integer, should return an integer within range of the number of components in the container" : function() {
				var cmp1 = new ui.Component(), cmp2 = new ui.Component(), cmp3 = new ui.Component(); 
				var container = new ui.Container( {
					layout : 'tabs',
					items : [ cmp1, cmp2, cmp3 ]
				} );
				var layout = container.getLayout();
				
				// Normal cases, getting components within range
				Y.Assert.areSame( 0, layout.normalizeTabIndex( 0 ), "cmp1 should have been retrieved with 0" );
				Y.Assert.areSame( 1, layout.normalizeTabIndex( 1 ), "cmp2 should have been retrieved with 1" );
				Y.Assert.areSame( 2, layout.normalizeTabIndex( 2 ), "cmp3 should have been retrieved with 2" );
				
				// Test out of range
				Y.Assert.areSame( 0, layout.normalizeTabIndex( -1 ), "0 should have been retrieved for -1 argument" );
				Y.Assert.areSame( 2, layout.normalizeTabIndex( 3 ), "2 (the highest) should have been retrieved for 3 argument" );
			},
			
			
			"normalizeTabIndex(), given a string, should return an integer within range of the number of components" : function() {
				var cmp1 = new ui.Component(), cmp2 = new ui.Component(), cmp3 = new ui.Component(); 
				var container = new ui.Container( {
					layout : 'tabs',
					items : [ cmp1, cmp2, cmp3 ]
				} );
				var layout = container.getLayout();
				
				// Normal cases, getting components within range
				Y.Assert.areSame( 0, layout.normalizeTabIndex( "0" ), "cmp1 should have been retrieved with 0" );
				Y.Assert.areSame( 1, layout.normalizeTabIndex( "1" ), "cmp2 should have been retrieved with 1" );
				Y.Assert.areSame( 2, layout.normalizeTabIndex( "2" ), "cmp3 should have been retrieved with 2" );
				
				// Test out of range
				Y.Assert.areSame( 0, layout.normalizeTabIndex( "-1" ), "0 should have been retrieved for '-1' argument" );
				Y.Assert.areSame( 2, layout.normalizeTabIndex( "3" ), "2 (the highest) should have been retrieved for '3' argument" );
			},
			
			"normalizeTabIndex() should return an integer based on a ui.Component instance, but only if it exists within the container" : function() {
				var cmp1 = new ui.Component(), cmp2 = new ui.Component(), cmp3 = new ui.Component(); 
				var cmp4 = new ui.Component();  // won't be added to Container
				var container = new ui.Container( {
					layout : 'tabs',
					items : [ cmp1, cmp2, cmp3 ]
				} );
				var layout = container.getLayout();
				
				Y.Assert.areSame( 0, layout.normalizeTabIndex( cmp1 ), "0 should have been returned with cmp1 as the argument" );
				Y.Assert.areSame( 1, layout.normalizeTabIndex( cmp2 ), "1 should have been returned with cmp2 as the argument" );
				Y.Assert.areSame( 2, layout.normalizeTabIndex( cmp3 ), "2 should have been returned with cmp3 as the argument" );
				Y.Assert.areSame( 0, layout.normalizeTabIndex( cmp4 ), "0 should have been returned with cmp4 as the argument (a Component that doesn't exist within the Container)" );
			}
		},
		
		
		/*
		 * Test activeTab functionality
		 */
		{
			name : "Test activeTab functionality",
			
			
			"The activeTab should be able to be specified as an integer" : function() {
				
			},
			
			"Specifying an out of range integer activeTab argument should correct it to be within range" : function() {
				
			},
			
			
			"The activeTab should be able to be specified as a ui.Component instance (one that exists within the container)" : function() {
				
			},
			
			"Specifying a ui.Component instance that does not exist within the Container should default the activeTab to 0 (the first item)" : function() {
				
			}
		},
		
		
		/*
		 * Test setActiveTab()
		 */
		{
			name : "Test setActiveTab()",
			
			"setActiveTab() should work with both integer and ui.Component arguments, in both unrendered and rendered mode" : function() {
				var cmp1 = new ui.Component(),
				    cmp2 = new ui.Component(),
					cmp3 = new ui.Component();
					
				var container = new ui.Container( {
					layout : 'tabs',
					
					items : [ cmp1, cmp2 ]  // just cmp1 and cmp2, not cmp3
				} );
				
				var layout = container.getLayout();
				Y.Assert.areSame( cmp1, layout.getActiveTab(), "initial condition failed. The active tab should be the first component" );
				
				
				// Run these tests with both the Container unrendered (not laid out), and rendered
				var runSetActiveTabTests = function() {
					// Tests with setting the active tab to a number in an unlaid-out (unrendered) Container
					layout.setActiveTab( 0 );
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab to 0 should have the first component set" );
					layout.setActiveTab( 1 );
					Y.Assert.areSame( cmp2, layout.getActiveTab(), "setting the active tab to 1 should have the second component set" );
					layout.setActiveTab( 0 );
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab back to 0 should have the first component set" );
					
					layout.setActiveTab( 2 );
					Y.Assert.areSame( cmp2, layout.getActiveTab(), "setting the active tab to 2 (out of range) should have the last (the second) component set" );
					
					layout.setActiveTab( 0 );   // first reset back to the 1st component
					layout.setActiveTab( -1 );  // now set to -1
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab to -1 (out of range) should have the first component set" );
					
					
					// Tests with setting the active tab to a component
					layout.setActiveTab( cmp1 );
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab to cmp1 should have the first component set" );
					layout.setActiveTab( cmp2 );
					Y.Assert.areSame( cmp2, layout.getActiveTab(), "setting the active tab to cmp2 should have the second component set" );
					layout.setActiveTab( cmp1 );
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab back to cmp1 should have the first component set" );
					
					layout.setActiveTab( cmp3 );
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab back to cmp3 should have the first component set (cmp3 doesn't exist in the Container)" );
					
					layout.setActiveTab( null );  // now set to null
					Y.Assert.areSame( cmp1, layout.getActiveTab(), "setting the active tab to null should have the first component set" );
				};
				
				// First run the tests on the unrendered Container
				runSetActiveTabTests();
				
				// Now render the Container, and run the tests again
				container.render( document.body );
				runSetActiveTabTests();
				
				container.destroy();  // clean up DOM
			}
		},
		
		
		
		/*
		 * Test getActiveTab()
		 */
		{
			name : "Test getActiveTab()",
			
			"getActiveTab() should work" : function() {
				// Test with no child tabs
				var container = new ui.Container( {
					layout : 'tabs',
					
					items : [
						// no tabs for now
					]
				} );
				
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.isNull( layout.getActiveTab(), "getting the active tab in a container with no children should have returned null." );
				
				
				// Test with one child tab, and activeTab config set to 0
				var cmp = new ui.Component();
				var container = new ui.Container( {
					layout : {
						type : 'tabs',
						activeTab : 0
					},
					
					items : [ cmp ]
				} );
				
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.areSame( cmp, layout.getActiveTab(), "getting the active tab in a container with one child should have returned the component." );
				
				
				// Test with one child tab, and activeTab config set to 1 (which should be the *second* component)
				var cmp = new ui.Component();
				var container = new ui.Container( {
					layout : {
						type : 'tabs',
						activeTab : 1   // the second component, which doesn't exist in the container!
					},
					
					items : [ cmp ]
				} );
				
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.areSame( cmp, layout.getActiveTab(), "getting the active tab in a container with one child, but an activeTab config set to the 2nd child, should have returned the first." );
				
				
				// Test with one child tab, and activeTab config set to the reference of the component
				var cmp = new ui.Component();
				var container = new ui.Container( {
					layout : {
						type : 'tabs',
						activeTab : cmp
					},
					
					items : [ cmp ]
				} );
				
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.areSame( cmp, layout.getActiveTab(), "getting the active tab in a container with one child, with activeTab config set to the component itself, should have returned the component." );
				
			}
		},
		
		
		
		/*
		 * Test getActiveTabIndex()
		 */
		{
			name : "Test getActiveTabIndex()",
			
			"getActiveTabIndex() should work" : function() {
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
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.areSame( -1, layout.getActiveTabIndex(), "getActiveTabIndex() should have returned -1 since the Container has no items" );
				
				
				// Test with one child tab, and an activeTab that is out of bounds of the number of children
				var container = new ui.Container( {
					layout : {
						type : 'tabs',
						activeTab : 1    // out of bounds for the number of children
					},
					
					items : [
						new ui.Component()
					]
				} );
				
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.areSame( 0, layout.getActiveTabIndex(), "getActiveTabIndex() should have returned 0 for the out of bounds original activeTab" );
				
				// render the container, and then check the active tab index
				container.render( document.body );
				Y.Assert.areSame( 0, layout.getActiveTabIndex(), "getActiveTabIndex() should still return 0 for the out of bounds original activeTab config, now that the Container has been rendered (and it's layout run)" ); 
				
				container.destroy();  // clean up DOM
				
				
				// Test with no child tabs, and a component for activeTab
				var container = new ui.Container( {
					layout : {
						type : 'tabs',
						activeTab : new ui.Component()  // just a random component for this config
					},
					
					items : [
						ui.Component  // a different component than the activeTab config
					]
				} );
				
				var layout = container.getLayout();
				Y.Assert.isInstanceOf( ui.layout.TabsLayout, layout, "initial condition failed. Container should have had TabsLayout." );
				Y.Assert.areSame( 0, layout.getActiveTabIndex(), "getActiveTabIndex() should have returned 0 with an activeTab config of a Component that doesn't exist in the Container" );
				
			}
		},
		
		
		
		/*
		 * Test the tabchange event
		 */
		{
			name : "Test the tabchange event",
			
			"" : function() {
				
			}
		}	
	]
	
} ) );