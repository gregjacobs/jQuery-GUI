/*global define */
define( [
	'lodash',
	'Class',
	'jqc/Jqc'
], function( _, Class, Jqc ) {
	
	/**
	 * @class jqc.util.ModelBindable
	 * @extends Object
	 * 
	 * This class is intended to be used as a mixin. It allows any class that it is mixed into (the "target" class in these docs) to have 
	 * a {@link data.Model} bound to it by providing the common functionality to allow a model's events to be listened to and handled.
	 * These same event listeners are also removed when the model is unbound, and the class provides the functionality to make sure that
	 * the same model isn't bound over itself.
	 * 
	 * This mixin provides the basic method to {@link #bindModel bind a model}, which automatically unbinds any previously-bound 
	 * {@link data.Model Model} in the process. Classes using this mixin should implement the {@link #getModelListeners} method, 
	 * to specify which listeners should automatically be attached when a model is bound, and unattached when the model is unbound.
	 * 
	 * The target class may also implement the {@link #onModelBind} method, to detect and handle when a new {@link data.Model} has
	 * been bound, and/or when the currently-bound model has been unbound.
	 * 
	 * Here is an example of mixing this class into a {@link jqc.Component Component}, to make the Component data-bound to a Model:
	 * 
	 *     define( [
	 *         'jqc/Component',
	 *         'jqc/util/ModelBindable'
	 *     ], function( Component, ModelBindable ) {
	 *         
	 *         var MyBindableComponent = Component.extend( {
	 *             mixins : [ ModelBindable ],
	 *             
	 *             
	 *             initComponent : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 // Call ModelBindable's constructor, in the scope of this object.
	 *                 // Even though there is no implementation in the ModelBindable constructor 
	 *                 // at this time, it is a good idea in case an implementation is added in the future.
	 *                 ModelBindable.call( this );
	 *             }
	 *             
	 *             // ...
	 *             
	 *             // Specifies the listeners that will be added to the model
	 *             getModelListeners : function( model ) {
	 *                 return {
	 *                     'loadbegin' : this.onLoadBegin,
	 *                     'load'      : this.onLoad,
	 *                     'change'    : this.onChange,
	 *                     scope       : this
	 *                 };
	 *             },
	 *             
	 *             
	 *             onLoadBegin : function() {
	 *                 // handle the model's `loadbegin` event here
	 *             },
	 *             
	 *             onLoad : function() {
	 *                 // handle the model's `load` event here
	 *             },
	 *             
	 *             onChange : function() {
	 *                 // handle the model's `change` event here
	 *             },
	 *             
	 *             
	 *             // ...
	 *             
	 *             
	 *             onDestroy : function() {
	 *                 // Don't forget to unbind any currently-bound model when the Component 
	 *                 // is destroyed!
	 *                 this.unbindModel();
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
	var ModelBindable = Class.create( {
		
		/**
		 * @protected
		 * @cfg {String} modelProp
		 * 
		 * The name of the property which stores the {@link data.Model} that is bound to this object
		 * (i.e. the object that this class is mixed into).
		 * 
		 * This property can be specified by the mixed-into class, to change the property name that it stores
		 * the model under.
		 */
		modelProp : 'model',
		
		
		/**
		 * @private
		 * @property {Object} modelListeners
		 * 
		 * The listeners that were bound to the currently stored {@link data.Model}, in the {@link #bindModelListeners}
		 * method. If there has been no Model bound to this view yet, this will be `undefined`.
		 */
		
		/**
		 * @private
		 * @property {Boolean} firstModelBindComplete
		 * 
		 * Property which is set to true after an initial model bind has been made.
		 */
		
		
		/**
		 * Binds a {@link data.Model} to this object. The model will be set to the property specified by
		 * the {@link #modelProp}. Any previous model will be unbound.
		 * 
		 * @param {data.Model} model The Model to bind. To unbind the currently-bound model,
		 *   either pass `null`, or call {@link #unbindModel} instead.
		 */
		bindModel : function( model ) {
			var modelProp = this.modelProp,
			    currentModel = this[ modelProp ] || null;  // normalize `undefined` to `null`, for the comparison against the `model` arg (should the `model` arg be null)
			
			// Only bind a new model if it is different than the currently-bound model. However, always accept the 
			// model if no model has been bound yet. This covers if the class has a config option that matches the 
			// `modelProp` name (for instance, "model"), in which case that initial model should be bound. This
			// would be the case if a class calls bindModel() with that initial model from its constructor function.
			// The 'first bind' functionality should only happen if there is actually a model to bind however. Don't 
			// accept `null` in this case.
			if( currentModel !== model || ( !this.firstModelBindComplete && model ) ) {
				// If there is a current model, and there have been listeners bound to it (i.e. it is not the initial bind
				// call from having a `model` config), then unbind its listeners in preparation to bind a new Model
				if( currentModel ) {
					this.unbindModelListeners();
				}
				
				this[ modelProp ] = model;  // store the new model
				if( model ) {
					this.bindModelListeners();
				}
				this.firstModelBindComplete = true;
				
				// Figure out the correct "old" (previously-bound) model. If the new model is the same as the old 
				// model (for the case of binding a pre-configured model), then set that to `null` for the method
				// call (as there really was no previously-bound model).
				var oldModel = ( currentModel === model ) ? null : currentModel || null;
				this.onModelBind( model, oldModel );
			}
		},
		
		
		/**
		 * Unbinds the currently-bound {@link data.Model}, if there is one. Removes its event listeners (which are
		 * specified by the {@link #getModelListeners} method), and then sets the reference to the model (governed 
		 * by the {@link #modelProp} config) to `null`.
		 */
		unbindModel : function() {
			var modelProp = this.modelProp,
			    currentModel = this[ modelProp ];
			
			if( currentModel ) {
				this.unbindModelListeners();
				this[ modelProp ] = null;
				
				this.onModelBind( null, /* the old model */ currentModel );
			}
		},
		
		
		/**
		 * Hook method which is called when a new {@link data.Model} has been bound to this object using 
		 * {@link #bindModel}. Also called when a {@link data.Model} is unbound from this object, either
		 * by `null` being passed to {@link #bindModel}, or {@link #unbindModel} being called.
		 * 
		 * @protected
		 * @template
		 * @method onModelBind
		 * @param {data.Model} model The newly bound model. Will be `null` if the previous model was
		 *   simply unbound (i.e. `null` was passed to {@link #bindModel}, or {@link #unbindModel} was called). 
		 * @param {data.Model} oldModel The model that was just unbound. Will be `null` if there was no
		 *   previously-bound model.
		 */
		onModelBind : Jqc.emptyFn,
		
		
		/**
		 * Retrieves the current {@link data.Model Model} which is bound to this object. Returns `null` if there
		 * is no currently-bound Model.
		 * 
		 * @return {data.Model} The currently-bound model, or `null` if there is none.
		 */
		getModel : function() {
			return this[ this.modelProp ] || null;
		},
		
		
		/**
		 * Binds listeners to the current model, so that the view can refresh itself upon changes. The listeners 
		 * that are set up are defined by the {@link #getModelListeners} method, which should be overridden by 
		 * the target class to listen for the events that are needed.
		 * 
		 * @private
		 */
		bindModelListeners : function() {
			var model = this[ this.modelProp ],
			    listeners = _.clone( this.getModelListeners( model ) );  // shallow copy of the listeners
			
			model.on( listeners );
			this.modelListeners = listeners;
		},
		
		
		/**
		 * Retrieves an Object (map) of the listeners that should be set up on the model when one is bound to this object. 
		 * This method should be overridden by the target class to add the events that should be listened for. Example:
		 * 
		 *     require( [
		 *         'Class',
		 *         'jqc/util/ModelBindable'
		 *     ], function( Class, ModelBindable ) {
		 *         
		 *         var MyBindableClass = new Class( {
		 *             mixins : [ ModelBindable ],
		 *             
		 *             // ...
		 *             
		 *             getModelListeners : function( model ) {
		 *                 return {
		 *                     'loadbegin' : this.onLoadBegin,
		 *                     'load'      : this.onLoad,
		 *                     'change'    : this.onChange,
		 *                     scope       : this
		 *                 };
		 *             },
		 *             
		 *             
		 *             onLoadBegin : function() {
		 *                 // ...
		 *             },
		 *             
		 *             onLoad : function() {
		 *                 // ...
		 *             },
		 *             
		 *             onChange : function() {
		 *                 // ...
		 *             }
		 *             
		 *         } );
		 *         
		 *     } );
		 * 
		 * Note that the handler functions should always be references to functions defined in the class, not anonymous
		 * functions. The same function references are needed to unbind the model later, and providing an anonymous
		 * function as a handler for an event will not allow the event listener to be removed.
		 * 
		 * @protected
		 * @param {data.Model} model The Model being bound. Note that listeners should not be attached here,
		 *   but the Model instance is provided in case it needs to be queried for any reason (such as for a particular 
		 *   Model subclass type).
		 * @return {Object} An {@link Observable#addListener addListener} config object for the listeners to be added.
		 */
		getModelListeners : function( model ) {
			return {};
		},
		
		
		/**
		 * Unbinds the currently-bound model's listeners, which were set up in {@link #bindModelListeners}.
		 * 
		 * @private
		 */
		unbindModelListeners : function() {
			var currentModel = this[ this.modelProp ];
			if( currentModel && this.modelListeners ) {
				currentModel.un( this.modelListeners );  // the Model listener's set up in bindModelListeners()
			}
		}
		
	} );
	
	return ModelBindable;
	
} );