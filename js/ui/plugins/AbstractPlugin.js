/**
 * @class ui.plugins.AbstractPlugin
 * @extends Kevlar.util.Observable
 * @abstract
 * 
 * Abstract base class for plugins.  All plugins that are created should extend from this class.  Concrete plugin implementations
 * must implement the method {@link #initPlugin}, which is called by a {@link ui.Component} when it initializes the plugin. See
 * {@link #initPlugin} for more details.<br><br>
 * 
 * See the ui.plugins package for examples on building plugins.
 * 
 * @constructor
 * @param {Object} config The configuration options for the plugin, specified in an object (hash).
 */
/*global Kevlar, ui */
ui.plugins.AbstractPlugin = Kevlar.extend( Kevlar.util.Observable, {
	
	constructor : function( config ) {
		// Apply the properties of the configuration object onto this object
		Kevlar.apply( this, config );
		
		// Call superclass (Observable) constructor. Must be done after config has been applied.
		ui.plugins.AbstractPlugin.superclass.constructor.call( this );
	},
	
	
	/**
	 * Abstract method that must be implemented by subclasses to provide the functionality of the plugin. This method
	 * is called by the {@link ui.Component} that the plugin has been provided to when the Component initializes its plugins. 
	 * This method is given a reference to the {@link ui.Component Component} as the first argument so that the Component's
	 * events can be subscribed to and its methods can be overridden/extended to implement the plugin's functionality.
	 * 
	 * @method initPlugin
	 * @param {ui.Component} component A reference to the {@link ui.Component} that this plugin belongs to. 
	 */
	initPlugin : function( component ) {
		// Template Method
	}
	
} );
