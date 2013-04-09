/*global define */
define( [
	'require',
	'jquery',
	'lodash',
	'Class',
	'data/Data',
	'data/DataComponent',
	'data/NativeObjectConverter',
	'data/persistence/operation/Read',
	'data/persistence/operation/Write',
	'data/persistence/operation/Batch',
	'data/Model'   // may be circular dependency, depending on load order. require( 'data/Model' ) is used internally
], function(
	require,
	jQuery,
	_,
	Class,
	Data,
	DataComponent,
	NativeObjectConverter,
	ReadOperation,
	WriteOperation,
	OperationBatch
) {

	/**
	 * @class data.Collection
	 * @extends data.DataComponent
	 * 
	 * Manages an ordered set of {@link data.Model Models}. This class itself is not meant to be used directly, 
	 * but rather extended and configured for the different collections in your application.
	 * 
	 * Ex:
	 *     
	 *     myApp.Todos = Collection.extend( {
	 *         model: myApp.Todo
	 *     } );
	 * 
	 * 
	 * Note: Configuration options should be placed on the prototype of a Collection subclass.
	 * 
	 * 
	 * ### Model Events
	 * 
	 * Collections automatically relay all of their {@link data.Model Models'} events as if the Collection
	 * fired it. The collection instance provides itself in the handler though. For example, Models' 
	 * {@link data.Model#event-change change} events:
	 *     
	 *     var Model = Model.extend( {
	 *         attributes: [ 'name' ]
	 *     } );
	 *     var Collection = Collection.extend( {
	 *         model : Model
	 *     } );
	 * 
	 *     var model1 = new Model( { name: "Greg" } ),
	 *         model2 = new Model( { name: "Josh" } );
	 *     var collection = new Collection( [ model1, model2 ] );
	 *     collection.on( 'change', function( collection, model, attributeName, newValue, oldValue ) {
	 *         console.log( "A model changed its '" + attributeName + "' attribute from '" + oldValue + "' to '" + newValue + "'" );
	 *     } );
	 * 
	 *     model1.set( 'name', "Gregory" );
	 *       // "A model changed its 'name' attribute from 'Greg' to 'Gregory'"
	 */
	var Collection = Class.extend( DataComponent, {
		
		inheritedStatics : {			
			
			/**
			 * Retrieves the {@link data.persistence.proxy.Proxy} that is configured for the Collection class. To retrieve
			 * a proxy that may belong to a particular collection, use the instance level {@link #method-getProxy}.
			 * 
			 * @inheritable
			 * @static
			 * @return {data.persistence.proxy.Proxy} The Proxy configured with the Model, or null.
			 */
			getProxy : function() {
				return this.prototype.proxy || null;
			}
			
		},

		
		/**
		 * @cfg {Function} model
		 * 
		 * The data.Model (sub)class which will be used to convert any anonymous data objects into
		 * its appropriate Model instance for the Collection. 
		 * 
		 * Note that if a factory method is required for the creation of models, where custom processing may be needed,
		 * override the {@link #createModel} method in a subclass.
		 * 
		 * It is recommended that you subclass data.Collection, and add this configuration as part of the definition of the 
		 * subclass. Ex:
		 * 
		 *     myApp.MyCollection = Collection.extend( {
		 *         model : myApp.MyModel
		 *     } );
		 */
		
		/**
		 * @cfg {data.persistence.proxy.Proxy} proxy
		 * 
		 * The persistence proxy to use (if any) to load or persist the Collection's data to/from persistent
		 * storage. If this is not configured, the proxy configured on the {@link #model} that this collection uses
		 * will be used instead. If neither are specified, the Collection may not {@link #method-load} or {@link #sync} its models. 
		 * 
		 * Note that this may be specified as part of a Collection subclass (so that all instances of the Collection inherit
		 * the proxy), or on a particular collection instance as a configuration option, or by using {@link #setProxy}.
		 */
		
		/**
		 * @cfg {Boolean} autoLoad
		 * 
		 * If no initial {@link #cfg-models} are specified (specifying inline data), and this config is 
		 * `true`, the Collection's {@link #method-load} method will be called immediately upon 
		 * instantiation to load the Collection.
		 * 
		 * If the {@link #pageSize} config is set, setting this to `true` will just cause the first page of
		 * data to be loaded. 
		 */
		autoLoad : false,
		
		/**
		 * @cfg {Number} pageSize
		 * 
		 * The number of models to load in a page when loading paged data (via {@link #loadPage}). This config
		 * must be set when loading paged data with {@link #loadPage}.
		 */
		
		/**
		 * @cfg {Boolean} clearOnPageLoad
		 * 
		 * `true` to remove all existing {@link data.Model Models} from the Collection when loading a new page of data 
		 * via {@link #loadPage}. This has the effect of only loading the requested page's models in the Collection. 
		 * Set to `false` to have the loaded models be added to the Collection, instead of replacing the existing ones.
		 */
		clearOnPageLoad : true,
		
		/**
		 * @cfg {Function} sortBy
		 * A function that is used to keep the Collection in a sorted ordering. Without one, the Collection will
		 * simply keep models in insertion order.
		 * 
		 * This function takes two arguments: each a {@link data.Model Model}, and should return `-1` if the 
		 * first model should be placed before the second, `0` if the models are equal, and `1` if the 
		 * first model should come after the second.
		 * 
		 * Ex:
		 *     
		 *     sortBy : function( model1, model2 ) { 
		 *         var name1 = model1.get( 'name' ),
		 *             name2 = model2.get( 'name' );
		 *         
		 *         return ( name1 < name2 ) ? -1 : ( name1 > name2 ) ? 1 : 0;
		 *     }
		 * 
		 * It is recommended that you subclass data.Collection, and add the sortBy function in the definition of the subclass. Ex:
		 * 
		 *     myApp.MyCollection = Collection.extend( {
		 *         sortBy : function( model1, model2 ) {
		 *             // ...
		 *         }
		 *     } );
		 *     
		 *     
		 *     // And instantiating:
		 *     var myCollection = new myApp.MyCollection();
		 */
		
		/**
		 * @cfg {Object/data.Model/Object[]/data.Model[]} models
		 * If providing a configuration object to the data.Collection constructor instead of an array of initial models, the initial 
		 * model(s) may be specified using this configuration option. Can be a single model or an array of models (or object / array of
		 * objects that will be converted to models).
		 * 
		 * Ex:
		 * 
		 *     // Assuming you have created a myApp.MyModel subclass of {@link data.Model},
		 *     // and a myApp.MyCollection subclass of data.Collection
		 *     var model1 = new myApp.MyModel(),
		 *         model2 = new myApp.MyModel();
		 *     
		 *     var collection = new myApp.MyCollection( {
		 *         models: [ model1, model2 ]
		 *     } );
		 */
		
		
		
		/**
		 * @protected
		 * @property {data.Model[]} models
		 * 
		 * The array that holds the Models, in order.
		 */
		
		/**
		 * @protected
		 * @property {Object} modelsByClientId
		 * 
		 * An object (hashmap) of the models that the Collection is currently holding, keyed by the models' {@link data.Model#clientId clientId}.
		 */
		
		/**
		 * @protected
		 * @property {Object} modelsById
		 * 
		 * An object (hashmap) of the models that the Collection is currently holding, keyed by the models' {@link data.Model#id id}, if the model has one.
		 */
		
		/**
		 * @protected
		 * @property {data.Model[]} removedModels
		 * 
		 * An array that holds Models removed from the Collection, which haven't yet been {@link #sync synchronized} to the server yet (by 
		 * {@link data.Model#method-destroy destroying} them).
		 */
		
		/**
		 * @protected
		 * @property {Boolean} modified
		 * 
		 * Flag that is set to true whenever there is an addition, insertion, or removal of a model in the Collection.
		 */
		modified : false,
		
		/**
		 * @protected
		 * @property {Boolean} loading
		 * 
		 * Flag that is set to true when the Collection is loading data through its {@link #proxy}.
		 */
		loading : false,
		
		/**
		 * @protected
		 * @property {Number} totalCount
		 * 
		 * This property is used to keep track of total number of models in a windowed (paged) data 
		 * set. It will be set as the result of a {@link #method-load} operation that reads the total count
		 * from a property provided by the backing data store. If no such property existed in the data,
		 * this will be set to 0.
		 */
		
		
		
		/**
		 * Creates a new Collection instance.
		 * 
		 * @constructor
		 * @param {Object/Object[]/data.Model[]} config This can either be a configuration object (in which the options listed
		 *   under "configuration options" can be provided), or an initial set of Models to provide to the Collection. If providing
		 *   an initial set of models, they must be wrapped in an array. Note that an initial set of models can be provided when using
		 *   a configuration object with the {@link #cfg-models} config.
		 */
		constructor : function( config ) {
			this.addEvents(
				/**
				 * Fires when one or more models have been added to the Collection. This event is fired once for each
				 * model that is added. To respond to a set of model adds all at once, use the {@link #event-addset} 
				 * event instead. 
				 * 
				 * @event add
				 * @param {data.Collection} collection This Collection instance.
				 * @param {data.Model} model The model instance that was added. 
				 */
				'add',
				
				/**
				 * Responds to a set of model additions by firing after one or more models have been added to the Collection. 
				 * This event fires with an array of the added model(s), so that the additions may be processed all at 
				 * once. To respond to each addition individually, use the {@link #event-add} event instead. 
				 * 
				 * @event addset
				 * @param {data.Collection} collection This Collection instance.
				 * @param {data.Model[]} models The array of model instances that were added. This will be an
				 *   array of the added models, even in the case that a single model is added.
				 */
				'addset',
				
				/**
				 * Fires when a model is reordered within the Collection. A reorder can be performed
				 * by calling the {@link #method-add} method with a given index of where to re-insert one or
				 * more models. If the model did not yet exist in the Collection, it will *not* fire a 
				 * reorder event, but will be provided with an {@link #event-add add} event instead. 
				 * 
				 * This event is fired once for each model that is reordered.
				 * 
				 * @event reorder
				 * @param {data.Collection} collection This Collection instance.
				 * @param {data.Model} model The model that was reordered.
				 * @param {Number} newIndex The new index for the model.
				 * @param {Number} oldIndex The old index for the model.
				 */
				'reorder',
				
				/**
				 * Fires when one or more models have been removed from the Collection. This event is fired once for each
				 * model that is removed. To respond to a set of model removals all at once, use the {@link #event-removeset} 
				 * event instead.
				 * 
				 * @event remove
				 * @param {data.Collection} collection This Collection instance.
				 * @param {data.Model} model The model instances that was removed.
				 * @param {Number} index The index that the model was removed from.
				 */
				'remove',
				
				/**
				 * Responds to a set of model removals by firing after one or more models have been removed from the Collection. 
				 * This event fires with an array of the removed model(s), so that the removals may be processed all at once. 
				 * To respond to each removal individually, use the {@link #event-remove} event instead.
				 * 
				 * @event removeset
				 * @param {data.Collection} collection This Collection instance.
				 * @param {data.Model[]} models The array of model instances that were removed. This will be an
				 *   array of the removed models, even in the case that a single model is removed.
				 */
				'removeset',
				
				/**
				 * Fires when the Collection is loaded from an external data source, through its {@link #proxy}.
				 * 
				 * This event fires for both successful and failed "load" requests. Success of the load request may 
				 * be determined using the `batch`'s {@link data.persistence.operation.Batch#wasSuccessful wasSuccessful} 
				 * method. Note that all Operations may not be {@link data.persistence.operation.Operation#isComplete complete}
				 * when this event fires if one or more Operations in the `batch` have errored.
				 * 
				 * @event load
				 * @param {data.Collection} collection This Collection instance.
				 * @param {data.persistence.operation.Batch} batch The Batch object which holds the 
				 *   {@link data.persistence.operation.Operation Operations} that were required to execute the load request. 
				 *   In most cases, this object will hold just one Operation.
				 */
				'load'
			);
			
			
			var initialModels;
			
			// If the "config" is an array, it must be an array of initial models
			if( _.isArray( config ) ) {
				initialModels = config;
				
			} else if( typeof config === 'object' ) {
				_.assign( this, config );
				
				initialModels = this.models;  // grab any initial models in the config
			}

			// Call Observable constructor
			this._super( arguments );
			
			
			// If a 'sortBy' exists, and it is a function, create a bound function to bind it to this Collection instance
			// for when it is passed into Array.prototype.sort()
			if( typeof this.sortBy === 'function' ) {
				this.sortBy = _.bind( this.sortBy, this );
			}
			
			
			this.models = [];
			this.modelsByClientId = {};
			this.modelsById = {};
			this.removedModels = [];
			
			
			if( initialModels ) {
				this.add( initialModels );
				this.modified = false;  // initial models should not make the collection "modified". Note: NOT calling commit() here, because we may not want to commit changed model data. Need to figure that out.
			} else {
				if( this.autoLoad ) {
					this.load();
				}
			}
			
			// Call hook method for subclasses
			this.initialize();
		},
		
		
		/**
		 * Hook method for subclasses to initialize themselves. This method should be overridden in subclasses to 
		 * provide any model-specific initialization.
		 * 
		 * Note that it is good practice to always call the superclass `initialize` method from within yours (even if
		 * your class simply extends data.Collection, which has no `initialize` implementation itself). This is to future proof it
		 * from being moved under another superclass, or if there is ever an implementation made in this class.
		 * 
		 * Ex:
		 * 
		 *     MyCollection = Collection.extend( {
		 *         initialize : function() {
		 *             MyCollection.superclass.initialize.apply( this, arguments );   // or could be MyCollection.__super__.initialize.apply( this, arguments );
		 *             
		 *             // my initialization logic goes here
		 *         }
		 *     }
		 * 
		 * @protected
		 * @method initialize
		 */
		initialize : Data.emptyFn,
		
		
		
		// -----------------------------
		
		
		/**
		 * If a model is provided as an anonymous data object, this method will be called to transform the data into 
		 * the appropriate {@link data.Model model} class, using the {@link #model} config.
		 * 
		 * This may be overridden in subclasses to allow for custom processing, or to create a factory method for Model creation.
		 * 
		 * @protected
		 * @param {Object} modelData
		 * @return {data.Model} The instantiated model.
		 */
		createModel : function( modelData ) {
			if( !this.model ) {
				throw new Error( "Cannot instantiate model from anonymous data, 'model' config not provided to Collection." );
			}
			
			return new this.model( modelData );
		},
		
		
		/**
		 * Adds one or more models to the Collection. The default behavior is to append the models, but the `at` option may be
		 * passed to insert them at a specific position. 
		 * 
		 * Models which already exist in the Collection will not be re-added (effectively making the addition of an existing model
		 * a no-op). However, if the `at` option is specified, it will be moved to that index.
		 * 
		 * This method fires the {@link #event-add add} event for models that are newly added, and the {@link #reorder} event for 
		 * models that are simply moved within the Collection. The latter event will only be fired if the `at` option is specified.
		 * 
		 * @param {data.Model/data.Model[]/Object/Object[]} models One or more models to add to the Collection. This may also
		 *   be one or more anonymous objects, which will be converted into models based on the {@link #model} config, or an
		 *   overridden {@link #createModel} method.
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Number} [options.at] The 0-based index for where to insert the model(s). This can be used to splice new models 
		 *   in at a certain position, or move existing models in the Collection to this position.
		 */
		add : function( models, options ) {
			options = options || {};
			var index = options.at,
			    indexSpecified = ( typeof index !== 'undefined' ),
			    collectionModels = this.models,
			    model,
			    modelId,
			    addedModels = [],
			    Model = require( 'data/Model' );  // reference to constructor function for instanceof check
			
			// First, normalize the `index` if it is out of the bounds of the models array
			if( typeof index !== 'number' ) {
				index = collectionModels.length;  // append by default
			} else if( index < 0 ) {
				index = 0;
			} else if( index > collectionModels.length ) {
				index = collectionModels.length;
			}
			
			// Normalize the argument to an array
			if( !_.isArray( models ) ) {
				models = [ models ];
			}
			
			// No models to insert, return
			if( models.length === 0 ) {
				return;
			}
			
			for( var i = 0, len = models.length; i < len; i++ ) {
				model = models[ i ];
				if( !( model instanceof Model ) ) {
					model = this.createModel( model );
				}
				
				// Only add if the model does not already exist in the collection
				if( !this.has( model ) ) {
					this.modified = true;  // model is being added, then the Collection has been modified
					
					addedModels.push( model );
					this.modelsByClientId[ model.getClientId() ] = model;
					
					// Insert the model into the models array at the correct position
					collectionModels.splice( index, 0, model );  // 0 elements to remove
					index++;  // increment the index for the next model to insert / reorder
					
					if( model.hasIdAttribute() ) {  // make sure the model actually has a valid idAttribute first, before trying to call getId()
						modelId = model.getId();
						if( modelId !== undefined && modelId !== null ) {
							this.modelsById[ modelId ] = model;
						}
						
						// Respond to any changes on the idAttribute
						model.on( 'change:' + model.getIdAttribute().getName(), this.onModelIdChange, this );
					}
					
					// Subscribe to the special 'all' event on the model, so that the Collection can relay all of the model's events
					model.on( 'all', this.onModelEvent, this );
					
					this.fireEvent( 'add', this, model );
					
				} else {
					// Handle a reorder, but only actually move the model if a new index was specified.
					// In the case that add() is called, no index will be specified, and we don't want to
					// "re-add" models
					if( indexSpecified ) {
						this.modified = true;  // model is being reordered, then the Collection has been modified
						
						var oldIndex = this.indexOf( model );
						
						// Move the model to the new index
						collectionModels.splice( oldIndex, 1 );
						collectionModels.splice( index, 0, model );
						
						this.fireEvent( 'reorder', this, model, index, oldIndex );
						index++; // increment the index for the next model to insert / reorder
					}
				}
			}
			
			// If there is a 'sortBy' config, use that now
			if( this.sortBy ) {
				collectionModels.sort( this.sortBy );  // note: the sortBy function has already been bound to the correct scope
			}
			
			// Fire the 'add' event for models that were actually inserted into the Collection (meaning that they didn't already
			// exist in the collection). Don't fire the event though if none were actually inserted (there could have been models
			// that were simply reordered).
			if( addedModels.length > 0 ) {
				this.fireEvent( 'addset', this, addedModels );
			}
		},
		
		
		
		/**
		 * Removes one or more models from the Collection. Fires the {@link #event-remove} event with the
		 * models that were actually removed.
		 * 
		 * @param {data.Model/data.Model[]} models One or more models to remove from the Collection.
		 */
		remove : function( models ) {
			var collectionModels = this.models,
			    removedModels = [],
			    i, len, model, modelIndex;
			
			// Normalize the argument to an array
			if( !_.isArray( models ) ) {
				models = [ models ];
			}
			
			for( i = 0, len = models.length; i < len; i++ ) {
				model = models[ i ];
				modelIndex = this.indexOf( model );
				
				// Don't bother doing anything to remove the model if we know it doesn't exist in the Collection
				if( modelIndex > -1 ) {
					this.modified = true;  // model is being removed, then the Collection has been modified
					
					delete this.modelsByClientId[ model.getClientId() ];
					
					if( model.hasIdAttribute() ) {   // make sure the model actually has a valid idAttribute first, before trying to call getId()
						delete this.modelsById[ model.getId() ];
						
						// Remove the listener for changes on the idAttribute
						model.un( 'change:' + model.getIdAttribute().getName(), this.onModelIdChange, this );
					}
					
					// Unsubscribe the special 'all' event listener from the model
					model.un( 'all', this.onModelEvent, this );
					
					// Remove the model from the models array
					collectionModels.splice( modelIndex, 1 );
					this.fireEvent( 'remove', this, model, modelIndex );
					
					removedModels.push( model );
					this.removedModels.push( model );  // Add reference to the model just removed, for when synchronizing the collection (using sync()). This is an array of all non-destroyed models that have been removed from the Collection, and is reset when those models are destroyed.
				}
			}
			
			if( removedModels.length > 0 ) {
				this.fireEvent( 'removeset', this, removedModels );
			}
		},
		
		
		/**
		 * Removes all models from the Collection. Fires the {@link #event-remove} event with the models
		 * that were removed.
		 */
		removeAll : function() {
			this.remove( _.clone( this.models ) );  // make a shallow copy of the array to send to this.remove()
		},
		
		
		/**
		 * Handles a change to a model's {@link data.Model#idAttribute}, so that the Collection's 
		 * {@link #modelsById} hashmap can be updated.
		 * 
		 * Note that {@link #onModelEvent} is still called even when this method executes.
		 * 
		 * @protected
		 * @param {data.Model} model The model that fired the change event.
		 * @param {Mixed} newValue The new value.
		 * @param {Mixed} oldValue The old value. 
		 */
		onModelIdChange : function( model, newValue, oldValue ) {
			delete this.modelsById[ oldValue ];
			
			if( newValue !== undefined && newValue !== null ) {
				this.modelsById[ newValue ] = model;
			}
		},
		
		
		/**
		 * Handles an event fired by a Model in the Collection by relaying it from the Collection
		 * (as if the Collection had fired it).
		 * 
		 * @protected
		 * @param {String} eventName
		 * @param {Mixed...} args The original arguments passed to the event.
		 */
		onModelEvent : function( eventName ) {
			// If the model was destroyed, we need to remove it from the collection
			if( eventName === 'destroy' ) {
				var model = arguments[ 1 ];  // arguments[ 1 ] is the model for the 'destroy' event
				this.remove( model );   // if the model is destroyed on its own, remove it from the collection. If it has been destroyed from the collection's sync() method, then this will just have no effect.
				
				// If the model was destroyed manually on its own, remove the model from the removedModels array, so we don't try to destroy it (again)
				// when sync() is executed.
				var removedModels = this.removedModels;
				for( var i = 0, len = removedModels.length; i < len; i++ ) {
					if( removedModels[ i ] === model ) {
						removedModels.splice( i, 1 );
						break;
					}
				}
			}
			
			// Relay the event from the collection, passing the collection itself, and the original arguments
			this.fireEvent.apply( this, [ eventName, this ].concat( Array.prototype.slice.call( arguments, 1 ) ) );
		},
		
		
		// ----------------------------
		
		
		/**
		 * Retrieves the Model at a given index.
		 * 
		 * @param {Number} index The index to to retrieve the model at.
		 * @return {data.Model} The Model at the given index, or null if the index was out of range.
		 */
		getAt : function( index ) {
			return this.models[ index ] || null;
		},
		
		
		/**
		 * Convenience method for retrieving the first {@link data.Model model} in the Collection.
		 * If the Collection does not have any models, returns null.
		 * 
		 * @return {data.Model} The first model in the Collection, or null if the Collection does not have
		 *   any models.
		 */
		getFirst : function() {
			return this.models[ 0 ] || null;
		},
		
		
		/**
		 * Convenience method for retrieving the last {@link data.Model model} in the Collection.
		 * If the Collection does not have any models, returns null.
		 * 
		 * @return {data.Model} The last model in the Collection, or null if the Collection does not have
		 *   any models.
		 */
		getLast : function() {
			return this.models[ this.models.length - 1 ] || null;
		},
		
		
		/**
		 * Retrieves a range of {@link data.Model Models}, specified by the `startIndex` and `endIndex`. These values are inclusive.
		 * For example, if the Collection has 4 Models, and `getRange( 1, 3 )` is called, the 2nd, 3rd, and 4th models will be returned.
		 * 
		 * @param {Number} [startIndex=0] The starting index.
		 * @param {Number} [endIndex] The ending index. Defaults to the last Model in the Collection.
		 * @return {data.Model[]} The array of models from the `startIndex` to the `endIndex`, inclusively.
		 */
		getRange : function( startIndex, endIndex ) {
			var models = this.models,
			    numModels = models.length,
			    range = [],
			    i;
			
			if( numModels === 0 ) {
				return range;
			}
			
			startIndex = Math.max( startIndex || 0, 0 ); // don't allow negative indexes
			endIndex = Math.min( typeof endIndex === 'undefined' ? numModels - 1 : endIndex, numModels - 1 );
			
			for( i = startIndex; i <= endIndex; i++ ) {
				range.push( models[ i ] );
			}
			return range; 
		},
		
		
		/**
		 * Determines if the collection holds the range of {@link data.Model Models} specified by the `startIndex` and
		 * `endIndex`. If one or more {@link data.Model Models} are missing from the given range, this method returns
		 * `false`.
		 * 
		 * @param {Number} [startIndex] The starting index.
		 * @param {Number} [endIndex] The ending index. Defaults to the last Model in the Collection.
		 * @return {Boolean} `true` if the Collection has {@link data.Model Models} in all indexes specified by
		 *   the range of `startIndex` to `endIndex`, or `false` if one or more {@link data.Model Models} are missing.
		 */
		hasRange : function( startIndex, endIndex ) {
			// A bit of a naive implementation for now. In the future, this method will cover when say, pages
			// are loaded out of order, and will ensure that the entire range is present.
			return endIndex < this.models.length;
		},
		
		
		/**
		 * Retrieves all of the models that the Collection has, in order.
		 * 
		 * @return {data.Model[]} An array of the models that this Collection holds.
		 */
		getModels : function() {
			return this.getRange();  // gets all models
		},
		
		
		/**
		 * Retrieves the Array representation of the Collection, where all models are converted into native JavaScript Objects.  The attribute values
		 * for each of the models are retrieved via the {@link data.Model#get} method, to pre-process the data before they are returned in the final 
		 * array of objects, unless the `raw` option is set to true, in which case the Model attributes are retrieved via {@link data.Model#raw}. 
		 * 
		 * @override
		 * @param {Object} [options] An object (hash) of options to change the behavior of this method. This object is sent to
		 *   the {@link data.NativeObjectConverter#convert NativeObjectConverter's convert method}, and accepts all of the options
		 *   that the {@link data.NativeObjectConverter#convert} method does. See that method for details.
		 * @return {Object} A hash of the data, where the property names are the keys, and the values are the {@link data.attribute.Attribute Attribute} values.
		 */
		getData : function( options ) {
			return NativeObjectConverter.convert( this, options );
		},

		
		
		/**
		 * Retrieves the number of models that the Collection currently holds.
		 * 
		 * @return {Number} The number of models that the Collection currently holds.
		 */
		getCount : function() {
			return this.models.length;
		},
		
		
		/**
		 * Retrieves the *total* number of models that the {@link #proxy} indicates exists on a backing
		 * data store. This is used when loading windowed (paged) data sets, and differs from 
		 * {@link #getCount} in that it loads the number of models that *could* be loaded into the
		 * Collection if the Collection contained all of the data on the backing store.
		 * 
		 * If looking to determine how many models are loaded at the current moment, use {@link #getCount}
		 * instead.
		 * 
		 * @return {Number} The number of models that the {@link #proxy} has indicated exist on the a
		 *   backing data store. If the {@link #proxy proxy's} {@link data.persistence.reader.Reader Reader}
		 *   did not read any metadata about the total number of models, this method returns `undefined`.
		 */
		getTotalCount : function() {
			return this.totalCount;
		},
		
		
		/**
		 * Retrieves a Model by its {@link data.Model#clientId clientId}.
		 * 
		 * @param {String} clientId
		 * @return {data.Model} The Model with the given {@link data.Model#clientId clientId}, or null if there is 
		 *   no Model in the Collection with that {@link data.Model#clientId clientId}.
		 */
		getByClientId : function( clientId ) {
			return this.modelsByClientId[ clientId ] || null;
		},
		
		
		/**
		 * Retrieves a Model by its {@link data.Model#id id}. Note: if the Model does not yet have an id, it will not
		 * be able to be retrieved by this method.
		 * 
		 * @param {Mixed} id The id value for the {@link data.Model Model}.
		 * @return {data.Model} The Model with the given {@link data.Model#id id}, or `null` if no Model was found 
		 *   with that {@link data.Model#id id}.
		 */
		getById : function( id ) {
			return this.modelsById[ id ] || null;
		},
		
		
		/**
		 * Determines if the Collection has a given {@link data.Model model}.
		 * 
		 * @param {data.Model} model
		 * @return {Boolean} True if the Collection has the given `model`, false otherwise.
		 */
		has : function( model ) {
			return !!this.getByClientId( model.getClientId() );
		},
		
		
		/**
		 * Retrieves the index of the given {@link data.Model model} within the Collection. 
		 * Returns -1 if the `model` is not found.
		 * 
		 * @param {data.Model} model
		 * @return {Number} The index of the provided `model`, or of -1 if the `model` was not found.
		 */
		indexOf : function( model ) {
			var models = this.models,
			    i, len;
			
			if( !this.has( model ) ) {
				// If the model isn't in the Collection, return -1 immediately
				return -1;
				
			} else {
				for( i = 0, len = models.length; i < len; i++ ) {
					if( models[ i ] === model ) {
						return i;
					}
				}
			}
		},
		
		
		/**
		 * Retrieves the index of a given {@link data.Model model} within the Collection by its
		 * {@link data.Model#idAttribute id}. Returns -1 if the `model` is not found.
		 * 
		 * @param {Mixed} id The id value for the model.
		 * @return {Number} The index of the model with the provided `id`, or of -1 if the model was not found.
		 */
		indexOfId : function( id ) {
			var model = this.getById( id );
			if( model ) {
				return this.indexOf( model );
			}
			return -1;
		},
		
		
		// ----------------------------
		
		
		/**
		 * Commits any changes in the Collection, so that it is no longer considered "modified".
		 * 
		 * @override
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.shallow=false] True to only commit only the additions/removals/reorders
		 *   of the Collection itself, but not its child Models.
		 */
		commit : function( options ) {
			options = options || {};
			
			this.modified = false;  // reset flag
			
			if( !options.shallow ) {
				var models = this.models;
				for( var i = 0, len = models.length; i < len; i++ ) {
					models[ i ].commit();
				}
			}
		},
		
		
		
		/**
		 * Rolls any changes to the Collection back to its state when it was last {@link #commit committed}
		 * or rolled back.
		 */
		rollback : function() {
			this.modified = false;  // reset flag
			
			// TODO: Implement rolling back the collection's state to the array of models that it had before any
			// changes were made
			
			
			// TODO: Determine if child models should also be rolled back. Possibly a flag argument for this?
			// But for now, maintain consistency with isModified()
			var models = this.models;
			for( var i = 0, len = models.length; i < len; i++ ) {
				models[ i ].rollback();
			}
		},
		
		
		/**
		 * Determines if the Collection has been added to, removed from, reordered, or 
		 * has any {@link data.Model models} which are modified.
		 * 
		 * @param {Object} [options] An object (hash) of options to change the behavior of this method. This may be provided as the first argument to the
		 *   method if no `attributeName` is to be provided. Options may include:
		 * @param {Boolean} [options.persistedOnly=false] True to have the method only return true only if a Model exists within it that has a 
		 *   {@link data.attribute.Attribute#persist persisted} attribute which is modified. However, if the Collection itself has been modified
		 *   (by adding/reordering/removing a Model), this method will still return true.
		 * @param {Boolean} [options.shallow=false] True to only check if the Collection itself has been added to, remove from, or has had its Models
		 *   reordered. The method will not check child models if they are modified.
		 * 
		 * @return {Boolean} True if the Collection has any modified models, false otherwise.
		 */
		isModified : function( options ) {
			options = options || {};
			
			// First, if the collection itself has been added to / removed from / reordered, then it is modified
			if( this.modified ) {
				return true;
				
			} else if( !options.shallow ) {
				// Otherwise, check to see if any of its child models are modified.
				var models = this.models,
				    i, len;
				
				for( i = 0, len = models.length; i < len; i++ ) {
					if( models[ i ].isModified( options ) ) {
						return true;
					}
				}
				return false;
			}
		},
		
		
		// ----------------------------
		
		// Searching methods
		
		/**
		 * Finds the first {@link data.Model Model} in the Collection by {@link data.attribute.Attribute Attribute} name, and a given value.
		 * Uses `===` to compare the value. If a more custom find is required, use {@link #findBy} instead.
		 * 
		 * Note that this method is more efficient than using {@link #findBy}, so if it can be used, it should.
		 * 
		 * @param {String} attributeName The name of the attribute to test the value against.
		 * @param {Mixed} value The value to look for.
		 * @param {Object} [options] Optional arguments for this method, provided in an object (hashmap). Accepts the following:
		 * @param {Number} [options.startIndex] The index in the Collection to start searching from.
		 * @return {data.Model} The model where the attribute name === the value, or `null` if no matching model was not found.
		 */
		find : function( attributeName, value, options ) {
			options = options || {};
			
			var models = this.models,
			    startIndex = options.startIndex || 0;
			for( var i = startIndex, len = models.length; i < len; i++ ) {
				if( models[ i ].get( attributeName ) === value ) {
					return models[ i ];
				}
			}
			return null;
		},
		
		
		/**
		 * Finds the first {@link data.Model Model} in the Collection, using a custom function. When the function returns true,
		 * the model is returned. If the function does not return true for any models, `null` is returned.
		 * 
		 * @param {Function} fn The function used to find the Model. Should return an explicit boolean `true` when there is a match. 
		 *   This function is passed the following arguments:
		 * @param {data.Model} fn.model The current Model that is being processed in the Collection.
		 * @param {Number} fn.index The index of the Model in the Collection.
		 * 
		 * @param {Object} [options]
		 * @param {Object} [options.scope] The scope to run the function in. Defaults to the Collection.
		 * @param {Number} [options.startIndex] The index in the Collection to start searching from.
		 * 
		 * @return {data.Model} The model that the function returned `true` for, or `null` if no match was found.
		 */
		findBy : function( fn, options ) {
			options = options || {};
			
			var models = this.models,
			    scope = options.scope || this,
			    startIndex = options.startIndex || 0;
			    
			for( var i = startIndex, len = models.length; i < len; i++ ) {
				if( fn.call( scope, models[ i ], i ) === true ) {
					return models[ i ];
				}
			}
			return null;
		},
		
		
		// ----------------------------
		
		// Persistence functionality
			
		/**
		 * Sets the {@link data.persistence.proxy.Proxy} that for this particular collection instance. Setting a proxy
		 * with this method will only affect this particular collection instance, not any others.
		 * 
		 * To configure a proxy that will be used for all instances of the Collection, set one in a Collection sublass.
		 * 
		 * @param {data.persistence.proxy.Proxy} The Proxy to set to this collection instance.
		 */
		setProxy : function( proxy ) {
			this.proxy = proxy;
		},
		
			
		/**
		 * Retrieves the {@link data.persistence.proxy.Proxy} that is configured for this collection instance. To retrieve
		 * the proxy that belongs to the Collection class itself, use the static {@link #static-method-getProxy getProxy} 
		 * method. Note that unless the collection instance is configured with a different proxy, it will inherit the
		 * Collection's static proxy.
		 * 
		 * @return {data.persistence.proxy.Proxy} The Proxy configured for the collection, or null.
		 */
		getProxy : function() {
			return this.proxy || null;
		},
		
		
		/**
		 * Determines if the Collection is currently loading data from its {@link #proxy}, via any of the "load" methods
		 * ({@link #method-load}, {@link #loadRange}, {@link #loadPage}, or {@link #loadPageRange}).
		 * 
		 * @return {Boolean} `true` if the Collection is currently loading a set of data, `false` otherwise.
		 */
		isLoading : function() {
			return this.loading;
		},
		
		
		/**
		 * Loads the Collection using its configured {@link #proxy}. If there is no configured {@link #proxy}, the
		 * {@link #model model's} proxy will be used instead.
		 * 
		 * This method makes a call to the {@link #proxy proxy's} {@link data.persistence.proxy.Proxy#read read} method to
		 * perform the load operation. Normally, the entire backend collection is read by the proxy when this method is called.
		 * However, if the Collection is configured with a {@link #pageSize}, then only page 1 of the data will be requested
		 * instead. You may load other pages of the data using {@link #loadPage} in this case.
		 * 
		 * Loading a Collection is asynchronous, and either callbacks must be provided to the method, or handlers must 
		 * attached to the returned `jQuery.Promise` object to determine when the loading is complete.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `collection` : {@link data.Collection} This Collection instance.
		 * - `batch` : {@link data.persistence.operation.Batch} The Batch of {@link data.persistence.operation.Read Read Operation(s)}
		 *   that were executed.
		 * 
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Boolean} [options.addModels=false] `true` to add the loaded models to the Collection instead of 
		 *   replacing the existing ones. 
		 * @param {Function} [options.success] Function to call if the loading is successful.
		 * @param {Function} [options.error] Function to call if the loading fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless
		 *   of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in.
		 *   This may also be provided as the property `context`, if you prefer. Defaults to this Collection.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the load completes. The 
		 *   Promise is both resolved or rejected with the arguments listed above in the method description.
		 */
		load : function( options ) {
			// If loading paged data (there is a `pageSize` config on the Collection), then automatically just load page 1
			if( this.pageSize ) {
				return this.loadPage( 1, options );
				
			} else {
				options = this.normalizeLoadOptions( options );
				var me = this,  // for closures
				    deferred = new jQuery.Deferred(),
				    operation = new ReadOperation( { params: options.params } ),
				    batch = new OperationBatch( { operations: operation } );
				
				// Attach user-provided callbacks to the deferred. The `scope` was attached to each of these in normalizeLoadOptions()
				deferred.done( options.success ).fail( options.error ).always( options.complete );
				
				this.doLoad( operation ).then(
					function( operation ) { me.onLoadSuccess( deferred, batch, { addModels: !!options.addModels } ); },
					function( operation ) { me.onLoadError( deferred, batch ); }
				);
				return deferred.promise();
			}
		},
		
		
		/**
		 * Loads a specific range of models in the Collection using its configured {@link #proxy}. If there is no configured 
		 * {@link #proxy}, the {@link #model model's} proxy will be used instead.
		 * 
		 * If paging is used to load the Collection (i.e. a {@link #pageSize} config is specified), then the Collection will
		 * make the requests necessary to load all of the pages that will satisfy the desired range specified by the `startIdx`
		 * and `endIdx` arguments. If paging is not used, then the Collection will simply make a single start/limit request of the 
		 * {@link #proxy} for the desired range.
		 * 
		 * Loading a Collection is asynchronous, and either callbacks must be provided to the method, or handlers must 
		 * attached to the returned `jQuery.Promise` object to determine when the loading is complete.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `collection` : {@link data.Collection} This Collection instance.
		 * - `batch` : {@link data.persistence.operation.Batch} The Batch of {@link data.persistence.operation.Read Read Operation(s)}
		 *   that were executed.
		 * 
		 * @param {Number} startIdx The starting index of the range of models to load.
		 * @param {Number} endIdx The ending index of the range of models to load.
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Boolean} [options.addModels] `true` to add the loaded models to the Collection instead of replacing
		 *   the existing ones. If not provided, the method follows the behavior of the {@link #clearOnPageLoad} config
		 *   if page-based loading is being used (i.e. there is a {@link #pageSize} config), or defaults to false otherwise.
		 * @param {Function} [options.success] Function to call if the loading is successful.
		 * @param {Function} [options.error] Function to call if the loading fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless
		 *   of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in.
		 *   This may also be provided as the property `context`, if you prefer. Defaults to this Collection.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the load completes. The 
		 *   Promise is both resolved or rejected with the arguments listed above in the method description.
		 */
		loadRange : function( startIdx, endIdx, options ) {
			var pageSize = this.pageSize;
			if( pageSize ) {
				// If paging is used to load records in the Collection, load the range of pages that satisfies
				// the range of record indexes required.
				var startPage = Math.floor( startIdx / pageSize ) + 1,
				    endPage = Math.floor( endIdx / pageSize ) + 1;
				
				return this.loadPageRange( startPage, endPage, options );
				
			} else {
				options = this.normalizeLoadOptions( options );
				var operation = new ReadOperation( {
					params : options.params,
					
					start : startIdx,
					limit : endIdx - startIdx
				} );
				
				var me = this,  // for closures
				    deferred = new jQuery.Deferred(),
				    batch = new OperationBatch( { operations: operation } );
				
				// Attach user-provided callbacks to the deferred. The `scope` was attached to each of these in normalizeLoadOptions()
				deferred.done( options.success ).fail( options.error ).always( options.complete );
				
				this.doLoad( operation ).then(
					function( operation ) { me.onLoadSuccess( deferred, batch, { addModels: !!options.addModels } ); },
					function( operation ) { me.onLoadError( deferred, batch ); }
				);
				return deferred.promise();
			}
		},
		
		
		/**
		 * Loads a page of the Collection using its configured {@link #proxy}. If there is no configured {@link #proxy}, the
		 * {@link #model model's} proxy will be used instead. The {@link #pageSize} must be configured on the Collection
		 * for this method to work.
		 * 
		 * Loading a Collection is asynchronous, and either callbacks must be provided to the method, or handlers must 
		 * attached to the returned `jQuery.Promise` object to determine when the loading is complete.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `collection` : {@link data.Collection} This Collection instance.
		 * - `batch` : {@link data.persistence.operation.Batch} The Batch of {@link data.persistence.operation.Read Read Operation(s)}
		 *   that were executed.
		 * 
		 * @param {Number} page The 1-based page number of data to load. Page `1` is the first page.
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Boolean} [options.addModels] `true` to add the loaded models to the Collection instead of replacing
		 *   the existing ones. If not provided, the method follows the behavior of the {@link #clearOnPageLoad} config.
		 * @param {Function} [options.success] Function to call if the loading is successful.
		 * @param {Function} [options.error] Function to call if the loading fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless
		 *   of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in.
		 *   This may also be provided as the property `context`, if you prefer. Defaults to this Collection.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the load completes. The 
		 *   Promise is both resolved or rejected with the arguments listed above in the method description.
		 */
		loadPage : function( page, options ) {
			// <debug>
			if( !page ) {
				throw new Error( "'page' argument required for loadPage() method, and must be > 0" );
			}
			// </debug>
			
			return this.loadPageRange( page, page, options );  // startPage and endPage are the same
		},
		
		
		/**
		 * Loads a range of pages of the Collection using its configured {@link #proxy}. If there is no configured {@link #proxy}, the
		 * {@link #model model's} proxy will be used instead. The {@link #pageSize} must be configured on the Collection
		 * for this method to work.
		 * 
		 * Loading a Collection is asynchronous, and either callbacks must be provided to the method, or handlers must 
		 * attached to the returned `jQuery.Promise` object to determine when the loading is complete.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `collection` : {@link data.Collection} This Collection instance.
		 * - `batch` : {@link data.persistence.operation.Batch} The Batch of {@link data.persistence.operation.Read Read Operation(s)}
		 *   that were executed.
		 * 
		 * @param {Number} startPage The 1-based page number of the first page of data to load. Page `1` is the first page.
		 * @param {Number} endPage The 1-based page number of the last page of data to load. Page `1` is the first page.
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Boolean} [options.addModels] `true` to add the loaded models to the Collection instead of replacing
		 *   the existing ones. If not provided, the method follows the behavior of the {@link #clearOnPageLoad} config.
		 * @param {Function} [options.success] Function to call if the loading is successful.
		 * @param {Function} [options.error] Function to call if the loading fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless
		 *   of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in.
		 *   This may also be provided as the property `context`, if you prefer. Defaults to this Collection.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the load completes. The 
		 *   Promise is both resolved or rejected with the arguments listed above in the method description.
		 */
		loadPageRange : function( startPage, endPage, options ) {
			var pageSize = this.pageSize;
			
			// <debug>
			if( !startPage || !endPage ) {
				throw new Error( "`startPage` and `endPage` arguments required for loadPageRange() method, and must be > 0" );
			}
			if( !pageSize ) {
				throw new Error( "The `pageSize` config must be set on the Collection to load paged data." );
			}
			// </debug>
			
			options = this.normalizeLoadOptions( options );
			var me = this,  // for closures
			    deferred = new jQuery.Deferred(),
			    operations = [],
			    loadPromises = [],
			    addModels = options.hasOwnProperty( 'addModels' ) ? options.addModels : !this.clearOnPageLoad;
			
			for( var page = startPage; page <= endPage; page++ ) {
				var operation = new ReadOperation( {
					params    : options.params,
					
					page     : page,
					pageSize : pageSize,
					start    : ( page - 1 ) * pageSize,
					limit    : pageSize   // in this case, the `limit` is the pageSize
				} );
				
				operations.push( operation );  // for populating the Batch that represents all Operations
				loadPromises.push( this.doLoad( operation ) );  // load the page of data, and store its returned Promise
			}
			
			var batch = new OperationBatch( { operations: operations } ),
			    masterPromise = jQuery.when.apply( null, loadPromises );
			
			// Attach user-provided callbacks to the deferred. The `scope` was attached to each of these in normalizeLoadOptions()
			deferred.done( options.success ).fail( options.error ).always( options.complete );
			
			masterPromise.then(
				function( operation ) { me.onLoadSuccess( deferred, batch, { addModels: addModels } ); },
				function( operation ) { me.onLoadError( deferred, batch ); }
			);
			return deferred.promise();
		},
		
		
		/**
		 * Performs the actual load operation for a request to {@link #method-load} or {@link #method-loadPage}, given the
		 * `operation` object.
		 * 
		 * @protected
		 * @param {data.persistence.operation.Read} operation The Read operation for the load.
		 * @return {jQuery.Promise} A Promise object which is resolved if the load completes successfully, or rejected
		 *   otherwise. The Promise is resolved or rejected with the argument: `operation`.
		 */
		doLoad : function( operation ) {
			var me = this,  // for closures
			    proxy = this.proxy || ( this.model ? this.model.getProxy() : null );
			
			// <debug>
			// No persistence proxy, cannot load. Throw an error
			if( !proxy ) {
				throw new Error( "data.Collection::doLoad() error: Cannot load. No `proxy` configured on the Collection or the Collection's `model`." );
			}
			// </debug>
			
			// Set the loading flag while the Collection is loading. Will be set to false in onLoadSuccess() or onLoadError().
			this.loading = true;
			
			// Make a request to read the data from the persistent storage, and return a Promise object
			// which is resolved or rejected with the `operation` object
			return proxy.read( operation );
		},
		
		
		/**
		 * Handles the {@link #proxy} successfully loading a set of data as a result of any of the "load"
		 * methods being called ({@link #method-load}, {@link #loadRange}, {@link #loadPage}, or {@link #loadPageRange}).
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the "load" method. This Deferred will be
		 *   resolved after post-processing of the successful load is complete.
		 * @param {data.persistence.operation.Batch} batch The Batch object which holds all of the 
		 *   {@link data.persistence.operation.Operation Operations} which were required to complete the load request.
		 * @param {Object} options An Object (map) with options for this method. Note that this is not the same as the `options`
		 *   object provided to each of the "load" methods. This object may contain the following properties:
		 * @param {Boolean} [options.addModels=false] `true` to add the loaded models to the Collection instead of 
		 *   replacing the existing ones. 
		 */
		onLoadSuccess : function( deferred, batch, options ) {
			var operations = batch.getOperations();
			
			// Sample the first load Operation for a totalCount
			var totalCount = operations[ 0 ].getResultSet().getTotalCount();
			if( totalCount !== undefined ) {
				this.totalCount = totalCount;
			}
			
			// If we're not adding the models, clear the Collection first
			if( !options.addModels ) {
				this.removeAll();
			}
			
			// Create a single array of all of the loaded records, put together in order of the operations, and then
			// add them to the Collection.
			var records = _.flatten(
				_.map( operations, function( op ) { return op.getResultSet().getRecords(); } )  // create an array of the arrays of result sets (to be flattened after)
			);
			this.add( records );
			
			this.loading = false;
			
			deferred.resolve( this, batch );
			this.fireEvent( 'load', this, batch );
		},
		
		
		/**
		 * Handles the {@link #proxy} failing to load a set of data as a result of any of the "load"
		 * methods being called ({@link #method-load}, {@link #loadRange}, {@link #loadPage}, or {@link #loadPageRange}.
		 * 
		 * Rejects the `jQuery.Deferred` object created by {@link #method-load}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the "load" method. This Deferred will 
		 *   be rejected after any post-processing.
		 * @param {data.persistence.operation.Batch} batch The Batch object which holds all of the 
		 *   {@link data.persistence.operation.Operation Operations} which were required to complete the load request.
		 *   One or more of these Operations has errored. Note that all Operations may not be complete.
		 */
		onLoadError : function( deferred, batch ) {
			this.loading = false;
			
			deferred.reject( this, batch );
			this.fireEvent( 'load', this, batch );
		},
		
		
		/**
		 * Normalizes the `options` argument to each of the "load" methods. This includes the {@link #method-load},
		 * {@link #loadRange}, {@link #loadPage}, and {@link #loadPageRange} methods.
		 * 
		 * This method only operates on the properties listed below. It provides a default empty function for each of the 
		 * `success`, `error`, and `complete` functions, and binds them to the `scope` (or `context`). All other properties
		 * that exist on the `options` object will remain unchanged. 
		 * 
		 * @param {Object} options The options object provided to any of the "load" methods. If `undefined` or `null` is
		 *   provided, a normalized options object will still be returned, simply with defaults filled out.
		 * @param {Function} [options.success] Function to call if the loading is successful. Will be defaulted to an
		 *   empty function as part of this method's normalization process.
		 * @param {Function} [options.error] Function to call if the loading fails. Will be defaulted to an
		 *   empty function as part of this method's normalization process.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless
		 *   of success or failure. Will be defaulted to an empty function as part of this method's normalization process.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in.
		 *   This may also be provided as the property `context`. Defaults to this Collection. This method binds each of
		 *   the callbacks to this object.
		 * @return {Object} The normalize `options` object.
		 */
		normalizeLoadOptions : function( options ) {
			options = options || {};
			
			var emptyFn = function() {},
			    scope   = options.scope || options.context || this;
			
			options.success  = _.bind( options.success  || emptyFn, scope );
			options.error    = _.bind( options.error    || emptyFn, scope );
			options.complete = _.bind( options.complete || emptyFn, scope );
			
			return options;
		},
		
		
		/**
		 * Synchronizes the Collection by persisting each of the {@link data.Model Models} that have changes. New Models are created,
		 * existing Models are modified, and removed Models are deleted.
		 * 
		 * - `collection` : {@link data.Collection} This Collection instance.
		 * - `operation` : {@link data.persistence.operation.Write} The WriteOperation that was executed.
		 * 
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Function} [options.success] Function to call if the synchronization is successful.
		 * @param {Function} [options.error] Function to call if the synchronization fails. The sychronization will be considered
		 *   failed if one or more Models does not persist successfully.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in. This may also
		 *   be provided as the property `context`, if you prefer. Defaults to the Collection.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the sync completes. The 
		 *   Promise is both resolved or rejected with the arguments listed above in the method description.
		 */
		sync : function( options ) {
			options = options || {};
			var scope = options.scope || options.context || this;
			
			
			var models = this.getModels(),
			    newModels = [],
			    modifiedModels = [],
			    removedModels = this.removedModels,
			    i, len;
			
			// Put together an array of all of the new models, and the modified models
			for( i = 0, len = models.length; i < len; i++ ) {
				var model = models[ i ];
				
				if( model.isNew() ) {
					newModels.push( model );
				} else if( model.isModified( { persistedOnly: true } ) ) {  // only check "persisted" attributes
					modifiedModels.push( model );
				}
			}
			
			
			// Callbacks for the options to this function
			var successCallback = function() {
				if( options.success ) { options.success.call( scope ); }
			};
			var errorCallback = function() {
				if( options.error ) { options.error.call( scope ); }
			};
			var completeCallback = function() {
				if( options.complete ) { options.complete.call( scope ); }
			};
			
			// A callback where upon successful destruction of a model, remove the model from the removedModels array, so that we don't try to destroy it again from another call to sync()
			var destroySuccess = function( model ) {
				for( var i = 0, len = removedModels.length; i < len; i++ ) {
					if( removedModels[ i ] === model ) {
						removedModels.splice( i, 1 );
						break;
					}
				}
			};
			
			
			// Now synchronize the models
			var promises = [],
			    modelsToSave = newModels.concat( modifiedModels );
			
			for( i = 0, len = modelsToSave.length; i < len; i++ ) {
				var savePromise = modelsToSave[ i ].save();
				promises.push( savePromise );
			}
			for( i = removedModels.length - 1; i >= 0; i-- ) {  // Loop this one backwards, as destroyed models will be removed from the array as they go if they happen synchronously
				var destroyPromise = removedModels[ i ].destroy();
				destroyPromise.done( destroySuccess );  // Upon successful destruction, we want to remove the model from the removedModels array, so that we don't try to destroy it again
				promises.push( destroyPromise );
			}
			
			// The "overall" promise that will either succeed if all persistence requests are made successfully, or fail if just one does not.
			var overallPromise = jQuery.when.apply( null, promises );  // apply all of the promises as arguments
			overallPromise.done( successCallback, completeCallback );
			overallPromise.fail( errorCallback, completeCallback );
			
			return overallPromise;  // Return a jQuery.Promise object for all the promises
		}
	
	} );
	
	return Collection;
	
} );