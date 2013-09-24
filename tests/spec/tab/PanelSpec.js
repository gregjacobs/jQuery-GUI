/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
/*jshint loopfunc:true */
define( [
	'jqGui/Component',
	'jqGui/panel/Panel',
	'jqGui/tab/Panel',
	'jqGui/tab/Bar',
	'jqGui/tab/Tab'
], function( Component, Panel, TabPanel, TabBar, Tab ) {
	
	describe( 'jqGui.tab.Panel', function() {
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
				
				for( var render = 0; render <= 1; render++ ) {
					it( "should be able to specify the active tab by index (number). isRendered = " + !!render, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( render ) ? 'body' : undefined,
							activeTab: 1,
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
						tabPanel.destroy();  // clean up
					} );
					
					
					it( "should make no tab active when given an index that is out of bounds. isRendered = " + !!render, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( render ) ? 'body' : undefined,
							activeTab: 99,
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( null );
						
						tabPanel.destroy();  // clean up
					} );
					
					
					it( "should be able to specify the active tab by component (Panel) reference. isRendered = " + !!render, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( render ) ? 'body' : undefined,
							activeTab: panels[ 2 ],
							items : panels
						} );
						
						expect( tabPanel.getActiveTab() ).toBe( panels[ 2 ] );
						
						tabPanel.destroy();  // clean up
					} );
					
					
					it( "should make no tab active when given a reference to a Panel that does not exist within the TabPanel, or given null. isRendered = " + !!render, function() {
						var tabPanel = new TestTabPanel( {
							renderTo : ( render ) ? 'body' : undefined,
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
				
				
				for( var render = 0; render <= 1; render++ ) {
					it( "should fire when the active tab is changed programatically, before the actual tab is changed. isRendered = " + !!render, function() {
						if( render ) tabPanel.render( 'body' );
						
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
					} );
					
					it( "should cancel the tab change if a handler returns false. isRendered = " + !!render, function() {
						if( render ) tabPanel.render( 'body' );
						
						tabPanel.on( 'beforetabchange', function( tp, newTab, oldTab ) {
							beforetabchangeFireCount++;
							return false;  // cancel tab change
						} );
						
						tabPanel.setActiveTab( panels[ 1 ] );
						expect( beforetabchangeFireCount ).toBe( 1 );  // make sure the event was fired
						expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // make sure that the tab change did *not* take effect
					} );
				}
				
				
				// This test can only be run when the TabPanel is render	
				it( "should fire when the active tab is changed by the user, before the actual tab is changed. isRendered = " + !!render, function() {
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
				
				
				for( var render = 0; render <= 1; render++ ) {
					it( "should fire when the active tab is changed programatically. isRendered = " + !!render, function() {
						if( render ) tabPanel.render( 'body' );
						
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
					} );
				}
				
				
				// This test can only be run when the TabPanel is render
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
				} );
				
			} );
			
		} );
		
		
		describe( 'onAdd()', function() {
			var tabPanel;
				
			beforeEach( function() {
				tabPanel = new TestTabPanel( {
					activeTab: 0
				} );
			} );
			
			afterEach( function() {
				tabPanel.destroy();  // clean up
			} );
			
			
			for( var render = 0; render <= 1; render++ ) {
				it( "should add a corresponding Tab in the TabBar for the Panel that was added, at the correct index of the insertion. isRendered = " + !!render, function() {
					if( render ) tabPanel.render( 'body' );
					
					expect( tabBar.getItems().length ).toBe( 0 );  // initial condition
					
					tabPanel.add( panels[ 0 ] );
					expect( tabBar.getItems().length ).toBe( 1 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					
					tabPanel.insert( panels[ 1 ], 0 );  // prepend it
					expect( tabBar.getItems().length ).toBe( 2 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 1 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					
					tabPanel.add( panels[ 2 ] );
					expect( tabBar.getItems().length ).toBe( 3 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 1 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					expect( tabBar.getItems()[ 2 ].getCorrespondingPanel() ).toBe( panels[ 2 ] );
				} );
				
				
				it( "should add the 'childPanelCls' to the added child Panels, which signify that they are direct children of a TabPanel. isRendered = " + !!render, function() {
					if( render ) tabPanel.render( 'body' );
					
					var childPanelCls = tabPanel.childPanelCls;
					expect( childPanelCls ).not.toBeFalsy();  // make sure this exists. If it doesn't, the cfg name might have been changed.

					expect( panels[ 0 ].hasCls( childPanelCls ) ).toBe( false );                // initial condition
					expect( panels[ 0 ].hasBodyCls( childPanelCls + '-body' ) ).toBe( false );  // initial condition
					
					tabPanel.add( panels[ 0 ] );
					expect( panels[ 0 ].hasCls( childPanelCls ) ).toBe( true );
					expect( panels[ 0 ].hasBodyCls( childPanelCls + '-body' ) ).toBe( true );
				} );
				
				
				
				it( "should throw an Error if a non-Panel instance or Panel subclass was added to the TabPanel. isRendered = " + !!render, function() {
					if( render ) tabPanel.render( 'body' );
					
					expect( function() {
						tabPanel.add( { type: 'component' } );  // test with config object
					} ).toThrow( "A Component added to the Container was not of the correct class type ('acceptType' config)" );
					
					expect( function() {
						tabPanel.add( new Component() );        // test with instance
					} ).toThrow( "A Component added to the Container was not of the correct class type ('acceptType' config)" );
				} );
			}
			
		} );
		
		
		describe( 'onRemove()', function() {
			var tabPanel;
				
			beforeEach( function() {
				tabPanel = new TestTabPanel( {
					activeTab: 0,
					items : panels
				} );
			} );
			
			afterEach( function() {
				tabPanel.destroy();  // clean up
			} );
			
			
			for( var render = 0; render <= 1; render++ ) {
				
				it( "should remove the corresponding Tab in the TabBar for the Panel that was removed, from the correct index of the removal. isRendered = " + !!render, function() {
					if( render ) tabPanel.render( 'body' );
					
					// Check initial condition
					expect( tabBar.getItems().length ).toBe( 3 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 1 ] );
					expect( tabBar.getItems()[ 2 ].getCorrespondingPanel() ).toBe( panels[ 2 ] );
					
					// Now remove
					tabPanel.remove( panels[ 1 ] );
					expect( tabBar.getItems().length ).toBe( 2 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 2 ] );
					
					tabPanel.remove( panels[ 2 ] );
					expect( tabBar.getItems().length ).toBe( 1 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					
					tabPanel.remove( panels[ 0 ] );
					expect( tabBar.getItems().length ).toBe( 0 );					
				} );
				
				
				it( "should remove the 'childPanelCls' to the removed child Panels, which were added to signify that they were direct children of a TabPanel. isRendered = " + !!render, function() {
					if( render ) tabPanel.render( 'body' );
					
					var childPanelCls = tabPanel.childPanelCls;
					expect( childPanelCls ).not.toBeFalsy();  // make sure this exists. If it doesn't, the cfg name might have been changed.

					tabPanel.add( panels[ 0 ] );
					expect( panels[ 0 ].hasCls( childPanelCls ) ).toBe( true );                // initial condition
					expect( panels[ 0 ].hasBodyCls( childPanelCls + '-body' ) ).toBe( true );  // initial condition
					
					tabPanel.remove( panels[ 0 ], /* destroyRemoved */ false );  // don't destroy the Panel upon removal, as we need to check its elements' CSS classes
					expect( panels[ 0 ].hasCls( childPanelCls ) ).toBe( false );
					expect( panels[ 0 ].hasBodyCls( childPanelCls + '-body' ) ).toBe( false );
				} );
				
			}
			
		} );
		
		
		describe( 'onReorder()', function() {
			var tabPanel;
				
			beforeEach( function() {
				tabPanel = new TestTabPanel( {
					activeTab: 0,
					items : panels
				} );
			} );
			
			afterEach( function() {
				tabPanel.destroy();  // clean up
			} );
			
			for( var render = 0; render <= 1; render++ ) {
				
				it( "should move the coresponding Tab in the TabBar for the Panel that was reordered, to the correct new index. isRendered = " + !!render, function() {
					if( render ) tabPanel.render( 'body' );
					
					// Check initial condition
					expect( tabBar.getItems().length ).toBe( 3 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 1 ] );
					expect( tabBar.getItems()[ 2 ].getCorrespondingPanel() ).toBe( panels[ 2 ] );
					
					// Now reorder
					tabPanel.insert( panels[ 0 ], 2 );
					expect( tabBar.getItems().length ).toBe( 3 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 1 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 2 ] );
					expect( tabBar.getItems()[ 2 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
					
					tabPanel.insert( panels[ 2 ], 0 );
					expect( tabBar.getItems().length ).toBe( 3 );
					expect( tabBar.getItems()[ 0 ].getCorrespondingPanel() ).toBe( panels[ 2 ] );
					expect( tabBar.getItems()[ 1 ].getCorrespondingPanel() ).toBe( panels[ 1 ] );
					expect( tabBar.getItems()[ 2 ].getCorrespondingPanel() ).toBe( panels[ 0 ] );
				} );
				
			}
			
		} );
		
		
		describe( 'setActiveTab()', function() {
			
			for( var render = 0; render <= 1; render++ ) {
				it( "should set the active tab by Panel index. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( 1 );
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should make no tab active if given an index that is out of bounds. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( 99 );
					expect( tabPanel.getActiveTab() ).toBe( null );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should set the active tab by Panel reference. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : 0,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 0 ] );  // initial condition
					
					tabPanel.setActiveTab( panels[ 1 ] );
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should make no tab active if given an invalid Panel reference. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
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
			
			for( var render = 0; render <= 1; render++ ) {
				it( "should retrieve the active tab when the `activeTab` config is a number. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : 1,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should retrieve the active tab when the `activeTab` config is a Panel reference. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : panels[ 1 ],
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( panels[ 1 ] );
						
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should return `null` when there is no active tab. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : null,
						items : panels
					} );
					
					expect( tabPanel.getActiveTab() ).toBe( null );
						
					tabPanel.destroy();  // clean up
				} );
			}
			
		} );
		
		
		describe( 'getActiveTabIndex()', function() {
			
			for( var render = 0; render <= 1; render++ ) {
				it( "should retrieve the active tab index when the `activeTab` config is a number. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : 1,
						items : panels
					} );
					
					expect( tabPanel.getActiveTabIndex() ).toBe( 1 );
							
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should retrieve the active tab index when the `activeTab` config is a Panel reference. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : panels[ 1 ],
						items : panels
					} );
					
					expect( tabPanel.getActiveTabIndex() ).toBe( 1 );
							
					tabPanel.destroy();  // clean up
				} );
				
				
				it( "should return -1 when there is no active tab. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined,
						activeTab : null,
						items : panels
					} );
					
					expect( tabPanel.getActiveTabIndex() ).toBe( -1 );
							
					tabPanel.destroy();  // clean up
				} );
			}
			
		} );
		
		
		
		describe( 'onDestroy()', function() {
			
			for( var render = 0; render <= 1; render++ ) {
				it( "should destroy its inner TabBar when the TabPanel destroyed. isRendered = " + !!render, function() {
					var tabPanel = new TestTabPanel( {
						renderTo : ( render ) ? 'body' : undefined
					} );
					expect( tabBar.destroy ).not.toHaveBeenCalled();  // initial condition
					
					tabPanel.destroy();
					expect( tabBar.destroy ).toHaveBeenCalled();
				} );
			}
			
		} );
		
	} );

} );