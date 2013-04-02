/*global define, describe, xdescribe, beforeEach, afterEach, it, xit, expect, runs, waitsFor, JsMockito */
/*jshint sub:true */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/anim/Animation',
	'ui/plugin/Plugin',
	'ui/Component',
	'ui/Container'
],
function( jQuery, _, Class, Animation, Plugin, Component, Container ) {
	
	describe( 'ui.Component', function() {
		
		describe( 'constructor', function() {
			
			it( "The constructor should apply all configs to the Component object", function() {
				// Test that configs are applied to the Component object
				var component = new Component( {
					testConfig1: "test1",
					testConfig2: "test2"
				} );
				
				expect( component.testConfig1 ).toBe( "test1" );  // testConfig1 was not applied (copied) to the component object
				expect( component.testConfig2 ).toBe( "test2" );  // testConfig2 was not applied (copied) to the component object
			} );
			
			
			// TODO: Test that events can be listened to and fired
			
			
			
			// Tests for plugins
			
			it( "The constructor should always set the 'plugins' property to an array before initComponent is run, with no plugins config", function() {
				// Test with no plugins config
				var component = new Component( {
					initComponent : function() {  // inline override of initComponent method
						expect( this.plugins ).toEqual( [] );
					}
				} );
			} );
				
			it( "The constructor should always set the 'plugins' property to an array before initComponent is run, with an empty array for the plugins config", function() {
				var component = new Component( {
					plugins : [],
					
					initComponent : function() {  // inline override of initComponent method
						expect( this.plugins ).toEqual( [] );
					}
				} );
			} );
			
			it( "The constructor should always set the 'plugins' property to an array before initComponent is run, with a single object for the plugins config", function() {
				var PluginSubclass = Class.extend( Plugin, { init: function() {} } );
				var plugin = new PluginSubclass();
				
				var component = new Component( {
					plugins : plugin,
					
					initComponent : function() {  // inline override of initComponent method
						expect( this.plugins ).toEqual( [ plugin ] );
					}
				} ); 
			} );
				
			it( "The constructor should always set the 'plugins' property to an array before initComponent is run, with an array of objects for the plugins config", function() {
				var PluginSubclass = Class.extend( Plugin, { init: function() {} } );
				var p1 = new PluginSubclass(),
				    p2 = new PluginSubclass();
				
				var component = new Component( {
					plugins : [ p1, p2 ],
					
					initComponent : function() {  // inline override of initComponent method
						expect( this.plugins ).toEqual( [ p1, p2 ] );
					}
				} );
			} );
		} );
		
		
		
		describe( "initPlugins()", function() {
			var MyPlugin,
			    pluginInitCalledCount,
			    pluginComponentRef;
			
			beforeEach( function() {
				pluginInitCalledCount = 0;
				pluginComponentRef = null;
				
				// Create a simple plugin for testing
				MyPlugin = Class.extend( Plugin, {
					init : function( component ) {
						pluginInitCalledCount++;
						pluginComponentRef = component;
					}
				} );
			} );
			
			
			
			it( "should properly initialize a single plugin and component instantiation time", function() {
				var component = new Component( {
					plugins : new MyPlugin()
				} );
				expect( pluginInitCalledCount ).toBe( 1 );  // the plugin's `init` method should have been called once for instantiating a plugin at component construction time
				expect( pluginComponentRef ).toBe( component );  // the plugin's `init` method should have had the component reference passed in, and set to the local pluginComponentRef variable (for single plugin at construction time)
			} );
				
			
			it( "should properly initialize multiple plugins at component instantiation time", function() {
				var component = new Component( {
					plugins : [ new MyPlugin(), new MyPlugin() ]
				} );
				expect( pluginInitCalledCount ).toBe( 2 );  // the plugin's `init` method should have been called twice for instantiating a plugin at component construction time
				expect( pluginComponentRef ).toBe( component );  // the plugin's `init` method should have had the component reference passed in, and set to the local pluginComponentRef variable (for multiple plugins at construction time)
			} );
				
				
			it( "should properly initialize a component added *after* component instantiation", function() {
				var component = new Component();
				component.initPlugins( new MyPlugin() );
				expect( pluginInitCalledCount ).toBe( 1 );  // the plugin's `init` method should have been called once for instantiating a plugin after component construction time
				expect( pluginComponentRef ).toBe( component );  // the plugin's `init` method should have had the component reference passed in, and set to the local pluginComponentRef variable (for adding a plugin after construction time)
			} );		
				
			
			it( "should throw an error when trying to add a non ui.plugin.Plugin object as a plugin", function() {
				expect( function() {
					var component = new Component( {
						plugins : {
							// non ui.plugin.Plugin implementation. should error
							init : function() { }
						}
					} );
				} ).toThrow( "error: a plugin provided to this Component was not of type ui.plugin.Plugin" );
			} );
		} );
			
		
		describe( 'show()', function() {
			var component,
			    callCounts = {},
			    callArgs = {},
			    onBeforeShow_elVisibleState,
			    onBeforeShow_showingState,
			    onShow_elVisibleState,
			    showbegin_elVisibleState,
			    onAfterShow_showingState,
			    executionOrder = [];
			
			// A Component subclass with overridden hook methods for the tests
			var TestComponent = Component.extend( {
				onBeforeShow : function( arg ) {
					executionOrder.push( 'onBeforeShow' );
					
					callCounts[ 'onBeforeShow' ]++;
					callArgs[ 'onBeforeShow' ] = arg;
					onBeforeShow_elVisibleState = this.getEl().is( ':visible' );
					onBeforeShow_showingState = this.showing;
				},
				onShow : function( arg ) { 
					executionOrder.push( 'onShow' );
					
					callCounts[ 'onShow' ]++;
					callArgs[ 'onShow' ] = arg;
					onShow_elVisibleState = this.getEl().is( ':visible' );
				},
				onAfterShow : function( arg ) {
					executionOrder.push( 'onAfterShow' );
					
					callCounts[ 'onAfterShow' ]++;
					callArgs[ 'onAfterShow' ] = arg;
					onAfterShow_showingState = this.showing;
				}
			} );
			
			
			beforeEach( function() {
				component = new TestComponent();
				
				callCounts = {   // call counts for both hook methods and events
					onBeforeShow : 0,
					onShow       : 0,
					onAfterShow  : 0,
					beforeshow   : 0,
					showbegin    : 0,
					show         : 0,
					aftershow    : 0
				};
				callArgs = {
					onBeforeShow : undefined,
					onShow       : undefined,
					onAfterShow  : undefined
				};
			    onBeforeShow_elVisibleState = undefined;
			    onBeforeShow_showingState = undefined;
			    onShow_elVisibleState = undefined;
			    showbegin_elVisibleState = undefined;
			    executionOrder = [];
			    
			    component.on( {
					'beforeshow' : function( cmp ) { executionOrder.push( 'beforeshow' ); callCounts[ 'beforeshow' ]++; },
					'showbegin'  : function( cmp ) { executionOrder.push( 'showbegin' );  callCounts[ 'showbegin' ]++; showbegin_elVisibleState = cmp.getEl().is( ':visible' ); },
					'show'       : function( cmp ) { executionOrder.push( 'show' );       callCounts[ 'show' ]++;       },
					'aftershow'  : function( cmp ) { executionOrder.push( 'aftershow' );  callCounts[ 'aftershow' ]++;  }
			    } );
			} );
			
			afterEach( function() {
				component.destroy();  // clean up
			} );
			
			
			it( "should set the state correctly on an unrendered component", function() {
				component.hide();
				
				expect( component.isHidden() ).toBe( true );  // initial condition failed. isHidden() should have returned true on initially hidden component (in unrendered state)
				component.show();
				expect( component.isHidden() ).toBe( false );  // after running show(), isHidden() should have returned false (on an unrendered component)
			} );
			
			
			it( "should render a component as visible, if the component was hidden and then shown again in its unrendered state", function() {
				component.hide();
				component.show();  // re-show the originally hidden component
				
				// now render the component
				component.render( document.body );
				expect( component.isHidden() ).toBe( false );  // after rendering the component, shown with show() when it was unrendered, it should have been rendered shown (visible)
				expect( component.getEl().is( ':visible' ) ).toBe( true );  // after rendering the component, shown with show() when it was unrendered, confirm that the element itself is visible after render
			} );
			
			
			it( "should show a hidden, rendered component", function() {
				component.hide();
				component.render( document.body );
				
				expect( component.isHidden() ).toBe( true );  // initial condition failed. isHidden() should have returned true for initially hidden rendered component
				component.show();
				expect( component.isHidden() ).toBe( false );  // after running show(), isHidden() should have returned false (on rendered component)
				expect( component.getEl().is( ':visible' ) ).toBe( true );  // after running show() when it was rendered, confirm that the element itself is visible (not hidden)
			} );
			
			
			it( "should only show a component that is not already shown", function() {
				component.render( document.body );
				
				expect( component.isVisible() ).toBe( true );  // initial condition
				expect( callCounts[ 'onBeforeShow' ] ).toBe( 0 );     // initial condition
				
				component.show();
				expect( callCounts[ 'onBeforeShow' ] ).toBe( 0 );  // shouldn't have been called
				expect( callCounts[ 'onShow' ] ).toBe( 0 );        // shouldn't have been called
				expect( callCounts[ 'onAfterShow' ] ).toBe( 0 );   // shouldn't have been called
			} );
			
			
			it( "should be prevented from showing if a 'beforeshow' event handler returns false", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );  // initial condition
				
				component.on( 'beforeshow', function() { return false; } );
				component.show();
				expect( callCounts[ 'onBeforeShow' ] ).toBe( 0 );  // shouldn't have been called
				expect( callCounts[ 'onShow' ] ).toBe( 0 );        // shouldn't have been called
				expect( callCounts[ 'onAfterShow' ] ).toBe( 0 );   // shouldn't have been called
			} );
			
			
			it( "should end a current 'hiding' animation, if there is one, when showing", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );  // initial condition
				
				var anim = JsMockito.mock( Animation );
				
				// Set state
				component.hiding = true;
				component.currentAnimation = anim;
				
				// Test
				component.show();
				JsMockito.verify( anim ).end();  // verify that the 'end' method was called
			} );
			
			
			it( "should call onBeforeShow(), before the element is visible, and with the `showing` flag == true", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );          // initial condition
				expect( callCounts[ 'onBeforeShow' ] ).toBe( 0 );       // initial condition
				expect( onBeforeShow_elVisibleState ).toBeUndefined();  // initial condition
				expect( onBeforeShow_showingState ).toBeUndefined();    // initial condition
				
				var opts = {};
				component.show( opts );
				expect( callCounts[ 'onBeforeShow' ] ).toBe( 1 );
				expect( callArgs[ 'onBeforeShow' ] ).toBe( opts );    // check that the original `options` object was provided to the hook method
				expect( onBeforeShow_elVisibleState ).toBe( false );  // still not visible yet
				expect( onBeforeShow_showingState ).toBe( true );
			} );
			
			
			it( "should call onShow(), after the element is visible", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );    // initial condition
				expect( callCounts[ 'onShow' ] ).toBe( 0 );       // initial condition
				expect( onShow_elVisibleState ).toBeUndefined();  // initial condition
				
				var opts = {};
				component.show( opts );
				expect( callCounts[ 'onShow' ] ).toBe( 1 );
				expect( callArgs[ 'onShow' ] ).toBe( opts );   // check that the original `options` object was provided to the hook method
				expect( onShow_elVisibleState ).toBe( true );  // visible now
			} );
			
			
			it( "should fire the 'showbegin' and 'show' events after the element is visible, but before any animation is complete (i.e. before onAfterShow() executes)", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );  // initial condition
				expect( executionOrder ).toEqual( [] );         // initial condition
				expect( showbegin_elVisibleState ).toBeUndefined();  // initial condition
				
				component.show();
				expect( executionOrder ).toEqual( [ 'beforeshow', 'onBeforeShow', 'onShow', 'showbegin', 'show', 'onAfterShow', 'aftershow' ] );
				expect( showbegin_elVisibleState ).toBe( true );
			} );
			
			
			it( "should call onAfterShow() and fire the 'aftershow' event immediately when there is no animation", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );  // initial condition
				expect( executionOrder ).toEqual( [] );         // initial condition
				
				var opts = {};
				component.show( opts );
				expect( callCounts[ 'onAfterShow' ] ).toBe( 1 );   // called synchronously in show()
				expect( callCounts[ 'aftershow' ] ).toBe( 1 );     // called synchronously in show()
				expect( callArgs[ 'onAfterShow' ] ).toBe( opts );  // make sure method was provided the original `options` object
				expect( onAfterShow_showingState ).toBe( false );  // should no longer "be in the process of showing"
				
				// Just double checking the execution order
				expect( executionOrder ).toEqual( [ 'beforeshow', 'onBeforeShow', 'onShow', 'showbegin', 'show', 'onAfterShow', 'aftershow' ] );
			} );
			
			
			it( "should call onAfterShow() and fire the 'aftershow' event only after a specified animation is complete", function() {
				component.render( document.body );
				
				component.hide();  // do an initial hide
				expect( component.isVisible() ).toBe( false );  // initial condition
				expect( executionOrder ).toEqual( [] );         // initial condition
				
				// options to provide to show() method
				var opts = {
					anim: {
						from     : { opacity: 0 },
						to       : { opacity: 1 },
						duration : 10
					}
				};
				
				runs( function() {
					component.show( opts );
					expect( callCounts[ 'onBeforeShow' ] ).toBe( 1 );  // called synchronously in show()
					expect( callCounts[ 'beforeshow' ] ).toBe( 1 );    // called synchronously in show()
					expect( callCounts[ 'onShow' ] ).toBe( 1 );        // called synchronously in show()
					expect( callCounts[ 'show' ] ).toBe( 1 );          // called synchronously in show()
					expect( callCounts[ 'onAfterShow' ] ).toBe( 0 );   // *not* called synchronously in show()
					expect( callCounts[ 'aftershow' ] ).toBe( 0 );     // *not* called synchronously in show()
					expect( component.showing ).toBe( true );          // should "be in the process of showing"
				} );
				
				waitsFor( function() {
					return callCounts[ 'onAfterShow' ] === 1;   // wait until it has been executed
				}, "onAfterShow() should be executed", 100 );
				
				runs( function() {
					expect( callCounts[ 'onBeforeShow' ] ).toBe( 1 );  // final state after animation completes
					expect( callCounts[ 'beforeshow' ] ).toBe( 1 );    // final state after animation completes
					expect( callCounts[ 'onShow' ] ).toBe( 1 );        // final state after animation completes
					expect( callCounts[ 'show' ] ).toBe( 1 );          // final state after animation completes
					expect( callCounts[ 'onAfterShow' ] ).toBe( 1 );   // final state after animation completes
					expect( callCounts[ 'aftershow' ] ).toBe( 1 );     // final state after animation completes
					expect( callArgs[ 'onAfterShow' ] ).toBe( opts );  // make sure method was provided the original `options` object
					expect( onAfterShow_showingState ).toBe( false );  // should no longer "be in the process of showing" in the onAfterShowMethod
					expect( component.getEl().is( ':visible' ) ).toBe( true );  // final state after show
					
					// Double checking execution order
					expect( executionOrder ).toEqual( [ 'beforeshow', 'onBeforeShow', 'onShow', 'showbegin', 'show', 'onAfterShow', 'aftershow' ] );
				} );
			} );
			
			
			it( "should return a reference to itself, for chaining, when showing", function() {
				component.hide();  // do an initial hide
				
				expect( component.isVisible() ).toBe( false );  // checking initial state prior to show() call
				expect( component.show() ).toBe( component );
			} );
			
			it( "should return a reference to itself, for chaining, when not showing (because it is already shown)", function() {
				component.show();  // do an initial show
				
				expect( component.isVisible() ).toBe( true );  // checking initial state prior to hide() call
				expect( component.show() ).toBe( component );
			} );
		} );
			
			
		
		describe( 'hide()', function() {
			var component,
			    callCounts = {},
			    callArgs = {},
			    onBeforeHide_elVisibleState,
			    onBeforeHide_hidingState,
			    onHide_elVisibleState,
			    onHide_hidingState,
			    onAfterHide_elVisibleState,
			    onAfterHide_hidingState,
			    hidebegin_elVisibleState,
			    executionOrder = [];
			
			// A Component subclass with overridden hook methods for the tests
			var TestComponent = Component.extend( {
				onBeforeHide : function( arg ) {
					executionOrder.push( 'onBeforeHide' );
					
					callCounts[ 'onBeforeHide' ]++;
					callArgs[ 'onBeforeHide' ] = arg;
					onBeforeHide_elVisibleState = this.getEl().is( ':visible' );
					onBeforeHide_hidingState = this.hiding;
				},
				onHide : function( arg ) { 
					executionOrder.push( 'onHide' );
					
					callCounts[ 'onHide' ]++;
					callArgs[ 'onHide' ] = arg;
					onHide_elVisibleState = this.getEl().is( ':visible' );
					onHide_hidingState = this.hiding;
				},
				onAfterHide : function( arg ) {
					executionOrder.push( 'onAfterHide' );
					
					callCounts[ 'onAfterHide' ]++;
					callArgs[ 'onAfterHide' ] = arg;
					onAfterHide_elVisibleState = this.getEl().is( ':visible' );
					onAfterHide_hidingState = this.hiding;
				}
			} );
			
			
			beforeEach( function() {
				component = new TestComponent();
				
				callCounts = {   // call counts for both hook methods and events
					onBeforeHide : 0,
					onHide       : 0,
					onAfterHide  : 0,
					beforehide   : 0,
					hidebegin    : 0,
					hide         : 0,
					afterhide    : 0
				};
				callArgs = {
					onBeforeHide : undefined,
					onHide       : undefined,
					onAfterHide  : undefined
				};
			    onBeforeHide_elVisibleState = undefined;
			    onBeforeHide_hidingState = undefined;
			    onHide_elVisibleState = undefined;
			    onHide_hidingState = undefined;
			    hidebegin_elVisibleState = undefined;
			    onAfterHide_hidingState = undefined;
			    executionOrder = [];
			    
			    component.on( {
					'beforehide' : function( cmp ) { executionOrder.push( 'beforehide' ); callCounts[ 'beforehide' ]++; },
					'hidebegin'  : function( cmp ) { executionOrder.push( 'hidebegin' );  callCounts[ 'hidebegin' ]++; hidebegin_elVisibleState = cmp.getEl().is( ':visible' ); },
					'hide'       : function( cmp ) { executionOrder.push( 'hide' );       callCounts[ 'hide' ]++;       },
					'afterhide'  : function( cmp ) { executionOrder.push( 'afterhide' );  callCounts[ 'afterhide' ]++;  }
			    } );
			} );
			
			afterEach( function() {
				component.destroy();  // clean up
			} );
			
			
			it( "should set the state correctly on an unrendered component", function() {
				expect( component.isHidden() ).toBe( false );  // initial condition failed. isHidden() should have returned false
				component.hide();
				expect( component.isHidden() ).toBe( true );  // after running hide(), isHidden() should have returned true (on an unrendered component)
			} );
			
			
			it( "should render a component as hidden, if hide() was called on the component in its unrendered state", function() {
				component.hide();
				
				// now render
				component.render( document.body );
				expect( component.isHidden() ).toBe( true );  // after rendering the component, hidden with hide() when it was unrendered, it should have been rendered hidden
				expect( component.getEl().is( ':visible' ) ).toBe( false );  // after rendering the component, hidden with hide() when it was unrendered, confirm that the element itself is hidden (not visible)
			} );
			
			
			it( "should hide a rendered component", function() {
				component.render( document.body );
				
				expect( component.isHidden() ).toBe( false );  // initial condition failed. isHidden() should have returned false for rendered component
				component.hide();
				expect( component.isHidden() ).toBe( true );  // after running hide(), isHidden() should have returned true (on rendered component)
				expect( component.getEl().is( ':visible' ) ).toBe( false );  // after running hide() when it was rendered, confirm that the element itself is hidden (not visible)
			} );
			
			
			it( "should only hide a component that is not already hidden", function() {
				component.render( document.body );
				
				// Do an initial hide
				component.hide();
				expect( component.isVisible() ).toBe( false );     // initial condition
				expect( callCounts[ 'onBeforeHide' ] ).toBe( 1 );  // initial condition
				expect( callCounts[ 'onHide' ] ).toBe( 1 );        // initial condition
				expect( callCounts[ 'onAfterHide' ] ).toBe( 1 );   // initial condition
				
				// Test attempting to call it again
				component.hide();
				expect( callCounts[ 'onBeforeHide' ] ).toBe( 1 );  // shouldn't have been called again
				expect( callCounts[ 'onHide' ] ).toBe( 1 );        // shouldn't have been called again
				expect( callCounts[ 'onAfterHide' ] ).toBe( 1 );   // shouldn't have been called again
			} );
			
			
			it( "should be prevented from hiding if a 'beforehide' event handler returns false", function() {
				component.render( document.body );
				expect( component.isVisible() ).toBe( true );  // initial condition
				
				component.on( 'beforehide', function() { return false; } );
				component.hide();
				expect( callCounts[ 'onBeforeHide' ] ).toBe( 0 );  // shouldn't have been called
				expect( callCounts[ 'onHide' ] ).toBe( 0 );        // shouldn't have been called
				expect( callCounts[ 'onAfterHide' ] ).toBe( 0 );   // shouldn't have been called
			} );
			
			
			it( "should end a current 'showing' animation, if there is one, when hiding", function() {
				component.render( document.body );
				expect( component.isVisible() ).toBe( true );  // initial condition
				
				var anim = JsMockito.mock( Animation );
				
				// Set state
				component.showing = true;
				component.currentAnimation = anim;
				
				// Test
				component.hide();
				JsMockito.verify( anim ).end();  // verify that the 'end' method was called
			} );
			
			
			it( "should call onBeforeHide(), with element still visible, and with the `hiding` flag == true", function() {
				component.render( document.body );
				
				expect( component.isVisible() ).toBe( true );          // initial condition
				expect( callCounts[ 'onBeforeHide' ] ).toBe( 0 );      // initial condition
				expect( onBeforeHide_elVisibleState ).toBeUndefined(); // initial condition
				expect( onBeforeHide_hidingState ).toBeUndefined();    // initial condition
				
				var opts = {};
				component.hide( opts );
				expect( callCounts[ 'onBeforeHide' ] ).toBe( 1 );
				expect( callArgs[ 'onBeforeHide' ] ).toBe( opts );   // check that the original `options` object was provided to the hook method
				expect( onBeforeHide_elVisibleState ).toBe( true );  // still visible at this point
				expect( onBeforeHide_hidingState ).toBe( true );     // "in the process of hiding"
			} );
			
			
			it( "should fire the 'hidebegin' event after the onBeforeHide() hook, but before onHide() and onAfterHide(), when the element is still visible", function() {
				component.render( document.body );
				
				expect( component.isVisible() ).toBe( true );        // initial condition
				expect( executionOrder ).toEqual( [] );              // initial condition
				expect( hidebegin_elVisibleState ).toBeUndefined();  // initial condition
				
				component.hide();
				expect( executionOrder ).toEqual( [ 'beforehide', 'onBeforeHide', 'hidebegin', 'onHide', 'hide', 'onAfterHide', 'afterhide' ] );
				expect( hidebegin_elVisibleState ).toBe( true );
			} );
			
			
			it( "should call onHide() and onAfterHide() methods, and fire the 'hide' and 'afterhide' events immediately when there is no animation", function() {
				component.render( document.body );
				
				expect( component.isVisible() ).toBe( true );  // initial condition
				expect( executionOrder ).toEqual( [] );        // initial condition
				
				var opts = {};
				component.hide( opts );
				expect( component.hiding ).toBe( false );            // should not longer "be in the process of hiding"
				expect( callCounts[ 'onHide' ] ).toBe( 1 );          // called synchronously as part of hide()
				expect( callCounts[ 'hide' ] ).toBe( 1 );            // called synchronously as part of hide()
				expect( callCounts[ 'onAfterHide' ] ).toBe( 1 );     // called synchronously as part of hide()
				expect( callCounts[ 'afterhide' ] ).toBe( 1 );       // called synchronously as part of hide()
				expect( callArgs[ 'onHide' ] ).toBe( opts );         // make sure method was provided the original `options` object
				expect( callArgs[ 'onAfterHide' ] ).toBe( opts );    // make sure method was provided the original `options` object
				expect( onHide_elVisibleState ).toBe( false );       // should have been hidden at this point
				expect( onAfterHide_elVisibleState ).toBe( false );  // should have been hidden at this point
				expect( onHide_hidingState ).toBe( false );          // no longer "in the process of hiding"
				expect( onAfterHide_hidingState ).toBe( false );     // no longer "in the process of hiding"
				
				// Just double checking the execution order
				expect( executionOrder ).toEqual( [ 'beforehide', 'onBeforeHide', 'hidebegin', 'onHide', 'hide', 'onAfterHide', 'afterhide' ] );
			} );
			
			
			it( "should call onHide() and onAfterHide(), and fire the 'hide' and 'afterhide' events only after a specified animation is complete", function() {
				component.render( document.body );
				
				expect( component.isVisible() ).toBe( true );  // initial condition
				expect( executionOrder ).toEqual( [] );         // initial condition
				
				// options to provide to hide() method
				var opts = {
					anim: {
						from     : { opacity: 1 },
						to       : { opacity: 0 },
						duration : 10
					}
				};
				
				runs( function() {
					component.hide( opts );
					expect( component.hiding ).toBe( true );          // should "be in the process of hiding"
					expect( callCounts[ 'onBeforeHide' ] ).toBe( 1 ); // called synchronously in hide()
					expect( callCounts[ 'beforehide' ] ).toBe( 1 );   // called synchronously in hide()
					expect( callCounts[ 'onHide' ] ).toBe( 0 );       // *not* called synchronously in hide()
					expect( callCounts[ 'hide' ] ).toBe( 0 );         // *not* called synchronously in hide()
					expect( callCounts[ 'onAfterHide' ] ).toBe( 0 );  // *not* called synchronously in hide()
					expect( callCounts[ 'afterhide' ] ).toBe( 0 );    // *not* called synchronously in hide()
				} );
				
				waitsFor( function() {
					return callCounts[ 'onAfterHide' ] === 1;   // wait until it has been executed
				}, "onAfterHide() should be executed", 100 );
				
				runs( function() {
					expect( component.hiding ).toBe( false );            // should not longer "be in the process of hiding"
					expect( callCounts[ 'onBeforeHide' ] ).toBe( 1 );    // final state after animation completes
					expect( callCounts[ 'beforehide' ] ).toBe( 1 );      // final state after animation completes
					expect( callCounts[ 'onHide' ] ).toBe( 1 );          // final state after animation completes
					expect( callCounts[ 'hide' ] ).toBe( 1 );            // final state after animation completes
					expect( callCounts[ 'onAfterHide' ] ).toBe( 1 );     // final state after animation completes
					expect( callCounts[ 'afterhide' ] ).toBe( 1 );       // final state after animation completes
					expect( callArgs[ 'onHide' ] ).toBe( opts );         // make sure method was provided the original `options` object
					expect( callArgs[ 'onAfterHide' ] ).toBe( opts );    // make sure method was provided the original `options` object
					expect( onHide_elVisibleState ).toBe( false );       // should have been hidden at this point
					expect( onAfterHide_elVisibleState ).toBe( false );  // should have been hidden at this point
					expect( onHide_hidingState ).toBe( false );          // no longer "in the process of hiding" at this point
					expect( onAfterHide_hidingState ).toBe( false );     // no longer "in the process of hiding" at this point
					expect( component.getEl().is( ':visible' ) ).toBe( false );  // should be hidden as an end state
					
					// Double checking execution order
					expect( executionOrder ).toEqual( [ 'beforehide', 'onBeforeHide', 'hidebegin', 'onHide', 'hide', 'onAfterHide', 'afterhide' ] );
				} );
			} );
			
			
			it( "should return a reference to itself, for chaining, when hiding", function() {
				component.show();  // do an initial show
				
				expect( component.isVisible() ).toBe( true );  // checking initial state prior to hide() call
				expect( component.hide() ).toBe( component );
			} );
			
			it( "should return a reference to itself, for chaining, when not hiding (because it is already hidden)", function() {
				component.hide();  // do an initial hide
				
				expect( component.isVisible() ).toBe( false );  // checking initial state prior to hide() call
				expect( component.hide() ).toBe( component );
			} );
		} );
		
		
			
		describe( 'isHidden()', function() {
			it( "should return the state of the `hidden` flag for an unrendered component", function() {
				// Test on an unrendered component
				var component = new Component();
				expect( component.isHidden() ).toBe( false );  // initial condition failed. isHidden() should have returned false (for unrendered component)
				component.hide();
				expect( component.isHidden() ).toBe( true );  // after running hide(), isHidden() should have returned true (on an unrendered component)
				component.show();
				expect( component.isHidden() ).toBe( false );  // after running hide(), isHidden() should have returned false (on an unrendered component)
			} );
			
			it( "should return its `hidden` flag state (which in this case, should relate to its DOM visible state) for a rendered component", function() {
				var component = new Component( { renderTo: document.body } );
				expect( component.isHidden() ).toBe( false );  // initial condition failed. isHidden() should have returned false (for rendered component)
				expect( component.getEl().is( ':visible' ) ).toBe( true );  // confirm initial condition on rendered component, that the element itself is visible (not hidden)
				component.hide();
				expect( component.isHidden() ).toBe( true );  // after running hide(), isHidden() should have returned true (on a rendered component)
				expect( component.getEl().is( ':visible' ) ).toBe( false );  // confirm that the element itself is hidden (not visible) on rendered component
				component.show();
				expect( component.isHidden() ).toBe( false );  // after running show(), isHidden() should have returned false (on a rendered component)
				expect( component.getEl().is( ':visible' ) ).toBe( true );  // confirm that the element itself is now visible on rendered component
				component.destroy();  // clean up DOM
			} );
			
			it( "should return false for a rendered component that has been placed into an element that does not exist in the DOM, but with not passing the `checkDom` argument to the method", function() {
				var myDiv = jQuery( '<div />' );
				var component = new Component( { renderTo: myDiv } );
				expect( component.isHidden( /* checkDom */ false ) ).toBe( false );  // isHidden() should only have reported on the state of the `hidden` flag in this case, not reporting on the DOM state
				component.destroy();
				myDiv.remove();
			} );
			
			it( "should return true for a rendered component that has been placed into an element that does not exist in the DOM", function() {
				var myDiv = jQuery( '<div />' );
				var component = new Component( { renderTo: myDiv } );
				expect( component.isHidden( /* checkDom */ true ) ).toBe( true );  // isHidden() should return true for a Component that is shown, but is rendered as a child of an element that is not attached to the DOM
				
				component.destroy();
				myDiv.remove();
			} );
			
			it( "should return true for a rendered component that is `display: none`", function() {
				var myDiv = jQuery( '<div />' ).appendTo( 'body' );
				var component = new Component( { renderTo: myDiv } );
				
				component.getEl().hide();  // set to display:none
				expect( component.isHidden( /* checkDom */ true ) ).toBe( true );
				
				component.destroy();
				myDiv.remove();
			} );
			
			it( "should return true for a rendered component that is not `display: none`, but one of its parent elements is", function() {
				var myDiv = jQuery( '<div />' ).appendTo( 'body' );
				var component = new Component( { renderTo: myDiv } );
				
				myDiv.hide();  // set parent element to display:none
				expect( component.isHidden( /* checkDom */ true ) ).toBe( true );
				
				component.destroy();
				myDiv.remove();
			} );
			
		} );
		
		
		xdescribe( 'isDomVisible()', function() {
			
		} );
		
		
		
		
		// -----------------------------------------------
		
		/*
		 * Test render()
		 */
		describe( "Test render()", function() {
			
			it( "Attributes given to the 'attr' config should be applied to the element", function() {
				var component = new Component( {
					renderTo : document.body,   // to cause it to render
					attr : {
						attr1 : "value1",
						attr2 : "value2"
					}
				} );
				
				var $el = component.getEl();
				expect( $el.attr( 'attr1' ) ).toBe( "value1" );  // 'attr1' should have been applied to the element
				expect( $el.attr( 'attr2' ) ).toBe( "value2" );  // 'attr2' should have been applied to the element
				
				component.destroy();
			} );
			
			
			it( "CSS class names given to the 'cls' config should be applied to the element", function() {
				var component = new Component( {
					renderTo : document.body,   // to cause it to render
					cls: 'myClass1 myClass2'
				} );
				
				var $el = component.getEl();
				expect( $el.hasClass( "myClass1" ) ).toBe( true );  // 'myClass1' should have been applied to the element
				expect( $el.hasClass( 'myClass2' ) ).toBe( true );  // 'myClass2' should have been applied to the element
				
				component.destroy();
			} );
			
			
			it( "style properties given to the 'style' config should be applied to the element", function() {
				var component = new Component( {
					renderTo : document.body,   // to cause it to render
					style: {
						'fontFamily' : 'Arial', // specified as JS property name
						'font-size'  : '12px'   // specified as CSS property name
					}
				} );
				
				var $el = component.getEl();
				expect( $el.css( "font-family" ) ).toBe( 'Arial' );  // font-family 'Arial' should have been applied to the element
				expect( $el.css( "font-size" ) ).toBe( '12px' );  // font-size '12px' should have been applied to the element
				
				component.destroy();  // clean up
			} );
			
			
			it( "should apply the sizing configs (width/height, minWidth/minHeight, maxWidth/maxHeight) to the element, when specified as numbers", function() {
				var component = new Component( {
					renderTo : 'body',   // to cause it to render
					
					minWidth  : 100,
					minHeight : 110,
					width     : 200,
					height    : 210,
					maxWidth  : 300,
					maxHeight : 310
				} );
				
				var $el = component.getEl();
				expect( $el.css( 'minWidth' ) ).toBe( '100px' );
				expect( $el.css( 'minHeight' ) ).toBe( '110px' );
				expect( $el.css( 'width' ) ).toBe( '200px' );
				expect( $el.css( 'height' ) ).toBe( '210px' );
				expect( $el.css( 'maxWidth' ) ).toBe( '300px' );
				expect( $el.css( 'maxHeight' ) ).toBe( '310px' );
				
				component.destroy();  // clean up
			} );
			
			
			it( "should apply the sizing configs (width/height, minWidth/minHeight, maxWidth/maxHeight) to the element, when specified as css strings", function() {
				var component = new Component( {
					renderTo : 'body',   // to cause it to render
					
					minWidth  : '10%',
					minHeight : '11%',
					width     : '20%',
					height    : '21%',
					maxWidth  : '30%',
					maxHeight : '31%'
				} );
				
				var el = component.getEl().get( 0 );
				expect( el.style.minWidth ).toBe( '10%' );
				expect( el.style.minHeight ).toBe( '11%' );
				expect( el.style.width ).toBe( '20%' );
				expect( el.style.height ).toBe( '21%' );
				expect( el.style.maxWidth ).toBe( '30%' );
				expect( el.style.maxHeight ).toBe( '31%' );
				
				component.destroy();  // clean up
			} );
			
			
			// -----------------------------------
			
			
			it( "rendering an element with a numeric position should put that component's element at that position", function() {
				var $containerEl = jQuery( '<div />' ),
				    component1 = new Component(),
				    component2 = new Component();
				
				expect( $containerEl.children().length ).toBe( 0 );  // Initial condition: The container shouldn't have any child elements
				
				component1.render( $containerEl );
				expect( $containerEl.children().length ).toBe( 1 );  // There should be 1 child element in the $containerEl now
				expect( $containerEl.children()[ 0 ] ).toBe( component1.getEl()[ 0 ] );  // component1's element should be the first element in the $containerEl
				
				component2.render( $containerEl, { position: 0 } );  // render it at index 0, before component1
				expect( $containerEl.children().length ).toBe( 2 );  // There should be 2 child elements in the $containerEl now
				expect( $containerEl.children()[ 1 ] ).toBe( component1.getEl()[ 0 ] );  // component1's element should now be the second element in the $containerEl
				expect( $containerEl.children()[ 0 ] ).toBe( component2.getEl()[ 0 ] );  // component2's element should become the first element in the $containerEl	
			} );
			
			
			it( "rendering an element with a numeric position should simply append the element if the position given is greater than the number of elements in the container element", function() {
				var $containerEl = jQuery( '<div />' ),
				    component1 = new Component(),
				    component2 = new Component();
				
				expect( $containerEl.children().length ).toBe( 0 );  // Initial condition: The container shouldn't have any child elements
				
				component1.render( $containerEl, { position: 0 } );
				expect( $containerEl.children().length ).toBe( 1 );  // There should be 1 child element in the $containerEl now
				expect( $containerEl.children()[ 0 ] ).toBe( component1.getEl()[ 0 ] );  // component1's element should be the first element in the $containerEl
				
				component2.render( $containerEl, { position: 1 } );
				expect( $containerEl.children().length ).toBe( 2 );  // There should be 2 child elements in the $containerEl now
				expect( $containerEl.children()[ 0 ] ).toBe( component1.getEl()[ 0 ] );  // component1's element should be the first element in the $containerEl
				expect( $containerEl.children()[ 1 ] ).toBe( component2.getEl()[ 0 ] );  // component2's element should be the second element in the $containerEl	
			} );
			
			
			it( "rendering an element that is already rendered, with a numeric position (to move it), should simply append the element if the position given is greater than the number of elements in the container element", function() {
				var $containerEl = jQuery( '<div />' ),
				    component1 = new Component( { renderTo: $containerEl } ),
				    component2 = new Component( { renderTo: $containerEl } );
				
				expect( $containerEl.children().length ).toBe( 2 );  // Initial condition: Both components should exist in the $containerEl
				
				// Now move component1 from position 0 to the end
				component1.render( $containerEl, { position: 2 } );
				expect( $containerEl.children().length ).toBe( 2 );  // Both components should still exist in the $containerEl (1)
				expect( $containerEl.children()[ 1 ] ).toBe( component1.getEl()[ 0 ] );  // component1's element should now be the second element in the $containerEl
				expect( $containerEl.children()[ 0 ] ).toBe( component2.getEl()[ 0 ] );  // component2's element should now be the first element in the $containerEl	
				
				// Now move component2 from position 0 to the end
				component2.render( $containerEl, { position: 2 } );
				expect( $containerEl.children().length ).toBe( 2 );  // Both components should still exist in the $containerEl (2)
				expect( $containerEl.children()[ 0 ] ).toBe( component1.getEl()[ 0 ] );  // component1's element should now be the first element in the $containerEl (again)
				expect( $containerEl.children()[ 1 ] ).toBe( component2.getEl()[ 0 ] );  // component2's element should now be the second element in the $containerEl (again)	
			} );
			
			
			describe( "internal structure rendering (`renderTpl` and `renderTplData` configs)", function() {
				
				it( "the `renderTpl` config should populate the internal structure of the Component, and do so before onRender() is executed", function() {
					var innerHtmlOnRender = "";
					var TestComponent = Component.extend( {
						renderTpl : "Testing 123",
						
						onRender : function() {  // override onRender to check
							this._super( arguments );
							
							innerHtmlOnRender = this.$el.html();
						}
					} );
					
					var component = new TestComponent( { renderTo: 'body' } );
					expect( innerHtmlOnRender ).toBe( "Testing 123" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "the `renderTpl` should automatically be provided the following vars from the Component: `baseCls`, `elId`", function() {
					var TestComponent = Component.extend( {
						baseCls : 'testCls',
						elId : "123",
						renderTpl : "Testing <%= elId %>, with baseCls: <%= baseCls %>"
					} );
					
					var component = new TestComponent( { renderTo: 'body' } );
					expect( component.getEl().html() ).toBe( "Testing 123, with baseCls: testCls" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "the `renderTpl` should take a string form, and convert it to a LoDash template instance", function() {
					var component = new Component( {
						renderTo: 'body',
						
						renderTpl : "Testing <%= number %>",
						renderTplData : { number: 123 }
					} );
					
					expect( component.getEl().html() ).toBe( "Testing 123" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "the `renderTpl` should take an array-of-strings form, and convert it to a LoDash template instance", function() {
					var component = new Component( {
						renderTo: 'body',
						
						renderTpl : [ "Testing", " ", "<%= number %>" ],
						renderTplData : { number: 123 }
					} );
					
					expect( component.getEl().html() ).toBe( "Testing 123" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "the `renderTpl` should take compiled lodash template function form, and convert it to a LoDash template instance", function() {
					var renderTplFn = _.template( "Testing <%= number %>" );
					var component = new Component( {
						renderTo: 'body',
						
						renderTpl : renderTplFn,
						renderTplData : { number: 123 }
					} );
					
					expect( component.getEl().html() ).toBe( "Testing 123" );
					
					component.destroy();  // clean up
				} );
				
			} );
			
			
			describe( "content rendering (`tpl`, `html`, and `contentEl` configs)", function() {
				
				it( "should render a `tpl` into the component's element with an empty object for the data if no `tplData` config is provided", function() {
					var component = new Component( {
						tpl : "<span>Testing 123</span>"
					} );
					
					component.render( 'body' );
					expect( component.getEl().html() ).toMatch( "<span>Testing 123</span>" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "should render a `tpl` into the component's element using any provided `tplData`", function() {
					var component = new Component( {
						tpl : "<span>Testing <%= num %></span>",
						tplData : {
							num: 123
						}
					} );
					
					component.render( 'body' );
					expect( component.getEl().html() ).toMatch( "<span>Testing 123</span>" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "should ignore the `html` and `contentEl` configs if the `tpl` config is present", function() {
					var component = new Component( {
						tpl : "<span>Testing 123</span>",
						html : "YYY",
						contentEl: jQuery( "<span>ZZZ</span>" )
					} );
					
					component.render( 'body' );
					var componentHtml = component.getEl().html();
					
					expect( componentHtml ).toMatch( "<span>Testing 123</span>" );
					expect( componentHtml ).not.toMatch( "YYY" );
					expect( componentHtml ).not.toMatch( "ZZZ" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "should append the content of the `html` config (when no `tpl` is present)", function() {
					var component = new Component( {
						html : "YYY"
					} );
					
					component.render( 'body' );
					expect( component.getEl().html() ).toMatch( "YYY" );
					
					component.destroy();  // clean up
				} );
				
				
				it( "should append the content of the `contentEl` config (when no `tpl` is present)", function() {
					var component = new Component( {
						html : jQuery( "<span>ZZZ</span>" )
					} );
					
					component.render( 'body' );
					expect( component.getEl().html() ).toMatch( "<span>ZZZ</span>" );
					
					component.destroy();  // clean up
				} );
				
			} );
			
		} );		
		
		
		describe( "update()", function() {
			var component;
			
			beforeEach( function() {
				component = new Component( {
					tpl  : "Hello, <%= thing %>",
					tplData : { thing: "Town" },
					
					html : "html_config",
					contentEl : jQuery( '<span>contentEl_config</span>' )
				} );	
			} );
			
			afterEach( function() {
				component.destroy();
			} );
			
			
			it( "should set the component's `tplData` config if a plain JS object is provided as the argument, when unrendered", function() {
				component.update( {
					thing: "World"
				} );
				expect( component.tplData ).toEqual( { thing: "World" } );
				
				component.render( 'body' );  // render after
				
				var componentHtml = component.getEl().html();
				expect( componentHtml ).toMatch( "Hello, World" );
				expect( componentHtml ).not.toMatch( "html_config" );
				expect( componentHtml ).not.toMatch( "contentEl_config" );
			} );
			
			
			it( "should run the component's `tpl` if a plain JS object is provided as the argument, when rendered", function() {
				component.render( 'body' );  // render first
				component.update( {
					thing: "World"
				} );
				
				var componentHtml = component.getEl().html();
				expect( componentHtml ).toMatch( "Hello, World" );
				expect( componentHtml ).not.toMatch( "html_config" );
				expect( componentHtml ).not.toMatch( "contentEl_config" );
			} );
			
			
			it( "should update the component's `html` config (and delete the `contentEl` config) when an HTML string is provided, when unrendered", function() {
				component.update( "newHtmlConfig" );
				expect( component.html ).toEqual( "newHtmlConfig" );
				expect( component.contentEl ).toBeUndefined();
				
				component.render( 'body' );  // render after
				
				var componentHtml = component.getEl().html();
				expect( componentHtml ).toMatch( "newHtmlConfig" );
				expect( componentHtml ).not.toMatch( "Hello, Town" );
				expect( componentHtml ).not.toMatch( "html_config" );       // the old `html` config
				expect( componentHtml ).not.toMatch( "contentEl_config" );  // the old `contentEl` config
			} );
			
			
			it( "should update the component's inner HTML when an HTML string is provided, when rendered", function() {
				component.render( 'body' );  // render first
				component.update( "newHtmlConfig" );
				
				var componentHtml = component.getEl().html();
				expect( componentHtml ).toMatch( "newHtmlConfig" );
				expect( componentHtml ).not.toMatch( "Hello, Town" );
				expect( componentHtml ).not.toMatch( "html_config" );       // the old `html` config
				expect( componentHtml ).not.toMatch( "contentEl_config" );  // the old `contentEl` config
			} );
			
			
			it( "should cause the component to be rendered with the provided HTML content, but not delete the `tpl` config so that it may be used at a later time", function() {
				// Update with direct HTML content while the Component is in its unrendered state
				component.update( "newHtmlConfig" );
				
				component.render( 'body' );  // now render
				expect( component.getEl().html() ).toMatch( "newHtmlConfig" );  // the direct HTML content was used to render the Component instead of the `tpl` (correct)
				
				// Now leverage the `tpl` again
				component.update( { thing: "World" } );
				expect( component.getEl().html() ).toMatch( "Hello, World" );
				expect( component.getEl().html() ).not.toMatch( "newHtmlConfig" );   // the old content provided to the previous update() method call
			} );
			
		} );
		
		
		
		// -----------------------------------------------
		
		// Attribute, CSS Class, and Element Style related functionality
		
		
		/*
		 * Test setAttr()
		 */
		describe( "Test setAttr()", function() {
			
			
			it( "setAttr() should add an attribute when unrendered", function() {
				var cmp = new Component();
				cmp.setAttr( 'data-myAttr', 'value' );
				
				cmp.render( 'body' );
				expect( cmp.getEl().attr( 'data-myAttr' ) ).toBe( 'value' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setAttr() should overwrite an attribute when unrendered", function() {
				var cmp = new Component( { 
					attr: { 'data-myAttr' : 'value' } 
				} );
				cmp.setAttr( 'data-myAttr', 'value2' );
				
				cmp.render( 'body' );
				expect( cmp.getEl().attr( 'data-myAttr' ) ).toBe( 'value2' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setAttr() should add an attribute when rendered", function() {
				var cmp = new Component( { renderTo: 'body' } );
				
				cmp.setAttr( 'data-myAttr', 'value' );
				expect( cmp.getEl().attr( 'data-myAttr' ) ).toBe( 'value' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setAttr() should overwrite an attribute when rendered", function() {
				var cmp = new Component( { 
					renderTo: 'body',
					attr: { 'data-myAttr' : 'value' } 
				} );
				
				cmp.setAttr( 'data-myAttr', 'value2' );
				expect( cmp.getEl().attr( 'data-myAttr' ) ).toBe( 'value2' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "setAttr() should add a set of attributes when unrendered", function() {
				var cmp = new Component();
				
				cmp.setAttr( { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } );
				
				cmp.render( 'body' );
				expect( cmp.getEl().attr( 'data-myAttr1' ) ).toBe( 'value1' );  // 
				expect( cmp.getEl().attr( 'data-myAttr2' ) ).toBe( 'value2' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setAttr() should overwrite a set of attributes when unrendered", function() {
				var cmp = new Component( {
					attr: { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } 
				} );
				
				cmp.setAttr( { 'data-myAttr1': 'value1_new', 'data-myAttr2': 'value2_new' } );
				
				cmp.render( 'body' );
				expect( cmp.getEl().attr( 'data-myAttr1' ) ).toBe( 'value1_new' );  // 
				expect( cmp.getEl().attr( 'data-myAttr2' ) ).toBe( 'value2_new' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setAttr() should add a set of attributes when rendered", function() {
				var cmp = new Component( {
					renderTo: 'body' 
				} );
				
				cmp.setAttr( { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } );
				
				expect( cmp.getEl().attr( 'data-myAttr1' ) ).toBe( 'value1' );  // 
				expect( cmp.getEl().attr( 'data-myAttr2' ) ).toBe( 'value2' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setAttr() should overwrite a set of attributes when rendered", function() {
				var cmp = new Component( {
					renderTo: 'body',
					attr: { 'data-myAttr1': 'value1', 'data-myAttr2': 'value2' } 
				} );
				
				cmp.setAttr( { 'data-myAttr1': 'value1_new', 'data-myAttr2': 'value2_new' } );
				
				expect( cmp.getEl().attr( 'data-myAttr1' ) ).toBe( 'value1_new' );  // 
				expect( cmp.getEl().attr( 'data-myAttr2' ) ).toBe( 'value2_new' );  // 
				
				cmp.destroy();  // clean up
			} );
		} );
		
		
		/*
		 * Test addCls()
		 */
		describe( "Test addCls()", function() {
			
			
			it( "should add a CSS class when unrendered", function() {
				var cmp = new Component();
				cmp.addCls( 'testCls' );
				
				// Now render and check if the class is on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should add a CSS class when unrendered, and when it has an initial css class", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls' );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should add multiple, space-delimited CSS classes when unrendered", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls1 testCls2' );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls1' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls2' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should not add a duplicate CSS class when unrendered", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'initialCls' );
				
				// We have to check the private 'cls' property to fully check this
				expect( cmp.cls ).toBe( 'initialCls' );  // 
				
				// Now render and check if the class is on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should not add duplicate CSS classes when unrendered", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls1 testCls1 initialCls' );
				
				// We have to check the private 'cls' property to fully check this
				expect( cmp.cls ).toBe( 'initialCls testCls1' );  // 
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls1' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			
			it( "should add a CSS class when rendered", function() {
				var cmp = new Component( { renderTo: document.body } );
				cmp.addCls( 'testCls' );
				
				// Now check if the class is on it
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should add multiple, space-delimited CSS classes when rendered", function() {
				var cmp = new Component( { renderTo: document.body } );
				cmp.addCls( 'testCls1 testCls2' );
				
				// Now check if the classes are on it
				expect( cmp.getEl().hasClass( 'testCls1' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls2' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should not add a duplicate CSS class when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'initialCls' } );
				cmp.addCls( 'initialCls' );
				
				// Need to pull off the className for the element to fully check this
				var re = /initialCls/g;
				expect( cmp.getEl()[ 0 ].className.match( re ).length ).toBe( 1 );
				
				// Now double check that the class is on it correctly
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "should not add duplicate CSS classes when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'initialCls' } );
				cmp.addCls( 'initialCls testCls testCls' );
				
				// Need to pull off the className for the element to fully check this
				var re = /initialCls/g;
				expect( cmp.getEl()[ 0 ].className.match( re ).length ).toBe( 1 );
				
				// Now check if the classes are on it
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );
				
				cmp.destroy();  // clean up
			} );
		} );
		
		
		/*
		 * Test removeCls()
		 */
		describe( "Test removeCls()", function() {
			
			it( "removeCls() should remove a CSS class when unrendered", function() {
				var cmp = new Component();
				cmp.addCls( 'testCls1 testCls2' );
				cmp.removeCls( 'testCls1' );				
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'testCls1' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'testCls2' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "removeCls() should remove a CSS class when unrendered, and when it has an initial css class", function() {
				var cmp = new Component( { cls: 'initialCls testCls' } );
				cmp.removeCls( 'initialCls' );
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "removeCls() should remove multiple, space-delimited CSS classes when unrendered", function() {
				var cmp = new Component( { cls: 'initialCls1 initialCls2 initialCls3' } );
				cmp.removeCls( 'initialCls1 initialCls2' );
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls1' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'initialCls2' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'initialCls3' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "removeCls() should remove multiple, space-delimited CSS classes when unrendered (removing the last CSS class)", function() {
				var cmp = new Component( { cls: 'initialCls1 initialCls2 initialCls3' } );
				cmp.removeCls( 'initialCls1 initialCls3' );
				
				// Now render and check if the correct class(es) are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls1' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'initialCls2' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'initialCls3' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "removeCls() should remove a CSS class when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'initialCls1 initialCls2' } );
				cmp.removeCls( 'initialCls1' );
				
				// Now check if the correct class(es) are on it
				expect( cmp.getEl().hasClass( 'initialCls1' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'initialCls2' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "removeCls() should remove multiple, space-delimited CSS classes when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'initialCls1 initialCls2 initialCls3' } );
				cmp.removeCls( 'initialCls1 initialCls2' );
				
				// Now check if the correct class(es) are on it
				expect( cmp.getEl().hasClass( 'initialCls1' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'initialCls2' ) ).toBe( false );  // 
				expect( cmp.getEl().hasClass( 'initialCls3' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
		} );


		/*
		 * Test toggleCls()
		 */
		describe( "Test toggleCls()", function() {
			
			// Tests with simply swapping the css class in and out
			
			it( "toggleCls() should add a CSS class if it is not yet applied (when the component is unrendered)", function() {
				var cmp = new Component();
				cmp.toggleCls( 'testCls1' );
				
				expect( cmp.hasCls( 'testCls1' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "toggleCls() should add a CSS class if it is not yet applied (when the component is rendered)", function() {
				var cmp = new Component( { renderTo: document.body } );
				cmp.toggleCls( 'testCls1' );
				
				expect( cmp.hasCls( 'testCls1' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "toggleCls() should remove a CSS class if it is already applied (when then component is unrendered)", function() {
				var cmp = new Component( { cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1' );
				
				expect( cmp.hasCls( 'testCls1' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "toggleCls() should remove a CSS class if it is already applied (when then component is rendered)", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1' );
				
				expect( cmp.hasCls( 'testCls1' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
			
			// --------------------------------
			
			
			// Tests with the `flag` argument
			
			it( "toggleCls() should add a CSS class when flag === true", function() {
				var cmp = new Component();
				cmp.toggleCls( 'testCls1', /* flag */ true );
				
				expect( cmp.hasCls( 'testCls1' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "toggleCls() should basically leave the CSS class alone if it's already there and flag === true", function() {
				var cmp = new Component( { cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1', /* flag */ true );
				
				expect( cmp.hasCls( 'testCls1' ) ).toBe( true );  // 
				
				// As a double check, test the actual `cls` property
				expect( cmp.cls ).toBe( 'testCls1' );  // The `cls` property should have exactly 'testCls1'
				
				cmp.destroy();  // clean up
			} );
			

			it( "toggleCls() should remove a CSS class when flag === false", function() {
				var cmp = new Component( { cls: 'testCls1' } );
				cmp.toggleCls( 'testCls1', /* flag */ false );

				expect( cmp.hasCls( 'testCls1' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
			

			it( "toggleCls() should basically leave the CSS class alone if it's not there and flag === false", function() {
				var cmp = new Component();
				cmp.toggleCls( 'testCls1', /* flag */ false );

				expect( cmp.hasCls( 'testCls1' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
		} );
		
		
		/*
		 * Test hasCls()
		 */
		describe( "Test hasCls()", function() {
			
			it( "hasCls() should determine if the component has a class when unrendered", function() {
				var cmp = new Component( { cls: 'testCls1' } );
				expect( cmp.hasCls( 'testCls1' ) ).toBe( true );  // 
				expect( cmp.hasCls( 'testCls2' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "hasCls() should determine if the component has a class when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'testCls1' } );
				expect( cmp.hasCls( 'testCls1' ) ).toBe( true );  // 
				expect( cmp.hasCls( 'testCls2' ) ).toBe( false );  // 
				
				cmp.destroy();  // clean up
			} );
		} );
		
		
		/*
		 * Test setStyle()
		 */
		describe( "Test setStyle()", function() {
			
			it( "setStyle() should add a style property when unrendered", function() {
				var cmp = new Component();
				cmp.setStyle( 'margin-left', '1px' );
				
				cmp.render( 'body' );
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '1px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setStyle() should overwrite a style property when unrendered", function() {
				var cmp = new Component( { 
					attr: { 'margin-left' : '1px' } 
				} );
				cmp.setStyle( 'margin-left', '2px' );
				
				cmp.render( 'body' );
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '2px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setStyle() should add a style property when rendered", function() {
				var cmp = new Component( { renderTo: 'body' } );
				
				cmp.setStyle( 'margin-left', '1px' );
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '1px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setStyle() should overwrite a style property when rendered", function() {
				var cmp = new Component( { 
					renderTo: 'body',
					attr: { 'margin-left' : '1px' } 
				} );
				
				cmp.setStyle( 'margin-left', '2px' );
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '2px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "setStyle() should add a set of style properties when unrendered", function() {
				var cmp = new Component();
				
				cmp.setStyle( { 'margin-left': '1px', 'margin-right': '2px' } );
				
				cmp.render( 'body' );
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '1px' );  // 
				expect( cmp.getEl().css( 'margin-right' ) ).toBe( '2px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setStyle() should overwrite a set of style properties when unrendered", function() {
				var cmp = new Component( {
					attr: { 'margin-left': '1px', 'margin-right': '2px' } 
				} );
				
				cmp.setStyle( { 'margin-left': '3px', 'margin-right': '4px' } );
				
				cmp.render( 'body' );
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '3px' );  // 
				expect( cmp.getEl().css( 'margin-right' ) ).toBe( '4px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setStyle() should add a set of style properties when rendered", function() {
				var cmp = new Component( {
					renderTo: 'body' 
				} );
				
				cmp.setStyle( { 'margin-left': '1px', 'margin-right': '2px' } );
				
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '1px' );  // 
				expect( cmp.getEl().css( 'margin-right' ) ).toBe( '2px' );  // 
				
				cmp.destroy();  // clean up
			} );
			
			it( "setStyle() should overwrite a set of style properties when rendered", function() {
				var cmp = new Component( {
					renderTo: 'body',
					attr: { 'margin-left': '1px', 'margin-right': '2px' } 
				} );
				
				cmp.setStyle( { 'margin-left': '3px', 'margin-right': '4px' } );
				
				expect( cmp.getEl().css( 'margin-left' ) ).toBe( '3px' );  // 
				expect( cmp.getEl().css( 'margin-right' ) ).toBe( '4px' );  // 
				
				cmp.destroy();  // clean up
			} );
		} );
		
		
		
		// -------------------------
		
		
		/*
		 * Test setSize()
		 */
		describe( "Test setSize()", function() {
			
			beforeEach( function() {
				this.cmp = new Component();
			} );
			
			afterEach( function() {
				this.cmp.destroy();  // clean up
			} );
			
			
			it( "setSize() should set the width and height of the Component in an unrendered state", function() {
				var cmp = this.cmp;
				cmp.setSize( 10, 20 );
				
				expect( cmp.getConfiguredWidth() ).toBe( 10 );  // The width should have been set
				expect( cmp.getConfiguredHeight() ).toBe( 20 );  // The height should have been set
			} );
			
			it( "setSize() should set the width and height of the Component in a rendered state", function() {
				var cmp = this.cmp;
				
				cmp.render( 'body' );
				cmp.setStyle( 'position', 'absolute' );
				cmp.setSize( 10, 20 );
				
				expect( cmp.getWidth() ).toBe( 10 );  // The width should have been set
				expect( cmp.getHeight() ).toBe( 20 );  // The height should have been set
			} );
			
			
			it( "setSize() should set the width only if that is the only argument provided to the method", function() {
				var cmp = this.cmp;
				cmp.setSize( 10, 20 );  // initial
				
				expect( cmp.getConfiguredWidth() ).toBe( 10 );  // Initial condition: The width should have been set
				expect( cmp.getConfiguredHeight() ).toBe( 20 );  // Initial condition: The height should have been set
				
				// Now change with just with width
				cmp.setSize( 42, undefined );  // undefined for height
				expect( cmp.getConfiguredWidth() ).toBe( 42 );  // The width should have been set
				expect( cmp.getConfiguredHeight() ).toBe( 20 );  // The height should remain unchanged
			} );
			
			it( "setSize() should set the height only if that is the only argument provided to the method", function() {
				var cmp = this.cmp;
				cmp.setSize( 10, 20 );  // initial
				
				expect( cmp.getConfiguredWidth() ).toBe( 10 );  // Initial condition: The width should have been set
				expect( cmp.getConfiguredHeight() ).toBe( 20 );  // Initial condition: The height should have been set
				
				// Now change with just with width
				cmp.setSize( undefined, 42 );  // undefined for width
				expect( cmp.getConfiguredWidth() ).toBe( 10 );  // The width should remain unchanged
				expect( cmp.getConfiguredHeight() ).toBe( 42 );  // The height should have been set
			} );
		} );
		
		
		
		/*
		 * Test setWidth()
		 */
		describe( "Test setWidth()", function() {
			var cmp;
			
			beforeEach( function() {
				cmp = new Component();
			} );
			
			afterEach( function() {
				cmp.destroy();  // clean up
			} );
			
			
			it( "setWidth() should set the width of the Component in an unrendered state", function() {
				cmp.setWidth( 10 );
				
				expect( cmp.getConfiguredWidth() ).toBe( 10 );  // The width should have been set
			} );
			
			it( "setWidth() should set the width of the Component in a rendered state", function() {				
				cmp.render( 'body' );
				cmp.setStyle( 'position', 'absolute' );
				cmp.setWidth( 10 );
				
				expect( cmp.getWidth() ).toBe( 10 );  // The width should have been set
			} );
		} );
		
		
		
		/*
		 * Test setHeight()
		 */
		describe( "Test setHeight()", function() {
			var cmp;
			
			beforeEach( function() {
				cmp = new Component();
			} );
			
			afterEach( function() {
				cmp.destroy();  // clean up
			} );
			
			
			it( "setHeight() should set the height of the Component in an unrendered state", function() {
				cmp.setHeight( 10 );
				
				expect( cmp.getConfiguredHeight() ).toBe( 10 );  // The height should have been set
			} );
			
			it( "setHeight() should set the height of the Component in a rendered state", function() {
				cmp.render( 'body' );
				cmp.setStyle( 'position', 'absolute' );
				cmp.setHeight( 10 );
				
				expect( cmp.getHeight() ).toBe( 10 );  // The height should have been set
			} );
		} );
		
		
		
		// -------------------------
		
		
		/*
		 * Test detach()
		 */
		describe( "Test detach()", function() {
			
			it( "detach() should have no effect on an unrendered Component", function() {
				var cmp = new Component();
				cmp.detach();
				
				// Test should simply not error (making sure we check the unrendered case before trying to access cmp.$el)
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "detach() should detach the element from the DOM if it is rendered", function() {
				var cmp = new Component( {
					elId : "__ComponentTest_detachMethod_el",
					renderTo: 'body'
				} );
				
				// Attach a click handler onto the element, to make sure that the element is simply detached, and not removed
				var clickCount = 0;
				cmp.getEl().bind( 'click', function() { clickCount++; } );
				
				expect( jQuery( '#__ComponentTest_detachMethod_el' ).length ).toBe( 1 );  // Initial condition: The element should be in the DOM
				expect( clickCount ).toBe( 0 );  // Initial condition: the click count should be 0
				
				// Now detach
				cmp.detach();
				expect( jQuery( '#__ComponentTest_detachMethod_el' ).length ).toBe( 0 );  // The element should no longer be in the DOM
				
				// And re-attach via render()
				cmp.render( 'body' );
				expect( jQuery( '#__ComponentTest_detachMethod_el' ).length ).toBe( 1 );  // The element should be in the DOM again after being re-attached
				
				// Should still be able to "click" the component (as it was only detached, not removed)
				cmp.getEl().trigger( 'click' );
				expect( clickCount ).toBe( 1 );  // The element should still have been able to be clicked (as it was only detached, not removed)
				
				
				cmp.destroy();  // clean up
			} );
		} );
		
		
		// -------------------------
		
		
		// TODO: Add masking tests
		
		
		// -------------------------
			
		describe( "bubble()", function() {
			it( "bubble", function() {
				// Test that the ID's can be compiled from a component's parents
				var component = new Component( {
					id : "component"
				} );
				var container = new Container( {
					id : "container1",
					
					items : {
						id : "container2",
						
						items : component 
					}
				} );
				
				var ids = [];
				component.bubble( function( cmp ) {
					ids.push( cmp.getId() );
				} );
				expect( ids ).toEqual( [ "component", "container2", "container1" ] );  // "ids not retrieved properly through the bubble.  
				
				
				// Test returning false after "container2" is reached
				ids = [];
				component.bubble( function( cmp ) {
					ids.push( cmp.getId() );
					if( cmp.getId() === "container2" ) {
						return false;
					}
				} );
				expect( ids ).toEqual( [ "component", "container2" ] );  // ids not retrieved properly through the bubble, when attempting to cancel at container2  
				
			} );
			
			
			
			/*
			 * Test Component.findParentBy()
			 */
			it( "findParentBy", function() {
				// Test with one level of children, one item
				var child = new Component( {
					id: 'child'
				} );
				var container = new Container( {
					id: 'parent',
					
					items: child
				} );
				
				var parentContainer = child.findParentBy( function( cmp ) {
					if( cmp.getId() === 'parent' ) {
						return true;
					}
				} );
				expect( _.isObject( parentContainer ) ).toBe( true );  // Container not retrieved from child at first level.
				expect( parentContainer ).toBe( container );  // parentContainer that was retrieved does not match the actual container.
				
				
				// Quick test to make sure that searching for a parent container that doesn't exist returns null
				parentContainer = child.findParentBy( function( cmp ) {
					if( cmp.getId() === 'non-existent' ) { 
						return true;
					}
				} );
				expect( parentContainer ).toBe( null );  // findParentBy returned a non-null value when searching for a non-existent Container
				
				
				// ----------------------------
				
				
				// Test with one level of children, multiple items
				container = new Container( {
					id: 'parent',
					
					items: [
						{ type : 'component', id : 'myKey1' },
						{ type : 'component', id : 'myKey2' },
						{ type : 'component', id : 'myKey3' },
						{ type : 'component', id : 'myKey4' }
					]
				} );
				
				// Test them all, to make sure the first, the middle ones, and the last one can retrieve their parent
				var findFn = function( cmp ) {
					if( cmp.getId() === 'parent' ) {
						return true;
					}
				};
				for( var i = 1; i <= 4; i++ ) {
					child = container.findById( 'myKey' + i );
					parentContainer = child.findParentBy( findFn );
					expect( parentContainer ).toBe( container );  // child " + i + " could not retrieve its parent from first level children.
				}
				
				
				// ----------------------------
				
				
				// Test with multiple levels of children, multiple items
				container = new Container( {
					id: 'parent',
					
					items: [
						{ 
							type  : 'Container', 
							items : [
								{ type : 'component', id : 'myKey1' }
							]
						},
						
						{ type : 'component', id : 'myKey2' },
						
						{
							type  : 'Container',
							items : [
								{ type : 'component', id : 'myKey3' },
								{ type : 'component', id : 'myKey4' },
								{
									type  : 'Container',
									items : [
										{ type : 'component', id : 'myKey5' },
										{ type : 'component', id : 'myKey6' },
										{ type : 'component', id : 'myKey7' }
									]
								}
							]
						}
					]
				} );
				
				// Test them all, to make sure that their highest level parent can be retrieved at any level
				var findFn2 = function( cmp ) {
					if( cmp.getId() === 'parent' ) {
						return true;
					}
				};
				for( i = 1; i <= 7; i++ ) {
					child = container.findById( 'myKey' + i );
					parentContainer = child.findParentBy( findFn2 );
					expect( parentContainer ).toBe( container );  // child " + i + " could not retrieve its parent from deep children.
				}
				
				
				// ----------------------------
				
				
				// Test with multiple levels of children, multiple items, and retrieving parents that may not be the root level parent
				container = new Container( {
					items: [
						{ 
							type  : 'Container', 
							items : [
								{ type : 'component', id : 'myKey1' }
							]
						},
						
						{ type : 'component', id : 'myKey2' },
						
						{
							type  : 'Container',
							id    : 'localParent',
							
							items : [
								{ type : 'component', id : 'myKey3' },
								{ type : 'component', id : 'myKey4' },
								{
									type  : 'Container',
									items : [
										{ type : 'component', id : 'myKey5' },
										{ type : 'component', id : 'myKey6' },
										{ type : 'component', id : 'myKey7' }
									]
								}
							]
						}
					]
				} );
				
				var parent = container.findById( 'localParent' );
				child = container.findById( 'myKey7' );
				parentContainer = child.findParentBy( function( cmp ) {
					if( cmp.getId() === 'localParent' ) {
						return true;
					}
				} );
				expect( parentContainer ).toBe( parent );  // looking from deep child to find a parent other than the root parent did not work
				
			} );
			
			
			
			/*
			 * Test Component.findParentByType
			 */
			
			// NOTE!!! If un-ignoring this test, uncomment commented lines below
			xit( "findParentByType", function() {
				var container = new Container( {
					id: 'parent',
					
					items: [
						{ 
							type  : 'Tabs',
							id    : 'parentTabs',
							
							items : [
								{ type : 'component', id: "testChild1" },
								{ type : 'component', id: "testChild2" }
							]
						},
						
						{ type : 'component', id : 'myKey1' },
						
						{
							type  : 'Container',
							id    : 'parentContainer',
							
							items : [
								{ type : 'component', id : 'myKey2' },
								{ type : 'component', id : 'myKey3' },
								{
									type  : 'Container',
									id    : 'parentContainer2',
									items : [
										{ type : 'component', id : 'myKey4' },
										{ type : 'component', id : 'myKey5' },
										{ type : 'component', id : 'myKey6' }
									]
								}
							]
						}
					]
				} );
				
				// Test checking against the actual constructor function
				var myKey1 = container.findById( 'myKey1' );
				expect( myKey1.findParentByType( Container ) ).toBe( container );  // Outer container not found from myKey1
				
				var parentTabs = container.findById( 'parentTabs' );
				var testChild1 = container.findById( 'testChild1' );
				var testChild2 = container.findById( 'testChild2' );
				//expect( testChild1.findParentByType( ui.containers.TabsContainer ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild1
				//expect( testChild2.findParentByType( ui.containers.TabsContainer ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild2
				
				var parentContainer = container.findById( 'parentContainer' );
				var myKey2 = container.findById( 'myKey2' );
				expect( myKey2.findParentByType( Container ) ).toBe( parentContainer );  // parentContainer not found from myKey2
				
				var parentContainer2 = container.findById( 'parentContainer2' );
				var myKey5 = container.findById( 'myKey5' );
				expect( myKey5.findParentByType( Container ) ).toBe( parentContainer2 );  // parentContainer2 not found from myKey5
				
				
				// Test checking against the type name
				myKey1 = container.findById( 'myKey1' );
				expect( myKey1.findParentByType( 'Container' ) ).toBe( container );  // Outer container not found from myKey1 by type name
				
				parentTabs = container.findById( 'parentTabs' );
				testChild1 = container.findById( 'testChild1' );
				testChild2 = container.findById( 'testChild2' );
				expect( testChild1.findParentByType( 'Tabs' ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild1 by type name
				expect( testChild2.findParentByType( 'Tabs' ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild2 by type name
				
				parentContainer = container.findById( 'parentContainer' );
				myKey2 = container.findById( 'myKey2' );
				expect( myKey2.findParentByType( 'Container' ) ).toBe( parentContainer );  // parentContainer not found from myKey2 by type name
				
				parentContainer2 = container.findById( 'parentContainer2' );
				myKey5 = container.findById( 'myKey5' );
				expect( myKey5.findParentByType( 'Container' ) ).toBe( parentContainer2 );  // parentContainer2 not found from myKey5 by type name
			} );
			
			
			
			/*
			 * Test findParentById()
			 */
			it( "findParentById", function() {
				var cmps = [];
				for( var i = 0; i < 7; i++ ) {
					cmps.push( new Component() );
				}
				
				var container = new Container( {
					id: 'top',
					
					items: [
						{ 
							type  : 'Container', 
							id    : 'first',
							
							items : [
								cmps[ 0 ]
							]
						},
						
						cmps[ 1 ],
						
						{
							type  : 'Container',
							id    : 'second',
							
							items : [
								cmps[ 2 ],
								cmps[ 3 ],
								{
									type  : 'Container',
									id    : 'second_nested',
									
									items : [
										cmps[ 4 ],
										cmps[ 5 ],
										cmps[ 6 ]
									]
								}
							]
						}
					]
				} );
				
				
				// Tests just getting parents
				expect( cmps[ 0 ].findParentById( 'non-existent-container-id' ) ).toBe( null );  // Null not returned when finding a parent called non-existent-container-id from cmps[ 0 ].
				expect( cmps[ 0 ].findParentById( 'top' ) ).toBe( container );  // Top level Container not found from cmps[ 0 ]
				expect( cmps[ 0 ].findParentById( 'first' ) ).toBe( container.findById( 'first' ) );  // Container 'first' not found from cmps[ 0 ]
				expect( cmps[ 0 ].findParentById( 'second' ) ).toBe( null );  // Container 'second' was somehow found from myKey1, even though it is not a parent of cmps[ 0 ].
				
				expect( cmps[ 1 ].findParentById( 'top' ) ).toBe( container );  // Top level Container not found from cmps[ 1 ]
				expect( cmps[ 1 ].findParentById( 'first' ) ).toBe( null );  // Container 'first' was somehow found from cmps[ 1 ], even though it is not a parent of cmps[ 1 ].
				
				expect( cmps[ 6 ].findParentById( 'non-existent-container-id' ) ).toBe( null );  // Null not returned when finding a parent called non-existent-container-id from cmps[ 6 ].
				expect( cmps[ 6 ].findParentById( 'top' ) ).toBe( container );  // Top level Container not found from cmps[ 6 ]
				expect( cmps[ 6 ].findParentById( 'first' ) ).toBe( null );  // Container 'first' was somehow found from cmps[ 6 ], even though it is not a parent of cmps[ 6 ].
				expect( cmps[ 6 ].findParentById( 'top' ) ).toBe( container );  // Top level Container not found from cmps[ 6 ]
				expect( cmps[ 6 ].findParentById( 'second' ) ).toBe( cmps[ 6 ].findParentById( 'second' ) );  // Container 'second' not found from cmps[ 6 ]
				expect( cmps[ 6 ].findParentById( 'second_nested' ) ).toBe( cmps[ 6 ].findParentById( 'second_nested' ) );  // Container 'second_nested' not found from cmps[ 6 ]
			} );
		} );   // eo "General Tests" test case
		
		
		
		
		
		/*
		 * Test Component.destroy() 
		 */
		describe( "Test Component.destroy()", function() {
			
			it( "destroy() should remove all event handlers", function() {
				var component = new Component( {
					listeners : {
						'render'        : function() {},
						'beforedestroy' : function() {},
						'destroy'       : function() {} 
					}
				} );
				
				expect( component.hasListener( 'render' ) ).toBe( true );  // failed on initial condition. render event should have listener at this point.
				expect( component.hasListener( 'beforedestroy' ) ).toBe( true );  // failed on initial condition. beforedestroy event should have listener at this point.
				expect( component.hasListener( 'destroy' ) ).toBe( true );  // failed on initial condition. destroy event should have listener at this point.
				component.destroy();
				expect( component.hasListener( 'render' ) ).toBe( false );  // error: render event should no longer have any listeners.
				expect( component.hasListener( 'beforedestroy' ) ).toBe( false );  // error: beforedestroy event should no longer have any listeners.
				expect( component.hasListener( 'destroy' ) ).toBe( false );  // error: destroy event should no longer have any listeners.
			} );
			
			
			it( "destroy() should set the 'destroyed' flag to true after destruction", function() {
				var component = new Component();
				expect( component.destroyed ).toBe( false );  // failed on initial condition. destroyed flag should be false.
				
				component.destroy();
				expect( component.destroyed ).toBe( true );  // destroyed flag should now be true.
			} );
			
			
			it( "destroy() should set the 'rendered' flag back to false after destruction", function() {
				var component = new Component( {
					renderTo: jQuery( 'body' )
				} );
				expect( component.rendered ).toBe( true );  // failed on initial condition. rendered flag should be true.
				
				component.destroy();
				expect( component.rendered ).toBe( false );  // rendered flag should now be false.
			} );
			
			
			it( "A beforedestroy handler should be able to cancel the destruction process", function() {
				var component = new Component( {
					listeners : {
						'beforedestroy' : function() {
							return false;
						}
					}
				} );
				component.destroy();
				expect( component.destroyed ).toBe( false );  // the component has been destroyed, even though a beforedestroy handler returned false (which should have canceled the destruction process)
			} );
			
			
			it( "destroy() should not destroy the component more than once", function() {
				var destroyCount = 0;
				var component = new Component( {
					// template method override
					onDestroy : function() {
						Component.prototype.onDestroy.call( this );
						
						destroyCount++;
					}
				} );
				component.destroy();
				expect( component.destroyed ).toBe( true );  // component should now be destroyed
				expect( destroyCount ).toBe( 1 );  // destroyCount should now be 1
				
				component.destroy();  // attempt to destroy the component again
				expect( destroyCount ).toBe( 1 );  // destroyCount should still be 1, not 2. the component should not have been destroyed twice
			} );
			
			
			it( "destroy() should remove the Component's element from the DOM (if the Component is rendered)", function() {
				var component = new Component( {
					renderTo: jQuery( 'body' )
				} );
				var $componentEl = component.getEl();
				
				expect( component.rendered ).toBe( true );  // Failed on initial condition. Component should be rendered
				expect( jQuery( 'body' ).has( $componentEl ).length > 0 ).toBe( true );  // Failed on initial condition. component's element should be in the document body
				
				component.destroy();
				expect( jQuery( 'body' ).has( $componentEl ).length === 0 ).toBe( true );  // The component's element should now be removed from the document body
			} );
			
			
			it( "destroy() should remove all HTMLElement and jQuery references held by a Component upon destruction", function() {
				// Create a Component subclass that creates an HTML element and a jQuery wrapped set
				var ComponentSubClass = Class.extend( Component, {
					initComponent : function() {
						this.$wrappedSet = jQuery( '<div />' );
						this.divElement = document.createElement( 'DIV' );
					}
				} );
				
				var myComponent = new ComponentSubClass();
				
				// Initial conditions
				expect( myComponent.$wrappedSet instanceof jQuery ).toBe( true );  // $wrappedSet should initially be a jQuery wrapped set
				expect( _.isElement( myComponent.divElement ) ).toBe( true );  // divElement should initially be an HTMLElement
				
				myComponent.destroy();
				
				expect( myComponent.$wrappedSet ).toBeUndefined();  // "$wrappedSet property (a jQuery object) should have been deleted from the object" );
				expect( myComponent.divElement ).toBeUndefined();   // "divElement property (an HTMLElement) should have been deleted from the object" );
			} );
			
			
			it( "destroy() should remove all HTMLElement and jQuery references held by a Component from the DOM upon destruction", function() {
				// Create a Component subclass that creates an HTML element and a jQuery wrapped set
				var ComponentSubClass = Class.extend( Component, {
					initComponent : function() {
						// NOTE: These two elements are intentionally not appended to the Component's element, so that the automatic recursive
						// removal of $el does not effect them. It is possible that Components add elements in other places in the DOM, such as
						// with the overlay dropdown menu in ui.form.field.Dropdown.
						this.$wrappedSet = jQuery( '<div id="ui-component-test-destruction-1" />' )
							.appendTo( document.body );
						
						this.divElement = document.createElement( 'DIV' );
						this.divElement.id = "ui-component-test-destruction-2";
						document.body.appendChild( this.divElement );
					}
				} );
				
				var myComponent = new ComponentSubClass();
				
				// Initial conditions - elements should exist in the DOM
				expect( document.getElementById( 'ui-component-test-destruction-1' ) ).not.toBe( null );  // The wrapped set's element ($wrappedSet[0]) should initially exist in the DOM
				expect( document.getElementById( 'ui-component-test-destruction-2' ) ).not.toBe( null );  // The HTMLElement (divElement) should initially exist in the DOM
				
				myComponent.destroy();
				
				expect( document.getElementById( 'ui-component-test-destruction-1' ) ).toBe( null );  // The wrapped set's element ($wrappedSet[0]) should no longer exist in the DOM
				expect( document.getElementById( 'ui-component-test-destruction-2' ) ).toBe( null );  // The HTMLElement (divElement) should no longer exist in the DOM
			} );
			
		} );  // eo destroy() tests
	
	} );
	
} );
