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
	 * ## View Component References
	 * 
	 * A Controller may set up {@link #cfg-refs} to easily retrieve references to components, based on a 
	 * {@link jqc.ComponentQuery ComponentQuery} selector. Alternatively, the {@link #addRef} method may also be used to 
	 * dynamically add references. 
	 * 
	 * References to component(s) are retrieved using the {@link #getRef} method. The {@link #getRef} accepts the reference
	 * name, and returns the component, or array of components (if the `multiple` flag was set to true), for that reference. 
	 * For example, defining a Controller implementation subclass:
	 * 
	 *     define( [
	 *         'jqc/Controller'
	 *     ], function( Controller ) {
	 *     
	 *         var UserController = Controller.extend( {
	 *             
	 *             refs : {
	 *                 'userPanel'      : '#mainUserPanel',
	 *                 'userTextFields' : { selector: 'textfield', multiple: true }
	 *             },
	 *         
	 *             init : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 // (If we wanted to retrieve the components right here in the init() method...)
	 *                 this.getRef( 'userPanel' );      // --> Retrieves the Panel instance with an id of 'mainUserPanel'
	 *                 this.getRef( 'userTextFields' ); // --> Retrieves the array of {@link jqc.form.field.Text} components
	 *             }
	 *         
	 *         } );
	 *         
	 *         
	 *         return UserController;
	 *         
	 *     } );
	 * 
	 * The selector query for a reference is only executed the first time that it is called for from {@link #getRef}. The 
	 * component(s) that matched the selector are then cached for subsequent calls to {@link #getRef}. This behavior may
	 * be overridden by either passing the `forceQuery` option to {@link #getRef}, or if the reference is defined with
	 * the `noCache` option set to `true`. A reason this may be useful is if components are dynamically added to the {@link #view}
	 * that this Controller is working with, in which case you may want to retrieve the latest list of components.
	 * 
	 * See the {@link #cfg-refs} config for more details on setting up references.
	 */
	var Controller = Observable.extend( {
		
		inheritedStatics : {
			
			// Subclass-specific setup
			/**
			 * @ignore
			 */
			onClassExtended : function( NewController ) {
				// Extend `refs` config from superclass
				var proto = NewController.prototype,
				    superclassProto = NewController.superclass,
				    superclassRefs = superclassProto.refs;
				
				if( !proto.hasOwnProperty( 'refs' ) ) {
					proto.refs = _.clone( superclassRefs ) || {};
				} else {
					proto.refs = _.assign( {}, superclassRefs, proto.refs );  // the refs on the new class's prototype take precedence
				}
			}
			
		},
		
		
		/**
		 * @cfg {jqc.Component} view (required)
		 * 
		 * The view Component that the Controller should manage. {@link #cfg-refs References} retrieved for components, and events 
		 * listened to must either be on the Component provided to this config, or a descendant of the component (which
		 * in this case is a {@link jqc.Container Container}) provided to this config.
		 * 
		 * Most often, this config will be the the page's outermost {@link jqc.Viewport Viewport} (which itself is a 
		 * {@link jqc.Container Container} subclass). However, this may also be any 
		 * {@link jqc.Component Component}/{@link jqc.Container Container}, which will limit the scope of what component(s) the 
		 * Controller controls.
		 * 
		 * As an example setup for a page:
		 * 
		 *     require( [
		 *         'jquery',
		 *         'jqc/Viewport',
		 *         'my/app/Controller'  // your own jqc.app.Controller subclass, which implements your page's logic
		 *     ], function( $, Viewport, Controller ) {
		 *         
		 *         var viewport = new Viewport( {
		 *             items : [ 
		 *                 // all of the page's view components go here,
		 *                 // in their nested hierarchy
		 *             ]
		 *         } );
		 *             
		 *         var controller = new Controller( {
		 *             view : viewport   // pass the Viewport as the view that the Controller controls
		 *         } );
		 *         
		 *         
		 *         // Render the Viewport on doc ready
		 *         $( document ).ready( function() {
		 *             viewport.render( 'body' );
		 *         } );
		 *         
		 *     } );
		 */
		
		/**
		 * @cfg {Object} refs
		 * 
		 * An Object (map) for component references that the Controller should set up. This config should be added to the
		 * **prototype** of the Controller, in a Controller subclass. See the documentation of this class for an example of
		 * how to create a Controller subclass.
		 * 
		 * References are based on a {@link jqc.ComponentQuery ComponentQuery} selector, and make it easy to retrieve matching 
		 * component(s) throughout the Controller's code using {@link #getRef}.
		 * 
		 * This Object should be keyed by the ref names, and whose values are Objects with the following properties:
		 * - **selector** (String) : The selector string for the ref.
		 * - **multiple** (Boolean) : (Optional) `true` if this is a multi-component selector (in which case an array is returned
		 *   when retrieving the ref), or `false` if the selector returns a single component. Defaults to `false`.
		 * - **noCache** (Boolean) : (Optional) `true` if this ref should not cache its result, and instead re-query the {@link #view}
		 *   when the ref is requested again. Defaults to `false`.
		 * 
		 * The values may also simply be a string, where the string is taken as the selector.
		 * 
		 * Example:
		 * 
		 *     refs : {
		 *         'myComponent1' : '#myComponent1',  // shorthand use with just a selector
		 *         'myComponent2' : { selector: '#myComponent2' },
		 *         'myTextFields' : { selector: 'textfield', multiple: true },  // matches all TextField components
		 *         'myButtons'    : { selector: 'button', multiple: true, noCache: true }
		 *     }
		 *     
		 * `refs` extend to subclasses, but any refs defined in a subclass with the same name as one in a superclass
		 * will overwrite the superclass's ref.
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
			
			var refsConfig = this.refs;
			this.refs = {};  // reset `refs` property for how refs will be stored internally
			
			if( refsConfig ) {
				this.addRef( refsConfig );
			}
			
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
		 * This method accepts an alternative arguments list other than the one documented. It accepts an Object as the first
		 * (and only) argument, for a configuration object of ref(s) to add. This configuration object should matche the form that 
		 * the {@link #cfg-refs refs config} accepts. Example:
		 * 
		 *     this.addRef( {
		 *         'myComponent'  : '#myComponent',
		 *         'myTextFields' : { selector: 'textfield' },
		 *         'myButtons'    : { selector: 'button', multiple: true, noCache: true }
		 *     } );
		 * 
		 * @protected
		 * @param {String/Object} ref The reference name, or a configuration object for one or more refs. If providing a configuration
		 *   object, the rest of the parameters of this method are ignored.
		 * @param {String} selector The selector string to select components by.
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.multiple=false] `true` to create a reference which returns multiple
		 *   components. The return from {@link #getRef} will be an array of {@link jqc.Component Components}
		 *   if this option is set to `true`. By default, a ref only retrieves a single component, and its
		 *   instance is directly returned by {@link #getRef}. 
		 * @param {Boolean} [options.noCache=true] `false` to prevent the caching of the retrieved components after they
		 *   are retrieved with {@link #getRef}. This is useful for `multiple` refs (selectors which are to retrieve multiple 
		 *   components), where the number of components may change due to additions or removals from the page.
		 */
		addRef : function( ref, selector, options ) {
			if( typeof ref === 'string' ) {
				options = options || {};
				
				this.refs[ ref ] = {
					selector : selector,
					multiple : !!options.multiple,
					noCache  : !!options.noCache
				};
				
			} else {  // configuration object for the refs
				var refs = ref;  // for clarity, that this is an object which may have multiple refs
				
				refs = _.forOwn( refs, function( refCfg, refName, refs ) {
					if( typeof refCfg === 'string' )  // if the value was simply a selector string, convert it to an object now
						refCfg = { selector: refCfg };
					
					// Apply default properties for missing ones in the ref config
					refs[ refName ] = _.defaults( refCfg, {
						multiple : false,
						noCache  : false
					} );
				} );
				
				// Assign the new refs to the current map of refs
				_.assign( this.refs, refs );
			}
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
		 * Destroys the Controller by removing all {@link #property-refs references} and removing the listeners that
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