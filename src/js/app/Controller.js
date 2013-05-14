/*global define */
define( [
	'lodash',
	'Observable',
	'jqc/Jqc',
	'jqc/ComponentQuery'
], function( _, Observable, Jqc, ComponentQuery ) {
	
	/**
	 * @class jqc.app.Controller
	 * @extends Observable
	 * 
	 * Base class Controller which should be extended by implementations to implement controller logic.
	 * 
	 * The Controller must be provided the {@link #view view(s)} ({@link jqc.Component Components}) that it is to work with. 
	 * It uses this to query for components, and listen to events from. This may be one Component (most likely an outer
	 * {@link jqc.Viewport} or {@link jqc.Container}), or multiple components to reference and listen to events from. The
	 * Component(s) provided to the {@link #view} config give the scope of the Controllers reach, where both those components
	 * and their descendant components may be manipulated / listened to.
	 * 
	 * 
	 * ## Referencing Components
	 * 
	 * A Controller may set up {@link #addRef refs} to easily retrieve references to components, based on a {@link jqc.ComponentQuery}
	 * selector. The {@link #addRef} method adds a reference (usually in the {@link #init} method), and {@link #getRef} retrieves 
	 * the component(s) for that reference. For example, defining a Controller implementation subclass:
	 * 
	 *     define( [
	 *         'jqc/Controller'
	 *     ], function( Controller ) {
	 *     
	 *         var UserController = Controller.extend( {
	 *         
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 // Set up refs
	 *                 this.addRef( 'userPanel', '#mainUserPanel' );
	 *                 this.addRef( 'userTextFields', 'textfield', { multiple: true } );
	 *                 
	 *                 
	 *                 // (If we wanted to retrieve the components right here from the init() method...)
	 *                 this.getRef( 'userPanel' );      // --> Retrieves the panel (or any component) with an id of 'mainUserPanel'
	 *                 this.getRef( 'userTextFields' ); // --> Retrieves the array of {@link jqc.form.field.Text} components
	 *             }
	 *         
	 *         } );
	 *         
	 *         return UserController;
	 *         
	 *     } );
	 */
	var Controller = Observable.extend( {
		
		/**
		 * @cfg {jqc.Component/jqc.Component[]} view (required)
		 * 
		 * The view(s) that the Controller should manage. References retrieved for components and events listened
		 * to on components must exist as one of the components provided to this config, or as a descendant of one
		 * of the components provided to this config (in which case, the particular component must be a {@link jqc.Container}
		 * to have descendants).
		 */
		
		
		/**
		 * @protected
		 * @property {Object} refs
		 * 
		 * An Object (map) which is keyed by the ref names, and whose values are Objects with the following properties:
		 * 
		 * - **selector** (String) : The selector string for the ref.
		 * - **multiple** (Boolean} : `true` if this is a multi-component selector (in which case an array is returned
		 *   when retrieving the ref), or `false` if the selector returns a single component.
		 * - **noCache** (Boolean) : `true` if this ref should not cache its result, and instead re-query the {@link #view}
		 *   when the ref is requested again.
		 * - **cachedComponents** (jqc.Component[]) : An array of the cached component references. This is populated after the
		 *   first use of the ref.
		 */
		
		
		/**
		 * @constructor
		 * @param {Object} cfg Any of the configuration options of this class, specified in an Object (map).
		 */
		constructor : function( cfg ) {
			_.assign( this, cfg );
			this._super( arguments );
			
			this.addEvents(
				/**
				 * Fires when the Controller has been destroyed.
				 * 
				 * @event destroy
				 * @param {jqc.app.Controller} controller This Controller instance.
				 */
				'destroy'
			);
			
			// <debug>
			if( !this.view ) throw new Error( "`view` cfg required" );
			// </debug>
			
			this.refs = {};
			
			this.init();
		},
		
		
		/**
		 * Hook method which should be overridden in subclasses to implement the Controller's initialization logic.
		 * 
		 * @protected
		 * @template
		 * @method init
		 */
		init : Jqc.emptyFn,
		
		
		/**
		 * Adds a reference to one or more components that can be retrieved easily by name. A reference is related
		 * to a {@link jqc.ComponentQuery ComponentQuery} selector, which is executed when the reference is retrieved
		 * (via {@link #getRef}).
		 * 
		 * After the first retrieval of a reference with {@link #getRef}, the result is cached for subsequent {@link #getRef}
		 * calls.
		 * 
		 * @protected
		 * @param {String} refName
		 * @param {String} selector
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.multiple=false] `true` to create a reference which returns multiple
		 *   components. The return from {@link #getRef} will be an array of {@link jqc.Component Components}
		 *   if this option is set to `true`. By default, a ref only retrieves a single component, and its
		 *   instance is directly returned by {@link #getRef}. 
		 * @param {Boolean} [options.noCache=true] `false` to prevent the caching of the retrieved components after they
		 *   are retrieved with {@link #getRef}. This is useful for `multiple` refs (selectors which are to retrieve multiple 
		 *   components), where the number of components may change due to additions or removals from the page.
		 */
		addRef : function( refName, selector, options ) {
			options = options || {};
			
			this.refs[ refName ] = {
				selector : selector,
				multiple : !!options.multiple,
				noCache  : !!options.noCache
			};
		},
		
		
		/**
		 * Retrieves a {@link jqc.Component Component} by ref name (or multiple {@link jqc.Component Components}, if the 
		 * `multiple` flag was set to `true` when {@link #addRef adding the ref}).
		 * 
		 * @param {String} refName
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.forceQuery=false] `true` to force the reference to re-query for the component(s),
		 *   even if the component references have previously been cached. This may be useful for "multi-component"
		 *   references, if the components on the page have changed, and a new query for them must be made. (Single
		 *   component references are automatically handled if the component has been 
		 *   {@link jqc.Component#method-destroy destroyed}.)
		 * @return {jqc.Component/jqc.Component[]} A single component (in the case of singular references, which are
		 *   the default), or an array if the `multiple` flag was provided for the reference in {@link #addRef}.
		 */
		getRef : function( refName, options ) {
			var ref = this.refs[ refName ];
			
			// <debug>
			if( !ref ) throw new Error( "A ref with name: '" + refName + "' was not defined using addRef()" );
			// </debug>
			
			options = options || {};
			
			var cachedComponents = ref.cachedComponents;
			if( cachedComponents === undefined || options.forceQuery || ref.noCache ) {
				ref.cachedComponents = cachedComponents = ComponentQuery.query( ref.selector, this.view );
			}
			
			return ( ref.multiple ) ? cachedComponents : cachedComponents[ 0 ] || null;
		},
		
		
		/**
		 * Destroys the Controller by removing all {@link #refs references} and removing the listeners that
		 * have been set up.
		 * 
		 * Subclasses should not override this method, but instead override the {@link #onDestroy} hook method
		 * to implement any subclass-specific destruction processing.
		 */
		destroy : function() {
			this.onDestroy();
			
			this.fireEvent( 'destroy', this );
			this.purgeListeners();  // Note: purgeListeners() must be called after 'destroy' event has fired!
		},
		
		
		/**
		 * Hook method which should be overridden by subclasses to implement their own subclass-specific
		 * destruction logic. The superclass method should be called after subclass-specific processing.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : Jqc.emptyFn
		
	} );
	
	
	return Controller;
	
} );