/**
 * @class ui.layouts.AbstractLayout
 * @extends Kevlar.util.Observable
 * @abstract 
 * 
 * Defines the public interface of all Layout subclasses. Layouts are strategy objects that are used
 * by {@link ui.Container}s to implement how their child items are displayed.<br><br>
 * 
 * The default layout that is used for a {@link ui.Container Container} is the {@link ui.layouts.ContainerLayout}, 
 * which simply puts each child component into their own div element, and does no further sizing or formatting.
 *
 * @constructor
 * @param {Object} config The configuration options for the Layout, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.layouts.AbstractLayout = Kevlar.extend( Kevlar.util.Observable, {
	
	/**
	 * @cfg {ui.Container} container
	 * The {@link ui.Container} that this Layout object belongs to. Defaults to null, and can be set
	 * after instantiation with {@link #setContainer}. 
	 */
	container : null,
	
	/**
	 * @protected
	 * @property container
	 * The {@link ui.Container} that this Layout object belongs to, set by either the config option,
	 * or the {@link #setContainer} method.
	 * @type {ui.Container}
	 */
	
	
	constructor : function( config ) {
		this.addEvents(
			/**
			 * @event destroy
			 * Fires when this layout is destroyed.
			 * @param {ui.layouts.AbstractLayout} layout This AbstractLayout instance.
			 */
			'destroy'
		);
		
		// Apply the properties of the configuration object onto this object
		Kevlar.apply( this, config );
		
		// Call Observable's constructor
		ui.layouts.AbstractLayout.superclass.constructor.call( this );
		
		// Call template method for layout initialization
		this.initLayout();
	},
	
	
	/**
	 * Template method which should be extended to provide the Layout's constructor logic. 
	 * 
	 * @abstract
	 * @method initLayout
	 */
	initLayout : function() {
		// template method
	},
	
	
	/**
	 * Sets the {@link ui.Container} instance that this Layout belongs to.
	 * 
	 * @method setContainer
	 * @param {ui.Container} container
	 */
	setContainer : function( container ) {
		this.container = container;
	},
	
	
	/**
	 * Gets the {@link ui.Container} instance that this Layout belongs to.
	 * 
	 * @method getContainer
	 * @return {ui.Container} The container
	 */
	getContainer : function() {
		return this.container;
	},
	
	
	/**
	 * Performs the layout strategy. First detaches any rendered components from their parent, and then
	 * calls the {@link #onLayout} template method for subclasses to perform the necessary layout processing.
	 * 
	 * @method doLayout
	 */
	doLayout : function() {
		var container = this.container,
		    childComponents = this.container.getItems(),
		    numChildComponents = childComponents.length,
			$targetEl = container.getContentTarget();
		
		// First, detatch any child components' elements that have already been rendered. They will be placed in the correct
		// position next (when the layout subclass executes its onLayout method).
		for( var i = 0; i < numChildComponents; i++ ) {
			if( childComponents[ i ].rendered ) {
				childComponents[ i ].getEl().detach();
			}
		}
		
		// Call template method for subclasses
		this.onLayout( childComponents, $targetEl );
	},
	
	
	/**
	 * Template method for subclasses to override to implement their layout strategy.
	 * 
	 * @protected
	 * @abstract
	 * @method onLayout
	 * @param {ui.Component[]} childComponents The child components that should be rendered and laid out.
	 * @param {jQuery} $targetEl The target element, where child components should be rendered into.
	 */
	onLayout : function( childComponents, $targetEl ) {
		// Template Method
	},
	
	
	/**
	 * Destroys the layout by cleaning up its event listeners. Subclasses should extend the onDestroy method to implement 
	 * any destruction process they specifically need.
	 * 
	 * @method destroy
	 */
	destroy : function() {
		this.onDestroy();
		this.fireEvent( 'destroy', this );
		
		// purge listeners after the destroy event has been fired
		this.purgeListeners();
	},
	
	
	/**
	 * Template method that subclasses should extend to implement their own destruction process.
	 * 
	 * @protected
	 * @abstract
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Template method
	}
	
} );
