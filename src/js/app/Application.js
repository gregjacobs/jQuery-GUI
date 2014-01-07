/*global define */
define( [
	'jquery',
	'lodash',
	'Class'
], function( jQuery, _, Class ) {
	
	/**
	 * @abstract
	 * @class gui.app.Application
	 * 
	 * Represents a single Application. This class is the base class for all Applications, and implements
	 * the initial set up for an Application as the page loads. It instantiates a {@link gui.Viewport Viewport}, and
	 * one or more {@link gui.app.Controller Controllers} which manage interactions on the Viewport. When the page
	 * (document) is ready, the {@link #onDocumentReady} method is called to render the Viewport.
	 * 
	 * Subclasses must implement the {@link #createViewport} and {@link #createControllers} methods, and may also 
	 * override the {@link #init} method for any subclass-specific initialization. The {@link #init} method is called 
	 * after the Viewport and the Controllers have been instantiated, but before the document is ready.
	 */
	var Application = Class.create( {
		
		/**
		 * @protected
		 * @property {gui.Viewport} viewport
		 * 
		 * The viewport that was instantiated for the Application.
		 */
		
		/**
		 * @protected
		 * @property {gui.app.Controller[]} controllers
		 * 
		 * The controller(s) instantiated for the Application.
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );  // assign the configuration options onto this object

			var viewport = this.viewport = this.createViewport();
			// <debug>
			if( !viewport ) 
				throw new Error( "Error: No viewport returned by createViewport() method" );
			// </debug>
			
			var controllers = this.controllers = [].concat( this.createControllers( viewport ) );
			// <debug>
			if( !controllers[ 0 ] )  // controllers[ 0 ] will be `undefined` if none are returned 
				throw new Error( "Error: No controller(s) returned by createControllers() method" );
			// </debug>
			
			this.init();
			
			jQuery( document ).ready( _.bind( this.onDocumentReady, this ) );
		},
		
		
		/**
		 * Method which must be overridden by subclasses to instantiate and return a {@link gui.Viewport}.
		 * 
		 * @protected
		 * @abstract
		 * @return {gui.Viewport}
		 */
		createViewport : Class.abstractMethod,
		
		
		/**
		 * Method which must be overridden by subclasses to instantiate and return one or more 
		 * {@link gui.app.Controller Controllers}. References to these controllers may be saved on this
		 * Application object from this method, but must be returned from the method as well so that
		 * the Application class can call hook methods on them at a later time.
		 * 
		 * ## Examples
		 * 
		 * A few examples for this method may look something like the following.
		 * 
		 * Single controller:
		 * 
		 *     createControllers : function() {
		 *         this.appController = new Controller( ... );  // save a named reference for later
		 *         
		 *         return this.appController;
		 *     }
		 *     
		 * Multiple controllers:
		 * 
		 *     createControllers : function() {
		 *         this.filtersController = new Controller( ... );
		 *         this.displayController = new Controller( ... );
		 *         
		 *         return [ this.filtersController, this.displayController ];
		 *     }
		 * 
		 * @protected
		 * @abstract
		 * @param {gui.Viewport} viewport A reference to the Viewport created from {@link #createViewport}.
		 * @return {gui.app.Controller/gui.app.Controller[]} The Controller(s) that were instantiated in this
		 *   method.
		 */
		createControllers : Class.abstractMethod,
		
		
		/**
		 * Hook method which may be overridden in subclasses to provide any subclass-specific initialization.
		 * For maintainability purposes, this superclass method should be called first from any implementation.
		 * 
		 * This method is called after the {@link #viewport} has been instantiated by the {@link #createViewport}
		 * method, and the {@link #controllers} have been instantiated by the {@link #createControllers} method.
		 * 
		 * ## Example
		 * 
		 *     init : function() {
		 *         this._super( arguments );
		 *         
		 *         this.viewport.on( 'render', function() { ... } );  // assuming we want to listen for this event (probably don't need to)
		 *         
		 *         this.myController.doSomething();  // `myController` would have been a reference set up in {@link #createControllers}
		 *     }
		 * 
		 * @protected
		 * @template
		 */
		init : _.noop,
		
		
		/**
		 * Handles when the page (document) is ready by rendering the Viewport.
		 * 
		 * @protected
		 */
		onDocumentReady : function() {
			this.viewport.render( 'body' );
			
			this.logger.logForPage(); //Logging page load time once page gets render.
			
			// A little hack for now for the Web Font loading.
			// TODO: detect when the font has loaded, and then size the layout to take the web font sizes into account.
			var me = this;
			setTimeout( function() {
				me.viewport.doLayout();
			}, 250 );
		}
		
	} );
	
	return Application;
	
} );