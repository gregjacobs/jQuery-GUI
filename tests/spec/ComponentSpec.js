/*global define, describe, xdescribe, it, xit, expect, beforeEach, afterEach */
define( [
	'jquery',
	'lodash',
	'Class',
	'ui/plugin/Plugin',
	'ui/Component'//,
	//'ui/Container'
],
function( jQuery, _, Class, Plugin, Component, Container ) {
	
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
			
			
		
		describe( 'hide()', function() {
			var component;
			
			beforeEach( function() {
				component = new Component();
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
		} );
			
			
		describe( 'show()', function() {
			var component;
			
			beforeEach( function() {
				component = new Component();
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
				
				component.destroy();
			} );
			
			
			// -------------------
			
			
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
			
			
			it( "addCls() should add a CSS class when unrendered", function() {
				var cmp = new Component();
				cmp.addCls( 'testCls' );
				
				// Now render and check if the class is on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should add a CSS class when unrendered, and when it has an initial css class", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls' );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should add multiple, space-delimited CSS classes when unrendered", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'testCls1 testCls2' );
				
				// Now render and check if the classes are on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls1' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls2' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should not add a duplicate CSS class when unrendered", function() {
				var cmp = new Component( { cls: 'initialCls' } );
				cmp.addCls( 'initialCls' );
				
				// We have to check the private 'cls' property to fully check this
				expect( cmp.cls ).toBe( 'initialCls' );  // 
				
				// Now render and check if the class is on it
				cmp.render( document.body );
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should not add duplicate CSS classes when unrendered", function() {
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
			
			
			
			it( "addCls() should add a CSS class when rendered", function() {
				var cmp = new Component( { renderTo: document.body } );
				cmp.addCls( 'testCls' );
				
				// Now check if the class is on it
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should add multiple, space-delimited CSS classes when rendered", function() {
				var cmp = new Component( { renderTo: document.body } );
				cmp.addCls( 'testCls1 testCls2' );
				
				// Now check if the classes are on it
				expect( cmp.getEl().hasClass( 'testCls1' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls2' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should not add a duplicate CSS class when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'initialCls' } );
				cmp.addCls( 'initialCls' );
				
				// Need to pull off the className for the element to fully check this
				expect( cmp.getEl()[ 0 ].className ).toBe( 'initialCls' );  // 
				
				// Now check if the class is on it
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				
				cmp.destroy();  // clean up
			} );
			
			
			it( "addCls() should not add duplicate CSS classes when rendered", function() {
				var cmp = new Component( { renderTo: document.body, cls: 'initialCls' } );
				cmp.addCls( 'initialCls testCls testCls' );
				
				// Need to pull off the className for the element to fully check this
				expect( cmp.getEl()[ 0 ].className ).toBe( 'initialCls testCls' );  // 
				
				// Now check if the classes are on it
				expect( cmp.getEl().hasClass( 'initialCls' ) ).toBe( true );  // 
				expect( cmp.getEl().hasClass( 'testCls' ) ).toBe( true );  // 
				
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
			
		xdescribe( "bubble()", function() {
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
						{ type : 'Text', key : 'myKey1' },
						{ type : 'Text', key : 'myKey2' },
						{ type : 'Text', key : 'myKey3' },
						{ type : 'Text', key : 'myKey4' }
					]
				} );
				
				// Test them all, to make sure the first, the middle ones, and the last one can retrieve their parent
				var findFn = function( cmp ) {
					if( cmp.getId() === 'parent' ) {
						return true;
					}
				};
				for( var i = 1; i <= 4; i++ ) {
					child = container.findByKey( 'myKey' + i );
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
								{ type : 'Text', key : 'myKey1' }
							]
						},
						
						{ type : 'Text', key : 'myKey2' },
						
						{
							type  : 'Container',
							items : [
								{ type : 'Text', key : 'myKey3' },
								{ type : 'Text', key : 'myKey4' },
								{
									type  : 'Container',
									items : [
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' },
										{ type : 'Text', key : 'myKey7' }
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
					child = container.findByKey( 'myKey' + i );
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
								{ type : 'Text', key : 'myKey1' }
							]
						},
						
						{ type : 'Text', key : 'myKey2' },
						
						{
							type  : 'Container',
							id    : 'localParent',
							
							items : [
								{ type : 'Text', key : 'myKey3' },
								{ type : 'Text', key : 'myKey4' },
								{
									type  : 'Container',
									items : [
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' },
										{ type : 'Text', key : 'myKey7' }
									]
								}
							]
						}
					]
				} );
				
				var parent = container.findById( 'localParent' );
				child = container.findByKey( 'myKey7' );
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
								{ type : 'Text', id: "testChild1" },
								{ type : 'Text', id: "testChild2" }
							]
						},
						
						{ type : 'Text', key : 'myKey1' },
						
						{
							type  : 'Container',
							id    : 'parentContainer',
							
							items : [
								{ type : 'Text', key : 'myKey2' },
								{ type : 'Text', key : 'myKey3' },
								{
									type  : 'Container',
									id    : 'parentContainer2',
									items : [
										{ type : 'Text', key : 'myKey4' },
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' }
									]
								}
							]
						}
					]
				} );
				
				// Test checking against the actual constructor function
				var myKey1 = container.findByKey( 'myKey1' );
				expect( myKey1.findParentByType( Container ) ).toBe( container );  // Outer container not found from myKey1
				
				var parentTabs = container.findById( 'parentTabs' );
				var testChild1 = container.findById( 'testChild1' );
				var testChild2 = container.findById( 'testChild2' );
				//expect( testChild1.findParentByType( ui.containers.TabsContainer ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild1
				//expect( testChild2.findParentByType( ui.containers.TabsContainer ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild2
				
				var parentContainer = container.findById( 'parentContainer' );
				var myKey2 = container.findByKey( 'myKey2' );
				expect( myKey2.findParentByType( Container ) ).toBe( parentContainer );  // parentContainer not found from myKey2
				
				var parentContainer2 = container.findById( 'parentContainer2' );
				var myKey5 = container.findByKey( 'myKey5' );
				expect( myKey5.findParentByType( Container ) ).toBe( parentContainer2 );  // parentContainer2 not found from myKey5
				
				
				// Test checking against the type name
				myKey1 = container.findByKey( 'myKey1' );
				expect( myKey1.findParentByType( 'Container' ) ).toBe( container );  // Outer container not found from myKey1 by type name
				
				parentTabs = container.findById( 'parentTabs' );
				testChild1 = container.findById( 'testChild1' );
				testChild2 = container.findById( 'testChild2' );
				expect( testChild1.findParentByType( 'Tabs' ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild1 by type name
				expect( testChild2.findParentByType( 'Tabs' ) ).toBe( parentTabs );  // Parent TabsContainer not found from testChild2 by type name
				
				parentContainer = container.findById( 'parentContainer' );
				myKey2 = container.findByKey( 'myKey2' );
				expect( myKey2.findParentByType( 'Container' ) ).toBe( parentContainer );  // parentContainer not found from myKey2 by type name
				
				parentContainer2 = container.findById( 'parentContainer2' );
				myKey5 = container.findByKey( 'myKey5' );
				expect( myKey5.findParentByType( 'Container' ) ).toBe( parentContainer2 );  // parentContainer2 not found from myKey5 by type name
			} );
			
			
			
			/*
			 * Test findParentById()
			 */
			it( "findParentById", function() {
				var container = new Container( {
					id: 'top',
					
					items: [
						{ 
							type  : 'Container', 
							id    : 'first',
							
							items : [
								{ type : 'Text', key : 'myKey1' }
							]
						},
						
						{ type : 'Text', key : 'myKey2' },
						
						{
							type  : 'Container',
							id    : 'second',
							
							items : [
								{ type : 'Text', key : 'myKey3' },
								{ type : 'Text', key : 'myKey4' },
								{
									type  : 'Container',
									id    : 'second_nested',
									
									items : [
										{ type : 'Text', key : 'myKey5' },
										{ type : 'Text', key : 'myKey6' },
										{ type : 'Text', key : 'myKey7' }
									]
								}
							]
						}
					]
				} );
				
				
				// Tests just getting parents
				var myKey1 = container.findByKey( 'myKey1' );
				expect( myKey1.getKey() ).toBe( 'myKey1' );  // Error with precondition of retrieving the correct Component (myKey1) with findByKey()
				expect( myKey1.findParentById( 'non-existent-container-id' ) ).toBe( null );  // Null not returned when finding a parent called non-existent-container-id from myKey1.
				expect( myKey1.findParentById( 'top' ) ).toBe( container );  // Top level Container not found from myKey1
				expect( myKey1.findParentById( 'first' ) ).toBe( container.findById( 'first' ) );  // Container 'first' not found from myKey1
				expect( myKey1.findParentById( 'second' ) ).toBe( null );  // Container 'second' was somehow found from myKey1, even though it is not a parent of myKey1.
				
				var myKey2 = container.findByKey( 'myKey2' );
				expect( myKey2.getKey() ).toBe( 'myKey2' );  // Error with precondition of retrieving the correct Component (myKey2) with findByKey()
				expect( myKey2.findParentById( 'top' ) ).toBe( container );  // Top level Container not found from myKey2
				expect( myKey2.findParentById( 'first' ) ).toBe( null );  // Container 'first' was somehow found from myKey2, even though it is not a parent of myKey2.
				
				var myKey7 = container.findByKey( 'myKey7' );
				expect( myKey7.getKey() ).toBe( 'myKey7' );  // Error with precondition of retrieving the correct Component (myKey7) with findByKey()
				expect( myKey7.findParentById( 'non-existent-container-id' ) ).toBe( null );  // Null not returned when finding a parent called non-existent-container-id from myKey7.
				expect( myKey7.findParentById( 'top' ) ).toBe( container );  // Top level Container not found from myKey7
				expect( myKey7.findParentById( 'first' ) ).toBe( null );  // Container 'first' was somehow found from myKey7, even though it is not a parent of myKey7.
				expect( myKey7.findParentById( 'top' ) ).toBe( container );  // Top level Container not found from myKey1
				expect( myKey7.findParentById( 'second' ) ).toBe( myKey7.findParentById( 'second' ) );  // Container 'second' not found from myKey7
				expect( myKey7.findParentById( 'second_nested' ) ).toBe( myKey7.findParentById( 'second_nested' ) );  // Container 'second_nested' not found from myKey7
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
						// with the overlay dropdown menu in ui.formFields.DropdownField.
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
