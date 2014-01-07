/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'Observable'
], function( jQuery, _, Class, Observable ) {
	
	/**
	 * @abstract
	 * @class gui.app.Application
	 * @extends Observable
	 * 
	 * Represents a single Application that uses a {@link gui.Viewport} for its display components. The purpose of this 
	 * class is to give some structure to Application initialization, and to facilitate inter-controller communication
	 * for a given application. 
	 * 
	 * Note that it is certainly possible to initialize a given application by manually instantiating a Viewport, and one or
	 * more Controller(s) for it from an HTML page. However, this class seeks to provide a common skeleton for initialization, 
	 * and the ability to test the initialization code, which includes substituting mock objects by overriding the "create" 
	 * methods in tests.
	 * 
	 * 
	 * ## Details
	 * 
	 * This class implements the initial set up for an Application as the page loads. It instantiates any data containers
	 * ({@link data.Model Models} or {@link data.Collection Collections}) that the app may need from the 
	 * {@link #createDataContainers} method, a {@link gui.Viewport Viewport} from the {@link #createViewport} method, and 
	 * one or more  {@link gui.app.Controller Controllers} from the {@link #createControllers} method, which will manage 
	 * interactions with the components in the Viewport. When the page (document) is ready, the {@link #onDocumentReady} 
	 * method is called to automatically render the Viewport at the appropriate time.
	 * 
	 * Subclasses must implement the {@link #createViewport} method. They may also override the {@link #createDataContainers}, 
	 * {@link #createControllers}, and the {@link #init} method for any subclass-specific initialization. The {@link #init} 
	 * method is called after the Data Containers, Viewport, and the Controllers have been instantiated, but before the document 
	 * is ready.
	 * 
	 * The hook methods are called in the following order:
	 * 
	 * 1. {@link #createDataContainers} - For initializing {@link data.Model Models} and {@link data.Collection Collections}
	 *    for the app.
	 * 2. {@link #createViewport} - For creating the {@link gui.Viewport Viewport} instance for the app.
	 * 3. {@link #createControllers} - For creating the {@link gui.app.Controller Controller(s)} to manage the app.
	 * 4. {@link #init} - For setting up interactions between {@link gui.app.Controller Controllers} via event listeners, 
	 *    and any other application-specific initialization that might be needed.
	 * 
	 * 
	 * ## Example Implementation
	 * 
	 * my/app/Application.js
	 * 
	 *     define( [
	 *         'gui/app/Application',
	 *         
	 *         'my/app/view/Viewport',
	 *         'my/app/controller/Filters',
	 *         'my/app/controller/MainDisplay',
	 *         'my/app/collection/Users'
	 *     ], function( Application, AppViewport, FiltersController, MainDisplayController, UsersCollection ) {
	 *         
	 *         var MyApplication = Application.extend( {
	 *         
	 *             createDataContainers : function() {
	 *                 this.usersCollection = new UsersCollection();
	 *             },
	 *             
	 *             createViewport : function() {
	 *                 return new AppViewport( {
	 *                     usersCollection: this.usersCollection  // this would be passed to the view component(s) which will be bound to it by the AppViewport class
	 *                 } );
	 *             },
	 *             
	 *             createControllers : function( viewport ) {
	 *                 this.filtersController = new FiltersController( { view: viewport } );
	 *                 
	 *                 this.mainDisplayController = new MainDisplayController( {
	 *                     view: viewport, 
	 *                     usersCollection: this.usersCollection  // so the MainDisplayController can re-load this collection when a filter changes
	 *                 } );
	 *             },
	 *             
	 *             
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 this.filtersController.on( 'filterselect', this.onFilterSelect, this );
	 *             },
	 *             
	 *             
	 *             onFilterSelect : function() {
	 *                 var selectedFilters = this.filtersController.getSelectedFilters();
	 *                 this.mainDisplayController.update( selectedFilters );
	 *             }
	 *             
	 *         } );
	 *         
	 *         return MyApplication;
	 *         
	 *     } );
	 * 
	 * 
	 * ## Example Usage from HTML Page
	 * 
	 *     <html>
	 *         <head>
	 *             <script src="path/to/require.js"></script>
	 *             <script src="path/to/jQuery-GUI/dist/js/gui-all.js"></script>
	 *             
	 *             <script>
	 *                 require( [
	 *                     'my/app/Application'  // our subclass of gui.app.Application
	 *                 ], function( MyApplication ) {
	 *                     
	 *                     // will instantiate Viewport/Controllers and render the Viewport when the document is ready
	 *                     var app = new MyApplication();
	 *                     
	 *                 } );
	 *             </script>
	 *         </head>
	 *     
	 *         <body></body>
	 *     </html>
	 */
	var Application = Observable.extend( {
		abstractClass: true,
		
		/**
		 * @protected
		 * @property {gui.Viewport} viewport
		 * 
		 * The viewport that was instantiated for the Application via {@link #createViewport}.
		 */
		
		
		/**
		 * @constructor
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );  // assign the configuration options onto this object

			this.createDataContainers();
			
			var viewport = this.viewport = this.createViewport();
			// <debug>
			if( !viewport ) throw new Error( "Error: No viewport returned by createViewport() method" );
			// </debug>
			
			this.createControllers( viewport );
			
			this.init();
			
			jQuery( document ).ready( _.bind( this.onDocumentReady, this ) );
		},
		
		
		/**
		 * Method which may be overridden by subclasses to instantiate one or more {@link data.Model Models} and/or
		 * {@link data.Collection Collections} that will be used by the application. References to these data containers 
		 * may be saved to this Application object from this method.
		 * 
		 * ## Example
		 * 
		 *     createDataContainers : function() {
		 *         this.usersCollection = new UsersCollection();
		 *     }
		 *     
		 *     // ...
		 *     
		 *     createViewport : function() {
		 *         return new AppViewport( {
		 *             usersCollection : this.usersCollection  // so this collection can be bound to one or more view components
		 *         } );
		 *     }
		 *     
		 *     createControllers : function( viewport ) {
		 *         this.usersController = new UsersController( {
		 *             view : viewport,
		 *             usersCollection : this.usersCollection  // so this collection can be managed by the UsersController
		 *         } );
		 *     }
		 * 
		 * @protected
		 */
		createDataContainers : _.noop,
		
		
		/**
		 * Method which must be overridden by subclasses to instantiate and return a {@link gui.Viewport}.
		 * 
		 * @protected
		 * @abstract
		 * @return {gui.Viewport}
		 */
		createViewport : Class.abstractMethod,
		
		
		/**
		 * Method which may be overridden by subclasses to instantiate one or more {@link gui.app.Controller Controllers}. 
		 * References to these controllers may be saved to this Application object from this method.
		 * 
		 * ## Examples
		 * 
		 * A few examples for this method may look something like the following.
		 * 
		 * Single controller:
		 * 
		 *     createControllers : function( viewport ) {
		 *         this.appController = new Controller( { view: viewport } );  // save a named reference for later
		 *     }
		 *     
		 * Multiple controllers:
		 * 
		 *     createControllers : function( viewport ) {
		 *         this.filtersController = new Controller( { view: viewport } );
		 *         this.displayController = new Controller( { view: viewport } );
		 *     }
		 * 
		 * @protected
		 * @param {gui.Viewport} viewport A reference to the Viewport created from {@link #createViewport}. This is
		 *   usually passed to a Controller as the {@link gui.app.Controller#view view} config.
		 */
		createControllers : _.noop,
		
		
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
		}
		
	} );
	
	return Application;
	
} );