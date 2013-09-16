/*global define */
define( [
	'lodash',
	'Class',
	'jqc/Jqc'
], function( _, Class, Jqc ) {
	
	/**
	 * @class jqc.util.CollectionBindable
	 * @extends Object
	 * 
	 * This class is intended to be used as a mixin. It allows any class that it is mixed into (the "target" class in these docs) to have 
	 * a {@link data.Collection} bound to it by providing the common functionality to allow a collection's events to be listened to and handled.
	 * These same event listeners are also removed when the collection is unbound, and the class provides the functionality to make sure that
	 * the same collection isn't bound over itself.
	 * 
	 * This mixin provides the basic method to {@link #bindCollection bind a collection}, which automatically unbinds any previously-bound 
	 * {@link data.Collection Collection} in the process. Classes using this mixin should implement the {@link #getCollectionListeners} method, 
	 * to specify which listeners should automatically be attached when a collection is bound, and unattached when the collection is unbound.
	 * 
	 * The target class may also implement the {@link #onCollectionBind} method, to detect and handle when a new {@link data.Collection} has
	 * been bound, and/or when the currently-bound collection has been unbound.
	 * 
	 * Here is an example of mixing this class into a {@link jqc.Component Component}, to make the Component data-bound to a Collection:
	 * 
	 *     define( [
	 *         'jqc/Component',
	 *         'jqc/util/CollectionBindable'
	 *     ], function( Component, CollectionBindable ) {
	 *         
	 *         var MyBindableComponent = Component.extend( {
	 *             mixins : [ CollectionBindable ],
	 *             
	 *             
	 *             initComponent : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 // Call CollectionBindable's constructor, in the scope of this object.
	 *                 // Even though there is no implementation in the CollectionBindable constructor 
	 *                 // at this time, it is a good idea in case an implementation is added in the future.
	 *                 CollectionBindable.call( this );
	 *             }
	 *             
	 *             // ...
	 *             
	 *             
	 *             // Specifies the listeners that will be added to the collection
	 *             getCollectionListeners : function( collection ) {
	 *                 return {
	 *                     'load'   : this.onLoad,          // listen to `load` and `change`
	 *                     'change' : this.onModelChange,   // events of the bound collection
	 *                     scope    : this
	 *                 };
	 *             },
	 *             
	 *             
	 *             onLoad : function( collection ) {
	 *                 // handle the collection's `load` event here
	 *             },
	 *             
	 *             onModelChange : function( collection ) {
	 *                 // handle a model in the bound collection changing here
	 *             },
	 *             
	 *             
	 *             // ...
	 *             
	 *             
	 *             onDestroy : function() {
	 *                 // Don't forget to unbind any currently-bound collection when the Component 
	 *                 // is destroyed!
	 *                 this.unbindCollection();
	 *                 
	 *                 this._super( arguments );
	 *             }
	 *             
	 *         } );
	 *         
	 *         return MyBindableComponent;
	 *         
	 *     } );
	 */
	var CollectionBindable = Class.create( {
		
		/**
		 * @protected
		 * @cfg {String} collectionProp
		 * 
		 * The name of the property which stores the {@link data.Collection} that is bound to this object
		 * (i.e. the object that this class is mixed into).
		 * 
		 * This property can be specified by the mixed-into class, to change the property name that it stores
		 * the collection under.
		 */
		collectionProp : 'collection',
		
		
		/**
		 * @private
		 * @property {Object} collectionListeners
		 * 
		 * The listeners that were bound to the currently stored {@link data.Collection}, in the {@link #bindCollectionListeners}
		 * method. If there has been no Collection bound to this view yet, this will be `undefined`.
		 */
		
		/**
		 * @private
		 * @property {Boolean} firstCollectionBindComplete
		 * 
		 * Property which is set to true after an initial collection bind has been made.
		 */
		
		
		/**
		 * Binds a {@link data.Collection} to this object. The collection will be set to the property specified by
		 * the {@link #collectionProp}. Any previous collection will be unbound.
		 * 
		 * @param {data.Collection} collection The Collection to bind. To unbind the currently-bound collection,
		 *   either pass `null`, or call {@link #unbindCollection} instead.
		 */
		bindCollection : function( collection ) {
			var collectionProp = this.collectionProp,
			    currentCollection = this[ collectionProp ] || null;  // normalize `undefined` to `null`, for the comparison against the `collection` arg (should the `collection` arg be null)
			
			// Only bind a new collection if it is different than the currently-bound collection. However, always accept the 
			// collection if no collection has been bound yet. This covers if the class has a config option that matches the 
			// `collectionProp` name (for instance, "collection"), in which case that initial collection should be bound. This
			// would be the case if a class calls bindCollection() with that initial collection from its constructor function.
			// The 'first bind' functionality should only happen if there is actually a collection to bind however. Don't 
			// accept `null` in this case.
			if( currentCollection !== collection || ( !this.firstCollectionBindComplete && collection ) ) {
				// If there is a current collection, and there have been listeners bound to it (i.e. it is not the initial bind
				// call from having a `collection` config), then unbind its listeners in preparation to bind a new Collection
				if( currentCollection ) {
					this.unbindCollectionListeners();
				}
				
				this[ collectionProp ] = collection;  // store the new collection
				if( collection ) {
					this.bindCollectionListeners();
				}
				this.firstCollectionBindComplete = true;
				
				// Figure out the correct "old" (previously-bound) collection. If the new collection is the same as the old 
				// collection (for the case of binding a pre-configured collection), then set that to `null` for the method
				// call (as there really was no previously-bound collection).
				var oldCollection = ( currentCollection === collection ) ? null : currentCollection || null;
				this.onCollectionBind( collection, oldCollection );
			}
		},
		
		
		/**
		 * Unbinds the currently-bound {@link data.Collection}, if there is one. Removes its event listeners (which are
		 * specified by the {@link #getCollectionListeners} method), and then sets the reference to the collection (governed 
		 * by the {@link #collectionProp} config) to `null`.
		 */
		unbindCollection : function() {
			var collectionProp = this.collectionProp,
			    currentCollection = this[ collectionProp ];
			
			if( currentCollection ) {
				this.unbindCollectionListeners();
				this[ collectionProp ] = null;
				
				this.onCollectionBind( null, /* the old collection */ currentCollection );
			}
		},
		
		
		/**
		 * Hook method which is called when a new {@link data.Collection} has been bound to this object using 
		 * {@link #bindCollection}. Also called when a {@link data.Collection} is unbound from this object, either
		 * by `null` being passed to {@link #bindCollection}, or {@link #unbindCollection} being called.
		 * 
		 * @protected
		 * @template
		 * @method onCollectionBind
		 * @param {data.Collection} collection The newly bound collection. Will be `null` if the previous collection was
		 *   simply unbound (i.e. `null` was passed to {@link #bindCollection}, or {@link #unbindCollection} was called). 
		 * @param {data.Collection} oldCollection The collection that was just unbound. Will be `null` if there was no
		 *   previously-bound collection.
		 */
		onCollectionBind : Jqc.emptyFn,
		
		
		/**
		 * Retrieves the current {@link data.Collection Collectoin} which is bound to this object. Returns `null` if there
		 * is no currently-bound Collection.
		 * 
		 * @return {data.Collection} The currently-bound collection, or `null` if there is none.
		 */
		getCollection : function() {
			return this[ this.collectionProp ] || null;
		},
		
		
		/**
		 * Binds listeners to the current collection, so that the view can refresh itself upon changes. The listeners 
		 * that are set up are defined by the {@link #getCollectionListeners} method, which should be overridden by 
		 * the target class to listen for the events that are needed.
		 * 
		 * @private
		 */
		bindCollectionListeners : function() {
			var collection = this[ this.collectionProp ],
			    listeners = _.clone( this.getCollectionListeners( collection ) );  // shallow copy of the listeners
			
			collection.on( listeners );
			this.collectionListeners = listeners;
		},
		
		
		/**
		 * Retrieves an Object (map) of the listeners that should be set up on the collection when one is bound to this object. 
		 * This method should be overridden by the target class to add the events that should be listened for. Example:
		 * 
		 *     require( [
		 *         'Class',
		 *         'jqc/util/CollectionBindable'
		 *     ], function( Class, CollectionBindable ) {
		 *         
		 *         var MyBindableClass = Class.create( {
		 *             mixins : [ CollectionBindable ],
		 *             
		 *             // ...
		 *             
		 *             getCollectionListeners : function( collection ) {
		 *                 return {
		 *                     'load'   : this.onLoad,
		 *                     'change' : this.onModelChange,
		 *                     scope    : this
		 *                 };
		 *             },
		 *             
		 *             
		 *             onLoad : function() {
		 *                 // ...
		 *             },
		 *             
		 *             onModelChange : function() {
		 *                 // ...
		 *             }
		 *             
		 *         } );
		 *         
		 *     } );
		 * 
		 * Note that the handler functions should always be references to functions defined in the class, not anonymous
		 * functions. The same function references are needed to unbind the collection later, and providing an anonymous
		 * function as a handler for an event will not allow the event listener to be removed.
		 * 
		 * @protected
		 * @param {data.Collection} collection The Collection being bound. Note that listeners should not be attached here,
		 *   but the Collection instance is provided in case it needs to be queried for any reason (such as for a particular 
		 *   Collection subclass type).
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners to be added.
		 */
		getCollectionListeners : function( collection ) {
			return {};
		},
		
		
		/**
		 * Unbinds the currently-bound collection's listeners, which were set up in {@link #bindCollectionListeners}.
		 * 
		 * @private
		 */
		unbindCollectionListeners : function() {
			var currentCollection = this[ this.collectionProp ];
			if( currentCollection && this.collectionListeners ) {
				currentCollection.un( this.collectionListeners );  // the Collection listener's set up in bindCollectionListeners()
			}
		}
		
	} );
	
	return CollectionBindable;
	
} );