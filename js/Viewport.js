/**
 * @class ui.containers.Viewport
 * @extends ui.Container
 *  
 * A special {@link ui.Container Container} which keeps itself at the size of its parent element, and responds to window resizes
 * to re-layout its child {@link ui.Component Components}.
 * 
 * Ideally, there should only be one Viewport on a page, and it should automatically be rendered into the document body.
 * However, until everything uses the UI framework, this is used on an individual basis in some areas. 
 * 
 * Note that a Viewport should not containe another Viewport though. A set of parent/child relationships should end at the
 * top with a Viewport, and all children should simply be {@link ui.Container Containers}. If they need to be sized to 100% height/width,
 * their parent {@link ui.Container Container} should be configured with a {@link ui.layout.FitLayout FitLayout}.
 *
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global window, jQuery, Class, Jux, ui */
ui.Viewport = Class.extend( ui.Container, {
	
	/**
	 * @cfg {String/Object/ui.layout.Layout} layout
	 * @inheritdoc
	 */
	layout : 'fit',
	
	
	/**
	 * @private
	 * @property {Function} onWindowResizeDelegate
	 * 
	 * The delegate function which is a handler of the window resize event. This reference must
	 * be stored so that it can be unbound when the Viewport is destroyed.
	 */
	
	
	// protected
	initComponent : function() {
		this._super( arguments );
		
		this.windowResizeDelayedTask = new Jux.util.DelayedTask();
		
		this.onWindowResizeDelegate = this.onWindowResize.createDelegate( this );
		jQuery( window ).bind( 'resize', this.onWindowResizeDelegate );
	},
	
	
	// protected
	onRender : function() {
		this._super( arguments );

		var parent = this.$el.parent();
		this.getEl().css( {
			position: 'relative',
			'overflow-x': 'hidden',
			'overflow-y': 'auto'
		} );
		
		this.recalcDimensions();
	},
	
	
	/**
	 * Recalculates and sets the dimensions of the Viewport to the size of its parent element.
	 * 
	 * @private
	 * @method recalcDimensions
	 */
	recalcDimensions : function() {
		if( this.rendered ) {
			var $el = this.$el,
			    $parent = $el.parent();
			    
			$el.css( {
				width: $parent.width(),
				height: $parent.height()
			} );
		}
	},
	
	
	/**
	 * Handler for when the window is resized. Re-calculates the dimensions of the Viewport,
	 * and runs {@link #doLayout}.
	 * 
	 * @protected
	 * @method onWindowResize
	 */
	onWindowResize : function() {
		this.windowResizeDelayedTask.delay( 50, this.doResize, this );
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
	
	
	// protected
	onDestroy : function() {
		jQuery( window ).unbind( 'resize', this.onWindowResizeDelegate );
		
		this.windowResizeDelayedTask.cancel();
		
		this._super( arguments );
	}
	
} );


// Register the type so it can be created by the string 'Viewport' in the manifest
ui.ComponentManager.registerType( 'Viewport', ui.Viewport );