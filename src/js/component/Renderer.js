/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	
	'gui/ComponentManager'
], function( jQuery, _, Class, ComponentManager ) {

	/**
	 * @class gui.component.Renderer
	 * 
	 * The ComponentRenderer class is responsible for rendering a single {@link gui.Component Component}, or nested hierarchy of
	 * {@link gui.Container Containers} (a Component subclass, which participates in the composite structure of components on a page).
	 * 
	 * Instead of allowing Components to each render their own elements and inject them into the DOM one-by-one, this class is responsible
	 * for retrieving the HTML of an entire Container/Component hierarchy, and injecting it into the DOM all at once. The algorithm is
	 * as follows:
	 * 
	 * 1) Retrieve the entire tree of Container/Component HTML, starting at the node that is passed to the ComponentRenderer.
	 * 2) Inject this HTML into the DOM.
	 * 3) Walk the DOM tree, hooking up Components' elements to their actual {@link gui.Component Component} instances.
	 * 4) Call Components' {@link gui.Component#onRender onRender()} method on the pre-order traversal, and 
	 *    {@link gui.Component#onAfterRender onAfterRender()} method on the post-order traversal.
	 */
	var ComponentRenderer = Class.create( {
		
		/**
		 * @cfg {gui.Component} component (required)
		 * 
		 * The Component being rendered.
		 */
		
		/**
		 * @cfg {jQuery} $containerEl (required)
		 * 
		 * The container element of where to render the {@link #component}.
		 */
		
		/**
		 * @cfg {HTMLElement/jQuery} position
		 * 
		 * The element of where to render the {@link #component} before. If not provided, or `null`, the
		 * {@link #component} will simply be appended to the {@link #$containerEl} 
		 */
		
		/**
		 * @cfg {Object} options
		 * 
		 * The original `options` argument passed to {@link gui.Component#render}.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} cfg The configuration options for this class, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );
		},
		
		
		/**
		 * Executes the ComponentRenderer, rendering the {@link #component} to the {@link #$containerEl}.
		 */
		execute : function() {
			var component = this.component,
			    $containerEl = this.$containerEl,
			    position = this.position,
			    options = this.options,
			    elId = component.getElId();
			
			// First, register the Component with the ComponentManager by its `elId`. This is to allow support code
			// (such as the gui.component.DomDelegateHandler) to back-reference a Component instance by its element ID.
			ComponentManager.registerComponentEl( elId, component );
			
			// Create the Component's element
			var $el = component.$el = jQuery( component.generateComponentMarkup() );
			
			// Appending the element to the container before the call to onRender. It is necessary to do things in this order (and not rendering children and then appending)
			// for things like the jQuery UI tabs, which requires that their wrapping elements be attached to the DOM when they are instantiated.
			// Otherwise, those items require their instantiation to be placed into a setTimeout(), which causes a flicker on the screen (especially for the jQuery UI tabs). 
			if( position ) {
				$el.insertBefore( position );
			} else {
				$el.appendTo( $containerEl );
			}
			
			// Setting the render flag before the call to onRender so that onRender implementations can call methods that check this flag (such as setters
			// that handle the case of the Component not yet being rendered).
			component.rendered = true;
			
			// Call onRender hook method for subclasses to add their own elements, and whatever else they need 
			component.onRender( $containerEl, options );
			
			// Attach any configured content to the Component's contentTarget
			component.attachContent( component.getContentTarget() );
			
			// Call the onAfterRender hook method, and fire the 'render' event
			component.onAfterRender( $containerEl, options );
			component.setRenderComplete();
			
			// Finally, if the deferLayout option was not provided as true, run the layout on the Component (or Container, 
			// if it's a gui.Container subclass!)
			if( !options.deferLayout ) {
				component.doLayout();
			}
		}
		
		
	} );
	
	
	return ComponentRenderer;
	
} );