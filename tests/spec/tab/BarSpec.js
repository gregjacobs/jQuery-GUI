/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
/*jshint loopfunc:true */
define( [
	'jqGui/panel/Panel',
	'jqGui/tab/Panel',
	'jqGui/tab/Bar',
	'jqGui/tab/Tab'
], function( Panel, TabPanel, TabBar, Tab ) {
	
	describe( 'jqGui.tab.Bar', function() {
		
		describe( 'setActiveTab', function() {
			var panels,
			    tabs,
			    tabBar;
			
			beforeEach( function() {
				panels = [
					new Panel( { title: "Panel 0" } ),
					new Panel( { title: "Panel 1" } ),
					new Panel( { title: "Panel 2" } )
				];
				
				tabs = [
					new Tab( { correspondingPanel: panels[ 0 ] } ),
					new Tab( { correspondingPanel: panels[ 1 ] } ),
					new Tab( { correspondingPanel: panels[ 2 ] } )
				];
				
				for( var i = 0, len = tabs.length; i < len; i++ ) {
					spyOn( tabs[ i ], 'setActive' ).andCallThrough();
					spyOn( tabs[ i ], 'setInactive' ).andCallThrough();
				}
				
				tabBar = new TabBar( {
					items : tabs
				} );
			} );
			
			afterEach( function() {
				tabBar.destroy();  // clean up
			} );
			
			
			for( var render = 0; render <= 1; render++ ) {
				
				it( "should set the tab that corresponds to the provided `panel` as the active tab, while making all others inactive. isRendered = " + !!render, function() {
					if( render ) tabBar.render( 'body' );
					
					tabBar.setActiveTab( panels[ 1 ] );
					
					expect( tabs[ 0 ].setActive ).not.toHaveBeenCalled();
					expect( tabs[ 0 ].setInactive ).toHaveBeenCalled();
					
					expect( tabs[ 1 ].setActive ).toHaveBeenCalled();
					expect( tabs[ 1 ].setInactive ).not.toHaveBeenCalled();
					
					expect( tabs[ 2 ].setActive ).not.toHaveBeenCalled();
					expect( tabs[ 2 ].setInactive ).toHaveBeenCalled();
				} );
				
				
				it( "should set all tabs to inactive when `null` is provided as the corresponding panel. isRendered = " + !!render, function() {
					if( render ) tabBar.render( 'body' );
					
					tabBar.setActiveTab( null );
					
					expect( tabs[ 0 ].setActive ).not.toHaveBeenCalled();
					expect( tabs[ 0 ].setInactive ).toHaveBeenCalled();
					
					expect( tabs[ 1 ].setActive ).not.toHaveBeenCalled();
					expect( tabs[ 1 ].setInactive ).toHaveBeenCalled();
					
					expect( tabs[ 2 ].setActive ).not.toHaveBeenCalled();
					expect( tabs[ 2 ].setInactive ).toHaveBeenCalled();
				} );
				
				
				it( "should return a reference to the TabBar instance, to make it chainable", function() {
					if( render ) tabBar.render( 'body' );
					
					expect( tabBar.setActiveTab( panels[ 0 ] ) ).toBe( tabBar );
				} );
				
			}
			
		} );
		
	} );
	
} );