/*global define */
define( [
	'jqc/ComponentManager',
	'jqc/Overlay'
], function( ComponentManager, Overlay ) {
	
	/**
	 * @class jqc.window.Window
	 * @extends jqc.Overlay
	 * @alias type.window
	 * 
	 * Basic class for creating a window (also known as a dialog). As a subclass of {@link jqc.panel.Panel Panel}, the Window
	 * may accept a {@link #title}, and it also adds a {@link #closeButton close button} to the top right  
	 */
	var Window = Overlay.extend( {
		
		/**
		 * @cfg {Boolean} closeButton
		 * 
		 * `true` to show the close button on the top right, `false` to hide it.
		 */
		closeButton : true,
		
		/**
		 * @cfg {String} closeAction
		 * 
		 * The action to take when the {@link #closeButton} is clicked, or the Window is closed by the 'esc' button.
		 * Acceptable values are: 
		 * 
		 * - `'{@link #method-destroy}'`: Destroys the Window for automatic cleanup from the DOM. The Window will not be available to
		 *   be shown again using the {@link #method-show} method.
		 *    
		 * - `'{@link #method-hide}'`: Hides the Window. The Window will be available to be shown again using the {@link #method-show} method.
		 *   The Window must be manually {@link #method-destroy destroyed} when it is no longer needed.
		 */
		closeAction : 'destroy',
		
		/**
		 * @cfg {Boolean} closeOnEscape
		 * 
		 * `true` to have the Window close when the 'esc' key is pressed. Set to `false` to disable this behavior. The action taken (whether
		 * the Window is {@link #method-destroy destroyed} or simply {@link #method-hide hidden}) is governed by the {@Link #closeAction} config.
		 */
		closeOnEscape : true,
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'jqc-Window',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		x : 'center',
		
		/**
		 * @cfg
		 * @inheritdoc
		 */
		y : 'center',
		
		
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// Add the close button if the config is true
			if( this.closeButton ) {
				this.toolButtons = ( this.toolButtons || [] ).concat( {
					toolType : 'close',
					
					handler  : this.doClose,
					scope    : this
				} );
			}
			
			this._super( arguments );
		},
		
		
		/**
		 * @inheritdoc
		 */
		onRender : function() {
			this._super( arguments );
			
			// If the closeOnEscape config is true, set up a keydown event for it to close the overlay.
			if( this.closeOnEscape ) {
				var me = this;  // for closure
				this.$el.keyup( function( evt ) {
					if( evt.keyCode === 27 && me.closeOnEscape ) {  // 27 == 'esc' char
						me.doClose();
					}
				} );
			}
		},
		
		
		/**
		 * Protected method which handles the {@link #closeAction} of the Window.
		 * 
		 * @protected
		 */
		doClose : function() {
			this.hide();
				
			if( this.closeAction === 'destroy' ) {
				if( this.hiding )  // in the process of hiding (i.e. animating its hide), then wait until it's complete before destroying
					this.on( 'afterhide', function() { this.destroy(); }, this );  // don't call destroy() with any arguments
				else 
					this.destroy();
			}
		}
		
	} );
	
	
	ComponentManager.registerType( 'window', Window );
	
	return Window;
	
} );