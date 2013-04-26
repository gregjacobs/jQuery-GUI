/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
/*jshint loopfunc:true */
define( [
	'jqc/panel/Panel',
	'jqc/tab/Panel',
	'jqc/tab/Bar',
	'jqc/tab/Tab'
], function( Panel, TabPanel, TabBar, Tab ) {
	
	describe( 'jqc.tab.Panel', function() {
		var tabBar, tabs, panels;
		
		// Subclass used for testing.
		// Implements factory methods to return spied-upon objects, and also to save references to them for use in some tests
		var TestTabPanel = TabPanel.extend( {
			createTabBar : function() {
				tabBar = this._super( arguments );  // set to variable in test (closure) so we can reference it later in tests
				
				spyOn( tabBar, 'destroy' ).andCallThrough();
				
				return tabBar;
			},
			
			createTab : function( panel ) {
				var tab = this._super( arguments );
				
				tabs.push( tab );  // store the tab so we can reference it later in tests
				return tab;
			}
		} );
		
		
		beforeEach( function() {
			tabBar = undefined;
			tabs = [];
			
			panels = [
				new Panel( { title: "Panel 0" } ),
				new Panel( { title: "Panel 1" } ),
				new Panel( { title: "Panel 2" } )
			];
		} );
		
		
		// -----------------------------------
		
		
		describe( "sanity", function() {
			
			it( "should be able to be instantiated, rendered, and destroyed", function() {
				var tabPanel = new TabPanel();
				
				tabPanel.render( 'body' );
				
				tabPanel.destroy();
			} );
			
		} );
		
		
		describe( "configs", function() {
			
			describe( 'activeTab', function() {
				
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					it( "should be able to specify the active tab by index (number). isRendered = " + !!rendered, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( rendered ) ? 'body' : undefined,
							activeTab: 1,
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
						tabPanel.destroy();  // clean up
					} );
					
					
					it( "should make no tab active when given an index that is out of bounds. isRendered = " + !!rendered, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( rendered ) ? 'body' : undefined,
							activeTab: 99,
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( null );
						
						tabPanel.destroy();  // clean up
					} );
					
					
					it( "should be able to specify the active tab by component (Panel) reference. isRendered = " + !!rendered, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( rendered ) ? 'body' : undefined,
							activeTab: panels[ 2 ],
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( panels[ 2 ] );
						
						tabPanel.destroy();  // clean up
					} );
					
					
					it( "should make no tab active when given a reference to a Panel that does not exist within the TabPanel, or given null. isRendered = " + !!rendered, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( rendered ) ? 'body' : undefined,
							activeTab: new Panel( { title: "Some other panel which doesn't exist in the TabPanel" } ),
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( null );
						
						tabPanel.destroy();  // clean up
					} );
				}
				
			} );
			
			
		} );
		
		
		describe( "events", function() {
			
			describe( "beforetabchange", function() {
				var beforetabchangeFireCount, tabPanel;
				
				beforeEach( function() {
					beforetabchangeFireCount = 0;
					
					tabPanel = new TestTabPanel( {
						activeTab: 0,
						items : panels
					} );
				} );
				
				afterEach( function() {
					tabPanel.destroy();  // clean up
				} );
				
				
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					it( "should fire when the active tab is changed programatically, before the actual tab is changed. isRendered = " + !!rendered, function() {
						if( rendered ) tabPanel.render( 'body' );
						
						tabPanel.on( 'beforetabchange', function( tp, newTab, oldTab ) {
							beforetabchangeFireCount++;
							expect( tp ).toBe( tabPanel );
							expect( newTab ).toBe( panels[ 1 ] );  // the panel we're activating
							expect( oldTab ).toBe( panels[ 0 ] );  // previously active panel
							
							expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // the "active" tab should still be the first panel (as it is a "before" event)
						} );
						
						tabPanel.setActiveTab( panels[ 1 ] );
						expect( beforetabchangeFireCount ).toBe( 1 );  // make sure the event was fired
						expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );  // make sure that the tab change actually took effect
						
						tabPanel.destroy();  // clean up
					} );
					
					it( "should cancel the tab change if a handler returns false. isRendered = " + !!rendered, function() {
						if( rendered ) tabPanel.render( 'body' );
						
						tabPanel.on( 'beforetabchange', function( tp, newTab, oldTab ) {
							beforetabchangeFireCount++;
							return false;  // cancel tab change
						} );
						
						tabPanel.setActiveTab( panels[ 1 ] );
						expect( beforetabchangeFireCount ).toBe( 1 );  // make sure the event was fired
						expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // make sure that the tab change did *not* take effect
						
						tabPanel.destroy();  // clean up
					} );
				}
				
				
				// This test can only be run when the TabPanel is rendered	
				it( "should fire when the active tab is changed by the user, before the actual tab is changed. isRendered = " + !!rendered, function() {
					// Render the TabPanel so that we have elements to simulate clicks on
					tabPanel.render( 'body' );
					
					tabPanel.on( 'beforetabchange', function( tp, newTab, oldTab ) {
						beforetabchangeFireCount++;
						expect( tp ).toBe( tabPanel );
						expect( newTab ).toBe( panels[ 1 ] );  // the panel we're activating
						expect( oldTab ).toBe( panels[ 0 ] );  // previously active panel
						
						expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // the "active" tab should still be the first panel (as it is a "before" event)
					} );
					
					// Simulate a click on the 2nd tab 
					tabs[ 1 ].getEl().trigger( 'click' );
					
					expect( beforetabchangeFireCount ).toBe( 1 );  // make sure the event was fired
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );  // make sure that the tab change actually took effect
						
					tabPanel.destroy();  // clean up
				} );
				
			} );
			
			
			describe( "tabchange", function() {
				var tabchangeFireCount, tabPanel;
				
				beforeEach( function() {
					tabchangeFireCount = 0;
					
					tabPanel = new TestTabPanel( {
						activeTab: 0,
						items : panels
					} );
				} );
				
				afterEach( function() {
					tabPanel.destroy();  // clean up
				} );
				
				
				for( var rendered = 0; rendered <= 1; rendered++ ) {
					it( "should fire when the active tab is changed programatically. isRendered = " + !!rendered, function() {
						if( rendered ) tabPanel.render( 'body' );
						
						tabPanel.on( 'tabchange', function( tp, newTab, oldTab ) {
							tabchangeFireCount++;
							expect( tp ).toBe( tabPanel );
							expect( newTab ).toBe( panels[ 1 ] );  // the panel we're activating
							expect( oldTab ).toBe( panels[ 0 ] );  // previously active panel
							
							expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );  // the "active" tab should be the new panel during this event
						} );
						
						tabPanel.setActiveTab( panels[ 1 ] );
						
						expect( tabchangeFireCount ).toBe( 1 );  // make sure the event was fired
						expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );  // make sure that the tab change actually took effect
						
						tabPanel.destroy();  // clean up
					} );
				}
				
				
				// This test can only be run when the TabPanel is rendered
				it( "should fire when the active tab is changed by the user (by clicking on a Tab)", function() {
					// Render the TabPanel so that we have elements to simulate clicks on
					tabPanel.render( 'body' );
					
					tabPanel.on( 'tabchange', function( tp, newTab, oldTab ) {
						tabchangeFireCount++;
						expect( tp ).toBe( tabPanel );
						expect( newTab ).toBe( panels[ 1 ] );  // the panel we're activating
						expect( oldTab ).toBe( panels[ 0 ] );  // previously active panel
						
						expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );  // the "active" tab should be the new panel during this event
					} );
					
					// Simulate a click on the 2nd tab 
					tabs[ 1 ].getEl().trigger( 'click' );
					
					expect( tabchangeFireCount ).toBe( 1 );  // make sure the event was fired
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );  // make sure that the tab change actually took effect
						
					tabPanel.destroy();  // clean up
				} );
				
			} );
			
		} );
		
		
		describe( 'setActiveTab()', function() {
			
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				it( "should set the active tab by Panel index. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( 1 );
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should make no tab active if given an index that is out of bounds. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( 99 );
					expect( tabPanel.getActiveTab() ).toBe( null );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should set the active tab by Panel reference. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( panels[ 1 ] );
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should make no tab active if given an invalid Panel reference. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( new Panel( { title: "Some other panel which doesn't exist in the TabPanel" } ) );
					expect( tabPanel.getActiveTab() ).toBe( null );
						
					tabPanel.destroy();  // clean up
				} );
			}
		} );
		
		
		describe( 'getActiveTab()', function() {
			
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				it( "should retrieve the active tab when the `activeTab` config is a number. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : 1,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should retrieve the active tab when the `activeTab` config is a Panel reference. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : panels[ 1 ],
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should return `null` when there is no active tab. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : null,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( null );
						
					tabPanel.destroy();  // clean up
				} );
			}
			
		} );
		
		
		describe( 'getActiveTabIndex()', function() {
			
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				it( "should retrieve the active tab index when the `activeTab` config is a number. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : 1,
						items : panels
					} );
					
					expect( tabPanel.getActiveTabIndex() ).toBe( 1 );
							
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should retrieve the active tab index when the `activeTab` config is a Panel reference. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : panels[ 1 ],
						items : panels
					} );
					
					expect( tabPanel.getActiveTabIndex() ).toBe( 1 );
							
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should return -1 when there is no active tab. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined,
						activeTab : null,
						items : panels
					} );
					
					expect( tabPanel.getActiveTabIndex() ).toBe( -1 );
							
					tabPanel.destroy();  // clean up
				} );
			}
			
		} );
		
		
		
		describe( 'onDestroy()', function() {
			
			for( var rendered = 0; rendered <= 1; rendered++ ) {
				it( "should destroy its inner TabBar when the TabPanel destroyed. isRendered = " + !!rendered, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( rendered ) ? 'body' : undefined
					} );
					expect( tabBar.destroy ).not.toHaveBeenCalled();  // initial condition
					
					tabPanel.destroy();
					expect( tabBar.destroy ).toHaveBeenCalled();
				} );
			}
			
		} );
		
	} );

} );