/*global define */
define( [ 
	'lodash',
	'Class',
	'Observable'
],
function( _, Class, Observable ) {
	
	/**
	 * @abstract
	 * @class jqc.plugin.Plugin
	 * @extends Observable
	 * 
	 * Abstract base class for plugins.  All plugins that are created should extend from this class.  Concrete plugin implementations
	 * must implement the method {@link #init}, which is called by a {@link jqc.Component} when it initializes the plugin. See
	 * {@link #init} for more details.
	 * 
	 * See the jqc.plugin package for examples on building plugins.
	 */
	var Plugin = Class.extend( Observable, {
		abstractClass : true,
		
		
		/**
		 * @constructor
		 * @param {Object} config The configuration options for the plugin, specified in an object (hash).
		 */
		constructor : function( config ) {
			// Apply the properties of the configuration object onto this object
			_.assign( this, config );
			
			// Call superclass (Observable) constructor. Must be done after config has been applied.
			this._super( arguments );
		},
		
		
		/**
		 * Abstract method that must be implemented by subclasses to provide the functionality of the plugin. This method
		 * is called by the {@link jqc.Component} that the plugin has been provided to when the Component initializes its plugins. 
		 * This method is given a reference to the {@link jqc.Component Component} as the first argument so that the Component's
		 * events can be subscribed to and its methods can be overridden/extended to implement the plugin's functionality.
		 * 
		 * @abstract
		 * @method init
		 * @param {jqc.Component} component A reference to the {@link jqc.Component} that this plugin belongs to. 
		 */
		init : Class.abstractMethod
		
	} );
	
	
	return Plugin;
	
} );
