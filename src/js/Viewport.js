/*global define */
define( [
	'jquery',
	'lodash',
	'gui/ComponentManager',
	'gui/Container'
], function( jQuery, _, ComponentManager, Container ) {

	/**
	 * @class gui.Viewport
	 * @extends gui.Container
	 * @alias type.viewport
	 *  
	 * A special {@link gui.Container Container} which keeps itself at the size of its parent element, and responds to window resizes
	 * to re-layout its child {@link gui.Component Components}.
	 * 
	 * Ideally, there should only be one Viewport on a page, and it should automatically be rendered into the document body.
	 * However, until everything uses the UI framework, this is used on an individual basis in some areas. 
	 * 
	 * Note that a Viewport should not contain another Viewport though. A set of parent/child relationships should end at the
	 * top with a Viewport, and all children should simply be {@link gui.Container Containers}. If they need to be sized to 100% height/width,
	 * their parent {@link gui.Container Container} should be configured with a {@link gui.layout.Fit FitLayout}.
	 */
	var Viewport = Container.extend( {
		
		/**
		 * @private
		 * @property {Function} onWindowResizeDelegate
		 * 
		 * The delegate function which is a handler of the window resize event. This reference must
		 * be stored so that it can be unbound when the Viewport is destroyed.
		 */
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			this._super( arguments );
			
			this.setStyle( {
				'position'   : 'relative',
				'overflow-x' : 'hidden',
				'overflow-y' : 'auto'
			} );
			
			this.onWindowResizeDelegate = _.debounce( _.bind( this.onWindowResize, this ), 150 );
			jQuery( window ).bind( 'resize', this.onWindowResizeDelegate );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			this.recalcDimensions();
		},
		
		
		/**
		 * Recalculates and sets the dimensions of the Viewport to the size of its parent element.
		 * 
		 * @private
		 */
		recalcDimensions : function() {
			if( this.rendered ) {
				var $el = this.$el,
				    $parent = $el.parent();
				    
				$el.css( {
					//width: $parent.width(),  -- let width be handled by the browser
					height: $parent.height()
				} );
			}
		},
		
		
		/**
		 * Handler for when the window is resized. Re-calculates the dimensions of the Viewport,
		 * and runs {@link #doLayout}.
		 * 
		 * @protected
		 */
		onWindowResize : function() {
			if( !this.destroyed ) {  // just in case the viewport has been destroyed, but a window resize had previously been deferred
				this.doResize();
			}
		},
		
		
		/**
		 * Performs a resize of the Viewport and a layout of its {@link #childComponents} in response to the buffered
		 * window resize task.
		 * 
		 * @protected
		 * @method doResize
		 */
		doResize : function() {
			this.recalcDimensions();
			this.doLayout();
		},
		
		
		// -----------------------------
		
		
		/**
		 * @inheritdoc
		 */
		onDestroy : function() {
			jQuery( window ).unbind( 'resize', this.onWindowResizeDelegate );
			
			this._super( arguments );
		}
		
	} );
	
	
	// Register the class so it can be created by the type string 'viewport'
	ComponentManager.registerType( 'viewport', Viewport );
	
	return Viewport;
	
} );