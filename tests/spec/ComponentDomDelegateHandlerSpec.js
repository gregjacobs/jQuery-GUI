/*global define, describe, beforeEach, afterEach, it, expect, spyOn */
define( [
	'jquery',
	'lodash',
	
	'gui/ComponentDomDelegateHandler',
	
	'gui/Component',
	'gui/Container'
], function( jQuery, _, ComponentDomDelegateHandler, Component, Container ) {
	
	describe( 'gui.ComponentDomDelegateHandler', function() {
		
		it( "should automatically facilitate the hookup of a component's child elements having special `gui-[eventName]` attributes", function() {
			var div1ClickCount = 0,
			    div2ClickCount = 0,
			    div1,
			    div2;
			
			var component = new Component( {
				html : '<div gui-click="onDiv1Click">Div 1</div>' + 
				       '<div gui-click="onDiv2Click">Div 2</div>',
				
				onDiv1Click : function( evt ) { div1ClickCount++; expect( evt.target ).toBe( div1 ); },
				onDiv2Click : function( evt ) { div2ClickCount++; expect( evt.target ).toBe( div2 ); }
			} );
			
			component.render( 'body' );
			div1 = component.getEl().find( 'div' )[ 0 ];
			div2 = component.getEl().find( 'div' )[ 1 ];
			
			// Simulate Events
			jQuery( div1 ).trigger( 'click' );
			expect( div1ClickCount ).toBe( 1 );
			expect( div2ClickCount ).toBe( 0 );
			
			jQuery( div2 ).trigger( 'click' );
			expect( div1ClickCount ).toBe( 1 );
			expect( div2ClickCount ).toBe( 1 );
			
			component.destroy();  // clean up
		} );
		
		
		it( "should automatically facilitate the hookup of all events defined in the ComponentDomDelegateHandler for a component's child elements having the special `gui-[eventName]` attributes", function() {
			var eventNames = _.without( ComponentDomDelegateHandler.eventNames, 'focus', 'blur' ),  // unfortunately, can't focus or blur a <div>, so we'll skip these
			    eventCounts = {},  // map of event names -> counts
			    allEventAttrs,
			    element;
			
			// Initialize all eventCounts to 0
			_.forEach( eventNames, function( eventName ) { eventCounts[ eventName ] = 0; } );
			
			// Create an array of all of the special gui-[eventName] attributes
			// ex: [ 'gui-click="onEvent"', 'gui-dblclick="onEvent"', ... ]
			allEventAttrs = _.map( eventNames, function( eventName ) {
				return 'gui-' + eventName + '="onEvent"';  // ex: gui-click="onEvent"
			} );
			
			var component = new Component( {
				html : '<div ' + allEventAttrs.join( " " ) + '>Div</div>',  
				
				onEvent : function( evt ) { 
					eventCounts[ evt.type ]++;
					expect( evt.target ).toBe( element );
				}
			} );
			
			component.render( 'body' );
			element = component.getEl().find( 'div' )[ 0 ];
			
			// Simulate Events
			_.forEach( eventNames, function( eventName ) {
				jQuery( element ).trigger( eventName );
			} );
			
			// Check counts
			_.forEach( eventCounts, function( count, eventName ) {
				expect( count ).toBe( 1 );
				
				if( count !== 1 ) 
					throw new Error( "Count for event '" + eventName + "' was " + count + " instead of 1" ); 
			} );
			
			component.destroy();  // clean up
		} );
		
		
		it( "should automatically facilitate the hookup of a component's descendent elements having special `gui-[eventName]` attributes, even when events are triggered on even further descendent elements", function() {
			var divClickCount = 0,
			    nested1Div,
			    nested2Div,
			    nested3Div;
			
			var component = new Component( {
				tpl : [
					'<div data-elem="outer">',
						'<div data-elem="nested1" gui-click="onDivClick">',
							'<div data-elem="nested2">',
								'<div data-elem="nested3">',
									'My Div',
								'</div>',
							'</div>',
						'</div>',
					'</div>'
				],
				
				onDivClick : function( evt ) { 
					divClickCount++;
					
					expect( evt.currentTarget ).toBe( nested1Div );  // `currentTarget` should always point to the node with the `gui-[eventName]` attribute, as the "current target" in the bubbling phase
					
					switch( divClickCount ) {
						case 1 : expect( evt.target ).toBe( nested1Div ); break;
						case 2 : expect( evt.target ).toBe( nested2Div ); break;
						case 3 : expect( evt.target ).toBe( nested3Div ); break;
						default : throw new Error( "Something is wrong" );
					}
				}
			} );
			
			component.render( 'body' );
			nested1Div = component.getEl().find( 'div' )[ 1 ];  // not index 0, because that is the data-elem="outer" div
			nested2Div = component.getEl().find( 'div' )[ 2 ];
			nested3Div = component.getEl().find( 'div' )[ 3 ];
			
			// Simulate Events
			jQuery( nested1Div ).trigger( 'click' );
			expect( divClickCount ).toBe( 1 );
			
			jQuery( nested2Div ).trigger( 'click' );
			expect( divClickCount ).toBe( 2 );
			
			jQuery( nested3Div ).trigger( 'click' );
			expect( divClickCount ).toBe( 3 );
			
			component.destroy();  // clean up
		} );
		
		
		it( "should allow multiple special event attributes on the same element", function() {
			var divClickCount = 0,
			    divMouseEnterCount = 0,
			    divMouseLeaveCount = 0,
			    div;
			
			var component = new Component( {
				html : '<div gui-click="onDivClick" gui-mouseenter="onDivMouseEnter" gui-mouseleave="onDivMouseLeave">Div</div>',
				
				onDivClick      : function( evt ) { divClickCount++;      expect( evt.target ).toBe( div ); },
				onDivMouseEnter : function( evt ) { divMouseEnterCount++; expect( evt.target ).toBe( div ); },
				onDivMouseLeave : function( evt ) { divMouseLeaveCount++; expect( evt.target ).toBe( div ); }
			} );
			
			component.render( 'body' );
			div = component.getEl().find( 'div' )[ 0 ];
			
			
			// Simulate Events
			jQuery( div ).trigger( 'click' );
			expect( divClickCount ).toBe( 1 );
			expect( divMouseEnterCount ).toBe( 0 );
			expect( divMouseLeaveCount ).toBe( 0 );
			
			jQuery( div ).trigger( 'mouseenter' );
			expect( divClickCount ).toBe( 1 );
			expect( divMouseEnterCount ).toBe( 1 );
			expect( divMouseLeaveCount ).toBe( 0 );
			
			jQuery( div ).trigger( 'mouseleave' );
			expect( divClickCount ).toBe( 1 );
			expect( divMouseEnterCount ).toBe( 1 );
			expect( divMouseLeaveCount ).toBe( 1 );
			
			component.destroy();  // clean up
		} );
		
		
		it( "should properly facilitate method calls when child components exist within a Container, with the same method names", function() {
			var containerDivClickCount = 0,
			    child1DivClickCount = 0,
			    child2DivClickCount = 0,
			    containerDiv,
			    child1Div,
			    child2Div;
			
			var container = new Container( {
				renderTpl : [
					'<div gui-click="onDivClick">Container Div</div>',
					
					'<div id="<%= elId %>-contentTarget"></div>'
				],
				
				// Child Items
				items : [
					new Component( {
						html : '<div gui-click="onDivClick">Div</div>',
						
						onDivClick : function( evt ) { child1DivClickCount++; expect( evt.target ).toBe( child1Div ); }
					} ),
					
					new Component( {
						html : '<div gui-click="onDivClick">Div</div>',
						
						onDivClick : function( evt ) { child2DivClickCount++; expect( evt.target ).toBe( child2Div ); }
					} )
				],
				
				// To redirect where the child items are placed
				getContentTarget : function() { return jQuery( '#' + this.elId + "-contentTarget" ); },
			
				onDivClick : function( evt ) { containerDivClickCount++; expect( evt.target ).toBe( containerDiv ); }
			} );
			
			container.render( 'body' );
			containerDiv = container.getEl().find( 'div' )[ 0 ];
			child1Div = container.getItemAt( 0 ).getEl().find( 'div' )[ 0 ];
			child2Div = container.getItemAt( 1 ).getEl().find( 'div' )[ 0 ];
			
			// Simulate Events
			jQuery( containerDiv ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 1 );
			expect( child1DivClickCount ).toBe( 0 );
			expect( child2DivClickCount ).toBe( 0 );
			
			jQuery( child1Div ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 1 );
			expect( child1DivClickCount ).toBe( 1 );
			expect( child2DivClickCount ).toBe( 0 );
			
			jQuery( child2Div ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 1 );
			expect( child1DivClickCount ).toBe( 1 );
			expect( child2DivClickCount ).toBe( 1 );
			
			container.destroy();  // clean up
		} );
		
		
		it( "should allow nested special event handlers to all call the proper method on their corresponding components, updating the `currentTarget` property on the event object to the element with the `gui-[eventName]` attribute for the handler call", function() {
			var containerDivClickCount = 0,
			    childDivClickCount = 0,
			    containerDiv,
			    childDiv;
			
			var container = new Container( {
				renderTpl : [
					'<div gui-click="onDivClick" id="<%= elId %>-contentTarget"></div>'
				],
				
				// Child Items
				items : [
					new Component( {
						html : '<div gui-click="onDivClick">Div</div>',
						
						onDivClick : function( evt ) { childDivClickCount++; expect( evt.target ).toBe( childDiv ); }
					} )
				],
				
				// To redirect where the child items are placed
				getContentTarget : function() { return jQuery( '#' + this.elId + "-contentTarget" ); },
			
				onDivClick : function( evt ) { containerDivClickCount++; expect( evt.currentTarget ).toBe( containerDiv ); }
			} );
			
			container.render( 'body' );
			containerDiv = container.getEl().find( 'div' )[ 0 ];
			childDiv = container.getItemAt( 0 ).getEl().find( 'div' )[ 0 ];
			
			// Simulate Events
			jQuery( containerDiv ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 1 );
			expect( childDivClickCount ).toBe( 0 );
			
			jQuery( childDiv ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 2 );  // this should be triggered again (bringing it to 2), as a parent to another element that has a gui-click handler
			expect( childDivClickCount ).toBe( 1 );
			
			container.destroy();  // clean up
		} );
		
		
		it( "should allow the propagation of the emulated event bubbling to be stopped by handlers when evt.stopPropagation() is called", function() {
			var containerDivClickCount = 0,
			    childDivClickCount = 0,
			    containerDiv,
			    childDiv;
			
			var container = new Container( {
				renderTpl : [
					'<div gui-click="onDivClick" id="<%= elId %>-contentTarget"></div>'
				],
				
				// Child Items
				items : [
					new Component( {
						html : '<div gui-click="onDivClick">Div</div>',
						
						onDivClick : function( evt ) { 
							childDivClickCount++; 
							expect( evt.target ).toBe( childDiv );
							
							evt.stopPropagation();  // Stopping Propagation at the nested handler
						}
					} )
				],
				
				// To redirect where the child items are placed
				getContentTarget : function() { return jQuery( '#' + this.elId + "-contentTarget" ); },
			
				onDivClick : function( evt ) { containerDivClickCount++; expect( evt.currentTarget ).toBe( containerDiv ); }
			} );
			
			container.render( 'body' );
			containerDiv = container.getEl().find( 'div' )[ 0 ];
			childDiv = container.getItemAt( 0 ).getEl().find( 'div' )[ 0 ];
			
			// Simulate Events
			jQuery( containerDiv ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 1 );
			expect( childDivClickCount ).toBe( 0 );
			
			jQuery( childDiv ).trigger( 'click' );
			expect( containerDivClickCount ).toBe( 1 );  // this should *not* be triggered again in this case, since the nested handler stopped event propagation
			expect( childDivClickCount ).toBe( 1 );
			
			container.destroy();  // clean up
		} );
		
		
		it( "should allow the default action of the event to be prevented by returning `false` from a handler", function() {
			var checkboxClickCount = 0,
			    checkbox;
			
			var component = new Component( {
				html : '<input type="checkbox" gui-click="onCheckboxClick" />',
				
				onCheckboxClick : function( evt ) { 
					checkboxClickCount++;
					expect( evt.target ).toBe( checkbox );
					
					return false;  // "prevent default behavior"
				}
			} );
			
			component.render( 'body' );
			checkbox = component.getEl().find( 'input' )[ 0 ];
			
			// Simulate Events
			jQuery( checkbox ).trigger( 'click' );
			expect( checkboxClickCount ).toBe( 1 );
			expect( checkbox.checked ).toBe( false );  // default behavior should have been prevented (i.e. checkbox should not have been checked)
			
			component.destroy();  // clean up
		} );
		
	} );
	
} );