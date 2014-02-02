/*global define */
define( [
	'jquery',
	'lodash',
	'Class',
	'Observable',
	
	'gui/loader/RequireJs'
], function( jQuery, _, Class, Observable, RequireJsLoader ) {
	
	/**
	 * @abstract
	 * @class gui.app.Application
	 * @extends Observable
	 * 
	 * Represents a single Application that uses a {@link gui.Viewport} for its display components. The purpose of this 
	 * class is to give some structure to Application initialization, and to facilitate inter-controller communication
	 * for a given application via {@link gui.app.Controller Controller} events. 
	 * 
	 * Note that it is certainly possible to initialize and set up a given application by manually instantiating a Viewport, 
	 * and one or more Controller(s) for it directly from an HTML page. However, this class seeks to provide a common skeleton 
	 * for initialization, and the ability to test the initialization code, which includes substituting mock objects by 
	 * overriding the "create" methods in tests.
	 * 
	 * 
	 * ## Details
	 * 
	 * This class implements the initial set up for an Application as the page loads. It is intended to be extended to implement 
	 * the hook methods, and also to set up any interactions between the controllers that might be needed. The basic process for a 
	 * subclass is this:
	 * 
	 * 1. It should instantiate any data containers ({@link data.Model Models} or {@link data.Collection Collections}) that the app 
	 *    may need from the {@link #createDataContainers} method.
	 * 2. It should instantiate and return a {@link gui.Viewport Viewport} from the {@link #createViewport} method. This is the only
	 *    hook method which must be implemented.
	 * 3. It should instantiate and return any controllers {@link gui.app.Controller Controllers} from the {@link #createControllers} 
	 *    method, which will manage interactions with both the data containers and view components in the Viewport. 
	 * 4. It should complete initialization in the {@link #init} method, finalizing any setup, and setting up any interactions that
	 *    are needed between controllers via controller events.
	 *    
	 * When the page (document) is ready, the {@link #onDocumentReady} method is called to automatically render the Viewport at the 
	 * appropriate time.
	 * 
	 * The hook methods are called in the following order:
	 * 
	 * 1. {@link #beforeInit}: For checking required configs, and setting up any properties that are needed for the rest of
	 *    the initialization methods. This method is called before any 
	 * 2. {@link #createDataContainers}: For initializing any {@link data.Model Models} and {@link data.Collection Collections}
	 *    for the app.
	 * 3. {@link #createViewport}: For creating the {@link gui.Viewport Viewport} instance for the app.
	 * 4. {@link #createControllers}: For creating the {@link gui.app.Controller Controller(s)} to manage the app.
	 * 5. {@link #init}: For setting up interactions between {@link gui.app.Controller Controllers} via event listeners, 
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
	 *                 return {
	 *                     filters : new FiltersController( { view: viewport } ),
	 *                     
	 *                     mainDisplay : new MainDisplayController( {
	 *                         view: viewport, 
	 *                         usersCollection: this.usersCollection  // so the MainDisplayController can re-load this collection when a filter changes
	 *                     } )
	 *                 } );
	 *             },
	 *             
	 *             
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 this.getController( 'filters' ).on( 'filterselect', this.onFilterSelect, this );
	 *             },
	 *             
	 *             
	 *             // Implementation of a multiple-controller interaction
	 *             onFilterSelect : function() {
	 *                 var selectedFilters = this.getController( 'filters' ).getSelectedFilters();
	 *                 this.getController( 'mainDisplay' ).update( selectedFilters );
	 *             }
	 *             
	 *         } );
	 *         
	 *         return MyApplication;
	 *         
	 *     } );
	 * 
	 * 
	 * Example usage from HTML page:
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
	 * 
	 * 
	 * ## Loading Dynamic Dependencies
	 * 
	 * Normally, all dependencies are loaded from the RequireJS wrapper module for an Application subclass (i.e. in its `define()` dependency
	 * list). However, there is a case to be able to load certain dependencies dynamically, based on Application configuration. This can
	 * be achieved by overriding the {@link #getDynamicDependencyList} method to return an array of the dynamic dependencies that are needed,
	 * and then using {@link #getDynamicDependency} later to access these dependencies. The Application will wait until all dynamic dependencies
	 * have been loaded before being initialized.
	 * 
	 * An example of this may be:
	 * 
	 *     define( [
	 *         'gui/app/Application',
	 *         
	 *         'path/to/static/Dependency1',
	 *         'path/to/static/Dependency2'
	 *     ], function( Application, StaticDependency1, StaticDependency2 ) {
	 *     
	 *         var MyApplication = Application.extend( {
	 *             
	 *             getDynamicDependencyList : function() {
	 *                 // assume `useSpecialController` was a boolean configuration option provided to the Application
	 *                 if( this.useSpecialController ) {
	 *                     this.dynamicControllerPath = 'path/to/special/Controller';
	 *                 else
	 *                     this.dynamicControllerPath = 'path/to/normal/Controller;
	 *                 
	 *                 return [ this.dynamicControllerPath, 'path/to/another/dynamic/Dependency' ];  // return list of dynamic dependencies
	 *             },
	 *             
	 *             ...
	 *             
	 *             createControllers : function() {
	 *                 var ControllerClass = this.getDynamicDependency( this.dynamicControllerPath );
	 *                 
	 *                 return {
	 *                     appController: new ControllerClass();
	 *                 };
	 *             }
	 *             
	 *         } );
	 *     
	 *     } );
	 * 
	 * See the {@link #loadDynamicDependencies} method for more information.
	 */
	var Application = Observable.extend( {
		abstractClass: true,
		
		/**
		 * @cfg {String/HTMLElement/jQuery} renderTo
		 * 
		 * A selector, HTMLElement, or jQuery wrapped set of where to render the {@link #viewport} when 
		 * the document is ready.
		 * 
		 * By default, the {@link #viewport} is rendered to the document body, but it may be useful to render
		 * an entire application into say, a {@link gui.window.Window}.
		 */
		renderTo : 'body',  // renders to the document body
		
		
		/**
		 * @private
		 * @property {Object} dynamicDependencies
		 * 
		 * An Object (map) of the dynamic dependencies loaded from {@link #loadDynamicDependencies} (if any).
		 * This will be an empty map if no dynamic dependencies were loaded.
		 */
		
		/**
		 * @protected
		 * @property {gui.Viewport} viewport
		 * 
		 * The viewport that was instantiated for the Application via {@link #createViewport}.
		 */
		
		/**
		 * @private
		 * @property {Object} controllers
		 * 
		 * An Object (map) of the {@link gui.app.Controller Controllers} instantiated for the Application
		 * from {@link #createControllers}. The keys are the controller names, and the values are the 
		 * {@link gui.app.Controller} instances.
		 * 
		 * Individual controllers should be referenced by name via {@link #getController}.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} initialized
		 * 
		 * Flag that is set to `true` once the application has been fully initialized (i.e. when all dynamic
		 * dependencies have loaded, and all of the hook methods up to {@link #init} have finished executing).
		 */
		
		/**
		 * @private
		 * @property {Boolean} destroyed
		 * 
		 * Flag which is set to `true` once the Application has been destroyed.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} [cfg] The configuration options for this class, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );     // assign the configuration options onto this object
			this._super( arguments );  // call the superclass constructor (Observable)

			var me = this;  // for closure
			
			this.addEvents(
				/**
				 * Fires when the Application has been initialized. This means that all dynamic
				 * dependencies have loaded, and the {@link #init} method has completed.
				 * 
				 * Note that it is possible for the Application to be {@link #method-destroy destroyed}
				 * while dynamic dependencies were in the process of loading, so in this case, this event 
				 * will never fire.
				 * 
				 * @event initialize
				 * @param {gui.app.Application} application This Application instance.
				 */
				'initialize',
			
				/**
				 * Fires when the Application has been {@link #method-destroy destroyed}.
				 * 
				 * @event destroy
				 * @param {gui.app.Application} application This Application instance.
				 */
				'destroy'
			);
			
			this.beforeInit();  // call hook method for any pre-initialization logic
			
			// Load any dynamic dependencies (asynchronously), and when that is complete, call
			// `onDependenciesLoaded()` to complete initialization. If there are no dynamic dependencies 
			// to load, then `onDependenciesLoaded()` will be called immediately.
			this.loadDynamicDependencies().then( function( dependencies ) {
				if( me.isDestroyed() ) return;  // if the Application was destroyed while dependencies were loading, simply return out. We will not complete the initialization routine in this case.
				
				me.dynamicDependencies = dependencies;  // for the `getDynamicDependency()` method to have access to them. This is an Object (map) of the dependencies, where the keys are the dependency names, and the values are the dependencies themselves. If there were no dynamic dependencies, this should be an empty Object.
				
				me.onDynamicDependenciesLoaded();
			} );
		},
		
		
		// -----------------------------------
		
		// Dynamic Dependency Loading Functionality
		
		/**
		 * Asynchronously loads any **dynamic** dependencies for the Application. The Application is only initialized after
		 * all dynamic dependencies have loaded. 
		 * 
		 * Normally, all dependencies for an Application are loaded from the dependency list for a given Application subclass,
		 * in the dependency list provided to `define()`. However, there is a case to be able to load certain dependencies 
		 * dynamically, based on Application configuration. This method supports this use case, where the Application isn't 
		 * initialized until all dynamic dependencies are loaded.
		 * 
		 * Note that in most production cases, all dynamic dependencies will be bundled into a single file and included as such
		 * from an HTML page, which will make this method execute very quickly. However, during development, this bundle
		 * file is usually not available, and hence dynamic dependencies are loaded individually through this method.
		 * 
		 * ## RequireJS and Creating Other Implementations
		 * 
		 * This method, by default, uses the RequireJS loader to pull in dependencies dynamically. If another loader needs to be 
		 * used, this method may be overridden by a subclass in order to do so. A subclass implementation simply needs to return 
		 * a jQuery promise that is resolved when the dependencies have been loaded successfully. The deferred must be resolved 
		 * with one argument: an Object (map) where the keys are the dependency names, and the values are the dependencies 
		 * themselves.
		 * 
		 * ## Specifying Dynamic Dependencies
		 * 
		 * To specify the dynamic dependencies for RequireJS to load, a subclass should override the 
		 * {@link #getDynamicDependencyList} method. This method should return an array of strings, where each string is a 
		 * RequireJS path for the dependency to load.
		 * 
		 * @protected
		 * @return {jQuery.Promise} A Promise object which is resolved once the dynamic dependencies have been retrieved. The
		 *   promise's Deferred must be resolved with a single argument: an Object (map) of the dependencies keyed by their
		 *   dependency name, and whose values are the dependencies themselves.
		 */
		loadDynamicDependencies : function() {
			var dependencyPaths = this.getDynamicDependencyList();  // array of strings for the RequireJS paths of the dependencies
			
			if( dependencyPaths.length === 0 ) {
				return jQuery.when( {} );  // no dynamic dependencies, return a resolved promise. Note: must do this instead of using the require() function with an empty list, because require() executes asynchronously.
				
			} else {
				var loader = this.createDependencyLoader();
				return loader.load( dependencyPaths );
			}
		},
		
		
		/**
		 * Factory method to instantiate the dynamic dependency loader. May be overridden to provide a different
		 * implementation.
		 * 
		 * @protected
		 * @return {gui.loader.Loader}
		 */
		createDependencyLoader : function() {
			return new RequireJsLoader();
		},
		
		
		/**
		 * Hook method which should be overridden to provide any **dynamic** dependencies that the application may require.
		 * This method should return an array of strings, where each string is a RequireJS path to a dependency.
		 * 
		 * Example:
		 * 
		 *     getDynamicDependencyList : function() {
		 *         return [
		 *             'path/to/dynamicDependency1',
		 *             'path/to/dynamicDependency2'
		 *         ];
		 *     }
		 * 
		 * See {@link #loadDynamicDependencies} for more details.
		 * 
		 * @protected
		 * @return {String[]} The array of dependencies to load dynamically before the Application is initialized.
		 */
		getDynamicDependencyList : function() {
			return [];  // empty list by default
		},
		
		
		/**
		 * Completes initialization of the Application after all dynamic dependencies have been loaded. Calls the rest of
		 * the initialization hook methods.
		 * 
		 * @protected
		 */
		onDynamicDependenciesLoaded : function() {
			// Create any Data Containers
			this.createDataContainers();
			
			// Create the Viewport
			var viewport = this.viewport = this.createViewport();
			// <debug>
			if( !viewport ) throw new Error( "Error: No viewport returned by createViewport() method" );
			// </debug>
			
			// Create any Controllers
			var controllers = this.controllers = this.createControllers( viewport );
			// <debug>
			if( !controllers ) throw new Error( "Error: No Object (map) returned by the createControllers() method" );
			// </debug>
			
			// Initialize the Application
			this.init();  // call hook method
			this.initialized = true;
			this.fireEvent( 'initialize', this );
			
			var me = this;  // for closure
			jQuery( document ).ready( function() {
				if( !me.isDestroyed() ) me.onDocumentReady();  // only call the method if the Application hasn't been destroyed before the document is ready
			} );
		},
		
		
		// -----------------------------------
		
		// Initialization Hook Methods
		
		/**
		 * Hook method which may be overridden in subclasses to provide any subclass-specific logic that should occur
		 * before initialization. This method is called before any dynamic dependencies are loaded, and before any other 
		 * hook method (i.e. before {@link #createDataContainers}, {@link #createViewport}, {@link #createControllers}, etc.)
		 * is called. For maintainability purposes, this superclass method should be called first from any implementation.
		 * 
		 * This method may be used to check required configs, and set up any properties that are needed for the other initialization
		 * methods.
		 * 
		 * ## Example
		 * 
		 *     beforeInit : function() {
		 *         this._super( arguments );
		 *         
		 *         // Check required configs
		 *         if( !this.env ) throw new Error( "`env` cfg required" );
		 *         if( !this.userId ) throw new Error( "`userId` cfg required" );
		 *         
		 *         // Set up a performance timer
		 *         this.performanceTimer = new PerformanceTimer();
		 *     },
		 *     
		 *     ...
		 *     
		 *     init : function() {
		 *         this._super( arguments );
		 *         
		 *         this.viewport.on( 'render', function() { this.performanceTimer.log(); }, this );
		 *     }
		 * 
		 * 
		 * @protected
		 * @template
		 * @method beforeInit
		 */
		beforeInit : _.noop,
		
		
		/**
		 * Hook method which may be overridden by subclasses to instantiate one or more {@link data.Model Models} and/or
		 * {@link data.Collection Collections} that will be used by the application. References to these data containers 
		 * may be saved to this Application object from this method. 
		 * 
		 * This method is just a tidy place to instantiate any data containers that will be needed application-wide, before
		 * the viewport and controllers are instantiated.
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
		 *         return {
		 *             users: new UsersController( {
		 *                 view : viewport,
		 *                 usersCollection : this.usersCollection  // so this collection can be managed by the UsersController
		 *             } )
		 *         };
		 *     }
		 * 
		 * @protected
		 * @template
		 * @method createDataContainers
		 */
		createDataContainers : _.noop,
		
		
		/**
		 * Hook method which must be overridden by subclasses to instantiate and return a {@link gui.Viewport}.
		 * 
		 * @protected
		 * @abstract
		 * @template
		 * @method createViewport
		 * @return {gui.Viewport}
		 */
		createViewport : Class.abstractMethod,
		
		
		/**
		 * Hook method which may be overridden by subclasses to instantiate and return one or more 
		 * {@link gui.app.Controller Controllers}. 
		 * 
		 * The return value from this method is an Object (map) where the keys are the names to reference the controller(s) by, 
		 * and the values are the {@link gui.app.Controller} instances. Controllers are then later referenced via
		 * {@link #getController}. 
		 * 
		 * The reason that controllers are returned from this method instead of simply creating direct references to them is 
		 * so that the Application instance can manage them, and destroy them if the Application itself is 
		 * {@link #method-destroy destroyed}.
		 * 
		 * ## Examples
		 * 
		 * A few examples for this method may look something like the following.
		 * 
		 * Single controller:
		 * 
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             appController: new AppController( { view: viewport } )
		 *         };
		 *     }
		 *     
		 * Multiple controllers:
		 * 
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             filters: new FiltersController( { view: viewport } ),
		 *             display: new DisplayController( { view: viewport } )
		 *         };
		 *     }
		 *     
		 * You may also choose to implement factory methods for each controller, either for use with unit tests (where
		 * mock controllers can be substituted), or for subclasses to return different Controller types. For example:
		 * 
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             filters: this.createFiltersController( viewport ),
		 *             display: this.createDisplayController( viewport )
		 *         };
		 *     },
		 *     
		 *     createFiltersController : function( viewport ) {
		 *         return new FiltersController( { view: viewport } );
		 *     },
		 *     
		 *     createDisplayController : function( viewport ) {
		 *         return new DisplayController( { view: viewport } );
		 *     }
		 * 
		 * And finally, when subclassing `createControllers`, one may add controllers to the return map in the following
		 * fashion:
		 * 
		 *     // in superclass
		 *     createControllers : function( viewport ) {
		 *         return {
		 *             filters: new FiltersController( { view: viewport } )
		 *         };
		 *     }
		 * 
		 * 
		 *     // in subclass
		 *     createControllers : function( viewport ) {
		 *         var controllers = this._super( arguments );
		 *         
		 *         // Add controller(s) for this subclass
		 *         controllers.display = new DisplayController( { view: viewport } );
		 *         
		 *         return controllers;
		 *     }
		 * 
		 * @protected
		 * @template
		 * @param {gui.Viewport} viewport A reference to the Viewport created from {@link #createViewport}. This is
		 *   usually passed to a Controller as the {@link gui.app.Controller#view view} config.
		 * @return {Object} An Object (map) of the controllers, where the key names are the controller names, and the
		 *   values are {@link gui.app.Controller} instances.
		 */
		createControllers : function() {
			return {};  // empty map by default
		},
		
		
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
		 *         this.getController( 'myController').doSomething();  // `myController` would have been a controller set up in {@link #createControllers}
		 *     }
		 * 
		 * @protected
		 * @template
		 * @method init
		 */
		init : _.noop,
		
		
		/**
		 * Handles when the page (document) is ready by rendering the Viewport. This method may be overridden (extended) to
		 * add any post-rendering logic, although one might want to listen to the {@link #viewport viewport's} 
		 * {@link gui.Viewport#event-render render} event from the {@link #init} method instead.
		 * 
		 * @protected
		 */
		onDocumentReady : function() {
			this.viewport.render( this.renderTo );
		},
		
		
		// ------------------------------------
		
		
		/**
		 * Retrieves a controller by name. Controllers are set up from the {@link #createControllers} method.
		 * 
		 * Example:
		 * 
		 *     // set up a controller in this method
		 *     createControllers : function() {
		 *         return {
		 *             mainDisplay: new MainDisplayController()
		 *         };
		 *     },
		 *     
		 *     ...
		 *     
		 *     // Retrieve the controller from another method
		 *     init : function() {
		 *         this._super( arguments );
		 *         
		 *         var mainDisplayController = this.getController( 'mainDisplay' );
		 *         mainDisplayController.doSomething();
		 *     }
		 * 
		 * @protected
		 * @param {String} `name`
		 * @return {gui.app.Controller} The controller for the given `name`, or `null` if there is no controller
		 *   registered for that name.
		 */
		getController : function( name ) {
			return this.controllers[ name ] || null;
		},
		
		
		/**
		 * Allows any **dynamic** dependencies (specified by the {@link #getDynamicDependencyList} method) to be retrieved
		 * after they are loaded. The dynamic dependencies will be available to all Application hook methods when they are
		 * called, including {@link #createDataContainers}, {@link #createViewport}, {@link #createControllers}, and 
		 * {@link #init}.
		 * 
		 * @protected
		 * @param {String} dependencyPath The path for the dynamic dependency.
		 * @return {Mixed} The dependency that was loaded from the `dependencyPath`. If no dependency was loaded for the given
		 *   `dependencyPath` an error is thrown.
		 */
		getDynamicDependency : function( dependencyPath ) {
			var dependency = this.dynamicDependencies[ dependencyPath ];
			
			// <debug>
			if( !dependency ) throw new Error( "Error: No dependency for the path '" + dependencyPath + "' was requested." );
			// </debug>
			
			return dependency;
		},
		
		
		/**
		 * Determines if the Application has fully {@link #initialized}. This will return `false` while the Application is waiting
		 * for dynamic dependencies to be loaded, and will return `true` after the {@link #init} method has been executed.
		 * 
		 * Note that this method may return `true` before the {@link #viewport} is rendered, as the {@link #viewport} is only 
		 * rendered after the document is ready.
		 */
		isInitialized : function() {
			return !!this.initialized;
		},
		
		
		// ------------------------------------
		
		// Destruction Functionality
		
		
		/**
		 * Destroys the Application.
		 * 
		 * Note: Subclasses should override the {@link #onDestroy} hook method instead of this method for their
		 * own subclass-specific destruction logic.
		 */
		destroy : function() {
			if( !this.isDestroyed() ) {
				this.onDestroy();  // call hook method
				
				// Only destroy the controllers and the viewport if the Application was fully initialized. If the Application was
				// destroyed while loading dynamic dependencies, then these will not have been created.
				if( this.isInitialized() ) {
					// Destroy controllers first
					_.forOwn( this.controllers, function( controller ) { controller.destroy(); } );
					
					// Destroy the viewport second
					this.viewport.destroy();
				}
				
				this.destroyed = true;
				this.fireEvent( 'destroy', this );  // note: fire 'destroy' event before purging listeners!
				this.purgeListeners();
			}
		},
		
		
		/**
		 * Hook method for the destruction of the Application.
		 * 
		 * Subclasses should call their superclass method after any subclass-specific processing. For example:
		 * 
		 *     onDestroy : function() {
		 *         this.popupWindow.destroy();  // destroy a {@link gui.window.Window} that was created by the subclass
		 *         
		 *         this._super( arguments );    // now call the superclass method
		 *     }
		 * 
		 * 
		 * Important: If your subclass loads dynamic dependencies, it is possible that {@link #method-destroy} is called before those
		 * dependencies have loaded (and therefore before your class has finished initializing). If this is the case where 
		 * {@link #method-destroy} is called during this time, the Application class will not continue initializing. Check the state of 
		 * the {@link #isInitialized initialized} flag to know whether or not you need to destroy any objects that would have been 
		 * created during the initialization process.
		 * 
		 * For example:
		 * 
		 *     beforeInit : function() {
		 *         this.logger = new Logger();  // will always be instantiated since it is happening before dynamic dependencies are loaded
		 *     },
		 *     
		 *     init : function() {
		 *         this.modalWindow = new Window();  // will only be instantiated if the Application finished initializing
		 *     },
		 *     
		 *     onDestroy : function() {
		 *         this.logger.destroy();  // always destroy this, since {@link #beforeInit} is always executed (before dependencies are even requested)
		 *         
		 *         if( this.isInitialized() ) {
		 *             this.modalWindow.destroy();  // only destroy this if the application made it to the {@link #init} method
		 *         }
		 *     
		 *         this._super( arguments );
		 *     }
		 * 
		 * @protected
		 * @template
		 */
		onDestroy : _.noop,
		
		
		/**
		 * Determines if the Application has been destroyed.
		 * 
		 * @return {Boolean}
		 */
		isDestroyed : function() {
			return !!this.destroyed;
		}
		
	} );
	
	return Application;
	
} );