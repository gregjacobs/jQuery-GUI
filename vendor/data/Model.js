/*global define */
/*jshint forin:true, eqnull:true */
define( [
	'require',
	'jquery',
	'lodash',
	'Class',
	'data/Data',
	'data/ModelCache',
	'data/DataComponent',
	
	'data/persistence/proxy/Proxy',
	'data/persistence/operation/Read',
	'data/persistence/operation/Write',
	
	'data/attribute/Attribute',
	'data/attribute/DataComponent',
	'data/attribute/Collection',
	'data/attribute/Model',
	
	// All attribute types included so developers don't have to specify these when they declare attributes in their models.
	// These are not included in the arguments list though, as they are not needed specifically by the Model implementation.
	'data/attribute/Boolean',
	'data/attribute/Date',
	'data/attribute/Float',
	'data/attribute/Integer',
	'data/attribute/Mixed',
	'data/attribute/Model',
	'data/attribute/Number',
	'data/attribute/Object',
	'data/attribute/Primitive',
	'data/attribute/String',

	'data/NativeObjectConverter' // circular dependency, not included in args list
], function( 
	require,
	jQuery,
	_,
	Class,
	Data,
	ModelCache,
	DataComponent,
	
	Proxy,
	ReadOperation,
	WriteOperation,
	
	Attribute,
	DataComponentAttribute,
	CollectionAttribute,
	ModelAttribute
) {
	
	/**
	 * @class data.Model
	 * @extends data.DataComponent
	 * 
	 * Generalized key/value data storage class, which has a number of data-related features, including the ability to persist its data to a backend server.
	 * Basically, a Model represents some object of data that your application uses. For example, in an online store, one might define two Models: 
	 * one for Users, and the other for Products. These would be `User` and `Product` models, respectively. Each of these Models would in turn,
	 * have the {@link data.attribute.Attribute Attributes} (data values) that each Model is made up of. Ex: A User model may have: `userId`, `firstName`, and 
	 * `lastName` Attributes.
	 */
	var Model = Class.extend( DataComponent, {
		
		inheritedStatics : {
			/**
			 * A static property that is unique to each data.Model subclass, which uniquely identifies the subclass.
			 * This is used as part of the Model cache, where it is determined if a Model instance already exists
			 * if two models are of the same type (i.e. have the same __Data_modelTypeId), and instance id.
			 * 
			 * @private
			 * @inheritable
			 * @static
			 * @property {String} __Data_modelTypeId
			 */
			
			
			// Subclass-specific setup
			/**
			 * @ignore
			 */
			onClassExtended : function( newModelClass ) {
				// Assign a unique id to this class, which is used in maps that hold the class
				newModelClass.__Data_modelTypeId = _.uniqueId();
				
				
				// Now handle initializing the Attributes, merging this subclass's attributes with the superclass's attributes
				var classPrototype = newModelClass.prototype,
				    superclassPrototype = newModelClass.superclass,
				    superclassAttributes = superclassPrototype.attributes || {},    // will be an Object (map) of attributeName -> Attribute instances
				    newAttributes = {},
				    attributeDefs = [],  // will be an array of Attribute configs (definitions) on the new subclass 
				    attributeObj,   // for holding each of the attributeDefs, one at a time
				    i, len;
				
				// Grab the 'attributes' property from the new subclass's prototype. If this is not present,
				// will use the empty array instead.
				if( classPrototype.hasOwnProperty( 'attributes' ) ) {
					attributeDefs = classPrototype.attributes;
				}
				
				// Instantiate each of the new subclass's Attributes, and then merge them with the superclass's attributes
				for( i = 0, len = attributeDefs.length; i < len; i++ ) {
					attributeObj = attributeDefs[ i ];
					
					// Normalize to a data.attribute.Attribute configuration object if it is a string
					if( typeof attributeObj === 'string' ) {
						attributeObj = { name: attributeObj };
					}
					
					// Create the actual Attribute instance
					var attribute = Attribute.create( attributeObj );
					newAttributes[ attribute.getName() ] = attribute;
				}
				
				newModelClass.prototype.attributes = _.defaults( _.clone( newAttributes ), superclassAttributes );  // newAttributes take precedence; superclassAttributes are used in the case that a newAttribute doesn't exist for a given attributeName
			},
			
			
			/**
			 * Retrieves the Attribute objects that are present for the Model, in an Object (map) where the keys
			 * are the Attribute names, and the values are the {@link data.attribute.Attribute} objects themselves.
			 * 
			 * @inheritable
			 * @static
			 * @return {Object} An Object (map) where the keys are the attribute {@link data.attribute.Attribute#name names},
			 *   and the values are the {@link data.attribute.Attribute Attribute} instances themselves.
			 */
			getAttributes : function() {
				// Note: `this` refers to the class (constructor function) that the static method was called on
				return this.prototype.attributes;
			},
			
			
			/**
			 * Retrieves the {@link data.persistence.proxy.Proxy} that is configured for the Model class. To retrieve
			 * a proxy that may belong to a particular model, use the instance level {@link #method-getProxy}.
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
		 * @cfg {data.persistence.proxy.Proxy} proxy
		 * 
		 * The persistence proxy to use (if any) to load or persist the Model's data to/from persistent
		 * storage. If this is not specified, the Model may not {@link #method-load} or {@link #method-save} its data.
		 * 
		 * Note that this may be specified as part of a Model subclass (so that all instances of the Model inherit
		 * the proxy), or on a particular model instance using {@link #setProxy}.
		 */
		
		/**
		 * @cfg {String[]/Object[]} attributes
		 * 
		 * Array of {@link data.attribute.Attribute Attribute} declarations. These are objects with any number of properties, but they
		 * must have the property 'name'. See the configuration options of {@link data.attribute.Attribute} for more information. 
		 * 
		 * Anonymous config objects defined here will become instantiated {@link data.attribute.Attribute} objects. An item in the array may also simply 
		 * be a string, which will specify the name of the {@link data.attribute.Attribute Attribute}, with no other {@link data.attribute.Attribute Attribute} 
		 * configuration options.
		 * 
		 * Attributes defined on the prototype of a Model, and its superclasses, are combined to become a single set of attributes come
		 * instantiation time. This means that the data.Model base class can define the 'id' attribute, and then subclasses
		 * can define their own attributes to append to it. So if a subclass defined the attributes `[ 'name', 'phone' ]`, then the
		 * final concatenated array of attributes for the subclass would be `[ 'id', 'name', 'phone' ]`. This works for however many
		 * levels of subclasses there are.
		 * 
		 * Example:
		 * 
		 *     attributes : [
		 *         'id',    // name-only; no other configs for this attribute (not recommended! should declare the {@link data.attribute.Attribute#type type})
		 *         { name: 'firstName', type: 'string' },
		 *         { name: 'lastName',  type: 'string' },
		 *         {
		 *             name : 'fullName',
		 *             get  : function( value ) {  // // in this example, the Attribute has no value of its own, so we ignore the arg
		 *                 return this.get( 'firstName' ) + ' ' + this.get( 'lastName' );  // `this` refers to the model that owns the Attribute
		 *             }
		 *         }
		 *     ]
		 * 
		 */
		
		/**
		 * @cfg {String} idAttribute
		 * The attribute that should be used as the ID for the Model. 
		 */
		idAttribute : 'id',
		
		
		/**
		 * @private
		 * @property {Object} attributes
		 * 
		 * A hash of the combined Attributes, which have been put together from the current Model subclass, and all of
		 * its superclasses.
		 */
		
		/**
		 * @private
		 * @property {Object} data
		 * 
		 * A hash that holds the current data for the {@link data.attribute.Attribute Attributes}. The property names in this object match 
		 * the attribute names.  This hash holds the current data as it is modified by {@link #set}.
		 */
		
		/**
		 * @private 
		 * @property {Object} modifiedData
		 * A hash that serves two functions:
		 * 
		 * 1) Properties are set to it when an attribute is modified. The property name is the attribute {@link data.attribute.Attribute#name}. 
		 *    This allows it to be used to determine which attributes have been modified. 
		 * 2) The *original* (non-committed) data of the attribute (before it was {@link #set}) is stored as the value of the 
		 *    property. When rolling back changes (via {@link #method-rollback}), these values are copied back onto the {@link #data} object
		 *    to overwrite the data to be rolled back.
		 * 
		 * Went back and forth with naming this `originalData` and `modifiedData`, because it stores original data, but is used
		 * to determine which data is modified... 
		 */
		
		/**
		 * @private
		 * @property {Number} setCallCount
		 * 
		 * This variable supports the {@link #changeset} event, by keeping track of the number of calls to {@link #method-set}.
		 * When {@link #method-set} is called, this variable is incremented by 1. Just before {@link #method-set} returns, this variable is decremented
		 * by 1. If at the end of the {@link #method-set} method this variable reaches 0 again, the {@link #changeset} event is fired
		 * with all of the attribute changes since the first call to {@link #method-set}. This handles the recursive nature of the {@link #method-set} method,
		 * and the fact that {@link #method-set} may be called by Attribute {@link data.attribute.Attribute#cfg-set set} functions, and handlers of the
		 * {@link #change} event.
		 */
		setCallCount : 0,
		
		/**
		 * @private
		 * @property {Object} changeSetNewValues
		 * 
		 * An Object (map) which holds the changes to attributes for the {@link #changeset} event to fire with. This map collects the 
		 * changed values as calls to {@link #method-set} are made, and is used with the arguments that the {@link #changeset} event fires
		 * with (when it does fire, at the end of all of the calls to {@link #method-set}).
		 */
		
		/**
		 * @private
		 * @property {Object} changeSetOldValues
		 * 
		 * A map which holds the changes to attributes for the {@link #changeset} event to fire with. This map collects the 
		 * previous ("old") values as calls to {@link #method-set} are made, and is used with the arguments that the {@link #changeset} event fires
		 * with (when it does fire, at the end of all of the calls to {@link #method-set}).
		 */
		
		/**
		 * @private
		 * @property {String} id (readonly)
		 * The id for the Model. This property is set when the attribute specified by the {@link #idAttribute} config
		 * is {@link #set}. 
		 * 
		 * *** Note: This property is here solely to maintain compatibility with Backbone's Collection, and should
		 * not be accessed or used, as it will most likely be removed in the future.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} loading
		 * 
		 * Flag that is set to `true` while the Model is loading.
		 */
		loading : false,
		
		/**
		 * @protected
		 * @property {Boolean} saving
		 * 
		 * Flag that is set to `true` while the Model is saving.
		 */
		saving : false,
		
		/**
		 * @protected
		 * @property {Boolean} destroying
		 * 
		 * Flag that is set to `true` while the Model is destroying.
		 */
		destroying : false,
		
		/**
		 * @protected
		 * @property {Boolean} destroyed
		 * 
		 * Flag that is set to true once the Model has been successfully destroyed.
		 */
		destroyed : false,
		
		
		
		/**
		 * Creates a new Model instance.
		 * 
		 * @constructor 
		 * @param {Object} [data] Any initial data for the {@link #cfg-attributes attributes}, specified in an object (hash map). See {@link #set}.
		 */
		constructor : function( data ) {
			// Default the data to an empty object
			data = data || {};
			
			
			// --------------------------
			
			// Handle this new model being a duplicate of a model that already exists (with the same id)
					
			// If there already exists a model of the same type, with the same ID, update that instance,
			// and return that instance from the constructor. We don't create duplicate Model instances
			// with the same ID.
			var existingInstance = ModelCache.get( this, data[ this.idAttribute ] );
			if( existingInstance !== this ) {
				existingInstance.set( data );   // set any provided initial data to the already-existing instance (as to combine them),
				return existingInstance;        // and then return the already-existing instance
			}
			
			
			// --------------------------
			
			
			// Call superclass constructor
			this._super( arguments );
			
			// If this class has a proxy definition that is an object literal, instantiate it *onto the prototype*
			// (so one Proxy instance can be shared for every model)
			if( this.proxy && typeof this.proxy === 'object' && !( this.proxy instanceof Proxy ) ) {
				this.constructor.prototype.proxy = Proxy.create( this.proxy );
			}
			
			
			this.addEvents(				
				/**
				 * Fires when a {@link data.attribute.Attribute} in the Model has changed its value.
				 * 
				 * This event has two forms:
				 * 
				 * 1. The form documented as this event, where the `attributeName` is provided, and
				 * 2. The form where a particular attribute name may be listened to directly. In this second form,
				 *    one may subscribe to the event by adding a colon and then the attribute name to the event name. 
				 *    For example, if you want to just respond to `title` attribute changes on a model, you could subscribe
				 *    to the `change:title` event. Ex:
				 *    
				 *        model.on( 'change:title', function( model, newValue, oldValue ) { ... } );
				 *        
				 *    In this second form, the `attributeName` argument is *not* provided, as you are only listening for 
				 *    changes on one particular attribute.
				 * 
				 * @event change
				 * @param {data.Model} model This Model instance.
				 * @param {String} attributeName The name of the attribute that was changed.
				 * @param {Mixed} newValue The new value, processed by the attribute's {@link data.attribute.Attribute#get get} function if one exists. 
				 * @param {Mixed} oldValue The old (previous) value, processed by the attribute's {@link data.attribute.Attribute#get get} function if one exists. 
				 */
				'change',
				
				/**
				 * Fires once at the end of one of more (i.e. a set) of Attribute changes to the model. Multiple changes may be made to the model in a "set" by
				 * providing the first argument to {@link #method-set} as an object, and/or may also result from having {@link data.attribute.Attribute#cfg-set Attribute set} 
				 * functions which modify other Attributes. Or, one final way that changes may be counted in a "set" is if handlers of the {@link #change} event end up
				 * setting Attributes on the Model as well.
				 * 
				 * Note: This event isn't quite production-ready, as it doesn't take into account changes from nested {@Link data.DataComponent DataComponents}
				 * ({@link data.Model Models} and {@link data.Collection Collections}), but can be used for a set of flat changes in the Model.
				 * 
				 * @event changeset
				 * @param {data.Model} model This Model instance.
				 * @param {Object} newValues An Object (map) of the new values of the Attributes that changed. The object's keys (property names) are the
				 *   {@link data.attribute.Attribute#name Attribute names}, and the object's values are the new values for those Attributes.
				 * @param {Object} oldValues An Object (map) of the old values of the Attributes that changed. The object's keys (property names) are the
				 *   {@link data.attribute.Attribute#name Attribute names}, and the object's values are the old values that were held for those Attributes.
				 */
				'changeset',
				
				/**
				 * Fires when the data in the model is {@link #method-commit committed}. This happens if the
				 * {@link #method-commit commit} method is called, and after a successful {@link #method-save}.
				 * 
				 * @event commit
				 * @param {data.Model} model This Model instance.
				 */
				'commit',
				
				/**
				 * Fires when the data in the model is {@link #method-rollback rolled back}. This happens when the
				 * {@link #method-rollback rollback} method is called.
				 * 
				 * @event rollback
				 * @param {data.Model} model This Model instance.
				 */
				'rollback',
				
				/**
				 * Fires when the Model begins a {@link #method-load} request, through its {@link #proxy}. The 
				 * {@link #event-load} event will fire when the load is complete.
				 * 
				 * @event loadbegin
				 * @param {data.Model} This Model instance.
				 */
				'loadbegin',
				
				/**
				 * Fires when the Model is {@link #method-load loaded} from its external data store (such as a web server), 
				 * through its {@link #proxy}.
				 * 
				 * This event fires for both successful and failed "load" requests. Success of the load request may 
				 * be determined using the `operation`'s {@link data.persistence.operation.Operation#wasSuccessful wasSuccessful} 
				 * method.
				 * 
				 * @event load
				 * @param {data.Model} model This Model instance.
				 * @param {data.persistence.operation.Read} operation The ReadOperation object for the load request.
				 */
				'load',
				
				/**
				 * Fires when the Model begins a {@link #method-save} request, through its {@link #proxy}. The 
				 * {@link #event-save} event will fire when the save is complete.
				 * 
				 * @event savebegin
				 * @param {data.Model} This Model instance.
				 */
				'savebegin',
				
				/**
				 * Fires when the Model is {@link #method-save saved} to its external data store (such as a web server),
				 * through its {@link #proxy}.
				 * 
				 * This event fires for both successful and failed "save" requests. Success of the save request may 
				 * be determined using the `operation`'s {@link data.persistence.operation.Operation#wasSuccessful wasSuccessful} 
				 * method.
				 * 
				 * @event save
				 * @param {data.Model} model This Model instance.
				 * @param {data.persistence.operation.Write} operation The WriteOperation object for the save request.
				 */
				'save',
				
				/**
				 * Fires when the Model begins a {@link #method-destroy} request, through its {@link #proxy}. The 
				 * {@link #event-destroy} event will fire when the destroy is complete.
				 * 
				 * @event destroybegin
				 * @param {data.Model} This Model instance.
				 */
				'destroybegin',
				
				/**
				 * Fires when the Model has been {@link #method-destroy destroyed} on its external data store (such as a 
				 * web server), through its {@link #proxy}.
				 * 
				 * @event destroy
				 * @param {data.Model} model This Model instance.
				 * @param {data.persistence.operation.Write} operation The WriteOperation object for the destroy request.
				 */
				'destroy'
			);
			
			
			// Set the default values for attributes that don't have an initial value.
			var attributes = this.attributes,  // this.attributes is a hash of the Attribute objects, keyed by their name
			    attributeDefaultValue;
			for( var name in attributes ) {
				if( data[ name ] === undefined && ( attributeDefaultValue = attributes[ name ].getDefaultValue() ) !== undefined ) {
					data[ name ] = attributeDefaultValue;
				}
			}
			
			// Initialize the underlying data object, which stores all attribute values
			this.data = {};
			
			// Initialize the data hash for storing attribute names of modified data, and their original values (see property description)
			this.modifiedData = {};
			
			// Set the initial data / defaults, if we have any
			this.set( data );
			this.commit();  // and because we are initializing, the data is not considered modified
			
			// Call hook method for subclasses
			this.initialize();
		},
		
		
		/**
		 * Hook method for subclasses to initialize themselves. This method should be overridden in subclasses to 
		 * provide any model-specific initialization.
		 * 
		 * Note that it is good practice to always call the superclass `initialize` method from within yours (even if
		 * your class simply extends data.Model, which has no `initialize` implementation itself). This is to future proof it
		 * from being moved under another superclass, or if there is ever an implementation made in this class.
		 * 
		 * Ex:
		 * 
		 *     MyModel = Model.extend( {
		 *         initialize : function() {
		 *             MyModel.superclass.initialize.apply( this, arguments );   // or could be MyModel.__super__.initialize.apply( this, arguments );
		 *             
		 *             // my initialization logic goes here
		 *         }
		 *     }
		 * 
		 * @protected
		 * @method initialize
		 */
		initialize : Data.emptyFn,
		
		
		/**
		 * Retrieves the Attribute objects that are present for the Model, in an Object (map) where the keys
		 * are the Attribute names, and the values are the {@link data.attribute.Attribute} objects themselves.
		 * 
		 * @return {Object} An Object (map) where the keys are the attribute {@link data.attribute.Attribute#name names},
		 *   and the values are the {@link data.attribute.Attribute Attribute} instances themselves.
		 */
		getAttributes : function() {
			return this.attributes;
		},
		
		
		// --------------------------------
		
		
		/**
		 * Retrieves the ID for the Model. This uses the configured {@link #idAttribute} to retrieve
		 * the correct ID attribute for the Model.
		 * 
		 * @return {Mixed} The ID for the Model.
		 */
		getId : function() {
			// Provide a friendlier error message than what get() provides if the idAttribute is not an Attribute of the Model
			if( !( this.idAttribute in this.attributes ) ) {
				throw new Error( "Error: The `idAttribute` (currently set to an attribute named '" + this.idAttribute + "') was not found on the Model. Set the `idAttribute` config to the name of the id attribute in the Model. The model can't be saved or destroyed without it." );
			}
			return this.get( this.idAttribute );
		},
		
		
		/**
		 * Retrieves the "ID attribute" for the Model, if there is a valid id attribute. The Model has a valid ID attribute if there exists
		 * an attribute which is referenced by the {@link #idAttribute} config. Otherwise, returns null.
		 * 
		 * @return {data.attribute.Attribute} The Attribute that represents the ID attribute, or null if there is no valid ID attribute.
		 */
		getIdAttribute : function() {
			return this.attributes[ this.idAttribute ] || null;
		},
		
		
		/**
		 * Retrieves the name of the "ID attribute" for the Model. This will be the attribute referenced by the {@link #idAttribute}
		 * config.
		 * 
		 * @return {String} The name of the "ID attribute".
		 */
		getIdAttributeName : function() {
			return this.idAttribute;
		},
		
		
		/**
		 * Determines if the Model has a valid {@link #idAttribute}. Will return true if there is an {@link #cfg-attributes attribute}
		 * that is referenced by the {@link #idAttribute}, or false otherwise.
		 * 
		 * @return {Boolean}
		 */
		hasIdAttribute : function() {
			return !!this.attributes[ this.idAttribute ];
		},
	
		
		// --------------------------------
		
		
		/**
		 * Sets the value for a {@link data.attribute.Attribute Attribute} given its `name`, and a `value`. For example, a call could be made as this:
		 * 
		 *     model.set( 'attribute1', 'value1' );
		 * 
		 * As an alternative form, multiple valuse can be set at once by passing an Object into the first argument of this method. Ex:
		 * 
		 *     model.set( { key1: 'value1', key2: 'value2' } );
		 * 
		 * Note that in this form, the method will ignore any property in the object (hash) that don't have associated Attributes.
		 * 
		 * When attributes are set, their {@link data.attribute.Attribute#cfg-set} method is run, if they have one defined.
		 * 
		 * @param {String/Object} attributeName The attribute name for the Attribute to set, or an object (hash) of name/value pairs.
		 * @param {Mixed} [newValue] The value to set to the attribute. Required if the `attributeName` argument is a string (i.e. not a hash). 
		 */
		set : function( attributeName, newValue ) {
			// If coming into the set() method for the first time (non-recursively, not from an attribute setter, not from a 'change' handler, etc),
			// reset the maps which will hold the newValues and oldValues that will be provided to the 'changeset' event.
			if( this.setCallCount === 0 ) {
				this.changeSetNewValues = {};
				this.changeSetOldValues = {};
			}
			
			// Increment the setCallCount, for use with the 'changeset' event. The 'changeset' event only fires when all calls to set() have exited.
			this.setCallCount++;
			
			var attributes = this.attributes,
			    changeSetNewValues = this.changeSetNewValues,
			    changeSetOldValues = this.changeSetOldValues;
			
			if( typeof attributeName === 'object' ) {
				// Map provided
				var values = attributeName,  // for clarity
				    attrsWithSetters = [];
				
				for( var fldName in values ) {  // a new variable, 'fldName' instead of 'attributeName', so that JSLint stops whining about "Bad for in variable 'attributeName'" (for whatever reason it does that...)
					if( values.hasOwnProperty( fldName ) ) {
						// <debug>
						if( !attributes[ fldName ] ) {
							throw new Error( "data.Model.set(): An attribute with the attributeName '" + fldName + "' was not found." );
						}
						// </debug>
						if( attributes[ fldName ].hasUserDefinedSetter() ) {   // defer setting the values on attributes with user-defined setters until all attributes without user-defined setters have been set
							attrsWithSetters.push( fldName );
						} else {
							this.set( fldName, values[ fldName ] );
						}
					}
				}
				
				for( var i = 0, len = attrsWithSetters.length; i < len; i++ ) {
					fldName = attrsWithSetters[ i ];
					this.set( fldName, values[ fldName ] );
				}
				
			} else {
				// `attributeName` and `newValue` args provided to method
				var attribute = attributes[ attributeName ];
				
				// <debug>
				if( !attribute ) {
					throw new Error( "data.Model.set(): An attribute with the attributeName '" + attributeName + "' was not found." );
				}
				// </debug>
				
				// Get the current (old) value of the attribute, and its current "getter" value (to provide to the 'change' event as the oldValue)
				var oldValue = this.data[ attributeName ],
				    oldGetterValue = this.get( attributeName );
				
				// Call the Attribute's set() method (or user-provided 'set' config function) to do any implemented conversion
				newValue = attribute.set( this, newValue, oldValue );
				
				// *** Temporary workaround to get the 'change' event to fire on an Attribute whose set() config function does not
				// return a new value to set to the underlying data. This will be resolved once dependencies are 
				// automatically resolved in the Attribute's get() function. 
				if( attribute.hasOwnProperty( 'set' ) && newValue === undefined ) {  // the attribute will only have a 'set' property of its own if the 'set' config was provided
					// This is to make the following block below think that there is already data in for the attribute, and
					// that it has the same value. If we don't have this, the change event will fire twice, the
					// the model will be considered modified, and the old value will be put into the `modifiedData` hash.
					if( !( attributeName in this.data ) ) {
						this.data[ attributeName ] = undefined;
					}
					
					// Fire the events with the value of the Attribute after it has been processed by any Attribute-specific `get()` function.
					newValue = this.get( attributeName );
					
					// Store the 'change' in the 'changeset' maps
					this.changeSetNewValues[ attributeName ] = newValue;
					if( !( attributeName in changeSetOldValues ) ) {  // only store the "old" value if we don't have an "old" value for the attribute already. This leaves us with the real "old" value when multiple sets occur for an attribute during the changeset.
						this.changeSetOldValues[ attributeName ] = oldGetterValue;
					}
					
					// Now manually fire the events
					this.fireEvent( 'change:' + attributeName, this, newValue, oldGetterValue );  // model, newValue, oldValue
					this.fireEvent( 'change', this, attributeName, newValue, oldGetterValue );    // model, attributeName, newValue, oldValue
				}
				
				// Allow the Attribute to post-process the newValue (the value returned from the Attribute's set() function)
				newValue = attribute.afterSet( this, newValue );
				
				// Only change if there is no current value for the attribute, or if newValue is different from the current
				if( !this.data.hasOwnProperty( attributeName ) || !attribute.valuesAreEqual( oldValue, newValue ) ) {   // let the Attribute itself determine if two values of its datatype are equal
					// Store the attribute's *current* value (not the newValue) into the "modifiedData" attributes hash.
					// This should only happen the first time the attribute is set, so that the attribute can be rolled back even if there are multiple
					// set() calls to change it.
					if( !this.modifiedData.hasOwnProperty( attributeName ) ) {
						this.modifiedData[ attributeName ] = oldValue;
					}
					this.data[ attributeName ] = newValue;
					
					
					// Now that we have set the new raw value to the internal `data` hash, we want to fire the events with the value
					// of the Attribute after it has been processed by any Attribute-specific `get()` function.
					newValue = this.get( attributeName );
					
					// If the attribute is the "idAttribute", set the `id` property on the model for compatibility with Backbone's Collection
					if( attributeName === this.idAttribute ) {
						this.id = newValue;
	
						// Re-submit to ModelCache, so new ID will be used.  This is particularly relevant on 'create', where the ID isn't known
						// at the time the model is instantiated.
						ModelCache.get( this, newValue );
					}
					
					// Store the 'change' values in the changeset maps, for use when the 'changeset' event fires
					changeSetNewValues[ attributeName ] = newValue;
					if( !( attributeName in changeSetOldValues ) ) {  // Only store the "old" value if we don't have an "old" value for the attribute already. This leaves us with the real "old" value when multiple set()'s occur for an attribute during the changeset.
						changeSetOldValues[ attributeName ] = oldGetterValue;
					}
					
					// And finally, fire the 'change' events
					this.fireEvent( 'change:' + attributeName, this, newValue, oldGetterValue );  // model, newValue, oldValue
					this.fireEvent( 'change', this, attributeName, newValue, oldGetterValue );    // model, attributeName, newValue, oldValue
				}
			}
			
			// Handle firing the 'changeset' event, which fires once for all of the attribute changes to the Model (i.e. when all calls to set() have exited)
			this.setCallCount--;
			if( this.setCallCount === 0 ) {
				this.fireEvent( 'changeset', this, changeSetNewValues, changeSetOldValues );
			}
		},
		
		
		/**
		 * Retrieves the value for the attribute given by `attributeName`. If the {@link data.attribute.Attribute Attribute} has a
		 * {@link data.attribute.Attribute#get get} function defined, that function will be called, and its return value
		 * will be used as the return of this method.
		 * 
		 * @param {String} attributeName The name of the Attribute whose value to retieve.
		 * @return {Mixed} The value of the attribute returned by the Attribute's {@link data.attribute.Attribute#get get} function (if
		 * one exists), or the underlying value of the attribute. Will return undefined if there is no {@link data.attribute.Attribute#get get}
		 * function, and the value has never been set.  
		 */
		get : function( attributeName ) {
			// <debug>
			if( !( attributeName in this.attributes ) ) {
				throw new Error( "data.Model::get() error: attribute '" + attributeName + "' was not found on the Model." );
			}
			// </debug>
			
			var value = this.data[ attributeName ],
			    attribute = this.attributes[ attributeName ];
			
			// If there is a `get` function on the Attribute, run it now to convert the value before it is returned.
			if( typeof attribute.get === 'function' ) {
				value = attribute.get( this, value );  // provide the underlying value
			}
			
			return value;
		},
		
		
		/**
		 * Retrieves the *raw* value for the attribute given by `attributeName`. If the {@link data.attribute.Attribute Attributes} has a
		 * {@link data.attribute.Attribute#raw raw} function defined, that function will be called, and its return value will be used
		 * by the return of this method. If not, the underlying data that is currently stored will be returned, bypassing any
		 * {@link data.attribute.Attribute#get get} function defined on the {@link data.attribute.Attribute Attribute}.
		 * 
		 * @param {String} attributeName The name of the Attribute whose raw value to retieve.
		 * @return {Mixed} The value of the attribute returned by the Attribute's {@link data.attribute.Attribute#raw raw} function (if
		 * one exists), or the underlying value of the attribute. Will return undefined if there is no {@link data.attribute.Attribute#raw raw}
		 * function, and the value has never been set.
		 */
		raw : function( attributeName ) {
			// <debug>
			if( !this.attributes.hasOwnProperty( attributeName ) ) {
				throw new Error( "data.Model::raw() error: attribute '" + attributeName + "' was not found on the Model." );
			}
			// </debug>
			
			var value = this.data[ attributeName ],
			    attribute = this.attributes[ attributeName ];
			
			// If there is a `raw` function on the Attribute, run it now to convert the value before it is returned.
			if( typeof attribute.raw === 'function' ) {
				value = attribute.raw( this, value );  // provide the underlying value
			}
			
			return value;
		},
		
		
		/**
		 * Returns the default value specified for an Attribute.
		 * 
		 * @param {String} attributeName The attribute name to retrieve the default value for.
		 * @return {Mixed} The default value for the attribute.
		 */
		getDefault : function( attributeName ) {
			return this.attributes[ attributeName ].getDefaultValue();
		},
		
		
		/**
		 * Determines if the Model has a given attribute (attribute).
		 * 
		 * @param {String} attributeName The name of the attribute (attribute) name to test for.
		 * @return {Boolean} True if the Model has the given attribute name.
		 */
		has : function( attributeName ) {
			return !!this.attributes[ attributeName ];
		},	
		
		
		// --------------------------------
		
		
		/**
		 * Determines if the Model is a new model, and has not yet been persisted to the server.
		 * It is a new Model if it lacks an id.
		 * 
		 * @return {Boolean} True if the model is new, false otherwise.
		 */
		isNew : function() {
			if( !this.hasIdAttribute() ) {
				return true;
			} else {
				return !this.getId();  // Any falsy value makes the model be considered "new". This includes null, 0, and ""
			}
		},
		
		
		/**
		 * Determines if any attribute(s) in the model are modified, or if a given attribute has been modified, since the last 
		 * {@link #method-commit} or {@link #method-rollback}.
		 * 
		 * @override
		 * @param {String} [attributeName] Provide this argument to test if a particular attribute has been modified. If this is not 
		 *   provided, the model itself will be checked to see if there are any modified attributes. 
		 * 
		 * @param {Object} [options] An object (hash) of options to change the behavior of this method. This may be provided as the first argument to the
		 *   method if no `attributeName` is to be provided. Options may include:
		 * @param {Boolean} [options.persistedOnly=false] True to have the method only return true if a {@link data.attribute.Attribute#persist persisted} 
		 *   attribute is modified. 
		 * 
		 * @return {Boolean} True if the attribute has been modified, false otherwise.
		 */
		isModified : function( attributeName, options ) {
			if( typeof attributeName === 'object' ) {  // 'options' provided as first argument, fix the parameter variables
				options = attributeName;
				attributeName = undefined;
			}
			
			options = options || {};
			
			var attributes = this.attributes,
			    data = this.data,
			    modifiedData = this.modifiedData;
			
			if( !attributeName ) {
				// First, check if there are any modifications to primitives (i.e. non-nested Models/Collections).
				// If the 'persistedOnly' option is true, we only consider attributes that are persisted.
				for( var attr in modifiedData ) {
					if( modifiedData.hasOwnProperty( attr ) && ( !options.persistedOnly || ( options.persistedOnly && attributes[ attr ].isPersisted() ) ) ) {
						return true;  // there is any property in the modifiedData map, return true (unless 'persistedOnly' option is set, in which case we only consider persisted attributes)
					}
				}
				
				// No local modifications to primitives, check all embedded collections/models to see if they have changes
				var embeddedDataComponentAttrs = this.getEmbeddedDataComponentAttributes(),
				    dataComponent;
				
				for( var i = 0, len = embeddedDataComponentAttrs.length; i < len; i++ ) {
					var attrName = embeddedDataComponentAttrs[ i ].getName();
					
					if( ( dataComponent = data[ attrName ] ) && dataComponent.isModified( options ) ) {
						return true;
					}
				}
				return false;
				
			} else {
				// Handle an attributeName being provided to this method
				var attribute = attributes[ attributeName ];
				
				if( attribute instanceof DataComponentAttribute && attribute.isEmbedded() && data[ attributeName ].isModified( options ) ) {   // DataComponent (Model or Collection) attribute is modified
					return true;
				} else if( modifiedData.hasOwnProperty( attributeName ) && ( !options.persistedOnly || ( options.persistedOnly && attributes[ attributeName ].isPersisted() ) ) ) {  // primitive (non Model or Collection) attribute is modified
					return true;
				}
				
				return false;
			}
		},
		
		
		/**
		 * Retrieves the values for all of the attributes in the Model. The Model attributes are retrieved via the {@link #get} method,
		 * to pre-process the data before it is returned in the final hash, unless the `raw` option is set to true,
		 * in which case the Model attributes are retrieved via {@link #raw}. 
		 * 
		 * @override
		 * 
		 * @param {Object} [options] An object (hash) of options to change the behavior of this method. This object is sent to
		 *   the {@link data.NativeObjectConverter#convert NativeObjectConverter's convert method}, and accepts all of the options
		 *   that the {@link data.NativeObjectConverter#convert} method does. See that method for details.
		 * @return {Object} A hash of the data, where the property names are the keys, and the values are the {@link data.attribute.Attribute Attribute} values.
		 */
		getData : function( options ) {
			return require( 'data/NativeObjectConverter' ).convert( this, options );
		},
		
		
		/**
		 * Retrieves the values for all of the {@link data.attribute.Attribute attributes} in the Model whose values have been changed since
		 * the last {@link #method-commit} or {@link #method-rollback}. 
		 * 
		 * The Model attributes are retrieved via the {@link #get} method, to pre-process the data before it is returned in the final hash, 
		 * unless the `raw` option is set to true, in which case the Model attributes are retrieved via {@link #raw}.
		 * 
		 * 
		 * @param {Object} [options] An object (hash) of options to change the behavior of this method. This object is sent to
		 *   the {@link data.NativeObjectConverter#convert NativeObjectConverter's convert method}, and accepts all of the options
		 *   that the {@link data.NativeObjectConverter#convert} method does. See that method for details. Options specific to this method include:
		 * @param {Boolean} [options.persistedOnly=false] True to have the method only return only changed attributes that are 
		 *   {@link data.attribute.Attribute#persist persisted}. In the case of nested models, a nested model will only be returned in the resulting
		 *   map if one if its {@link data.attribute.Attribute#persist persisted} attributes are modified. 
		 * 
		 * @return {Object} A hash of the attributes that have been changed since the last {@link #method-commit} or {@link #method-rollback}.
		 *   The hash's property names are the attribute names, and the hash's values are the new values.
		 */
		getChanges : function( options ) {
			options = options || {};
			
			// Provide specific attribute names to the NativeObjectConverter's convert() method, which are only the
			// names for attributes which hold native JS objects that have changed (not embedded models/arrays)
			options.attributeNames = _.keys( this.modifiedData );
			
			// Add any modified embedded model/collection to the options.attributeNames array
			var embeddedDataComponentAttrs = this.getEmbeddedDataComponentAttributes(),
			    data = this.data,
			    dataComponent,
			    collection,
			    attrName,
			    i, len;
		
			for( i = 0, len = embeddedDataComponentAttrs.length; i < len; i++ ) {
				attrName = embeddedDataComponentAttrs[ i ].getName();
				
				if( ( dataComponent = data[ attrName ] ) && dataComponent.isModified( options ) ) {
					options.attributeNames.push( attrName );
				}
			}
			
			// Add any shallow-modified 'related' (i.e. non-embedded) collections to the options.attributeNames array
			var relatedCollectionAttrs = this.getRelatedCollectionAttributes();
			for( i = 0, len = relatedCollectionAttrs.length; i < len; i++ ) {
				attrName = relatedCollectionAttrs[ i ].getName();
				
				if( ( collection = data[ attrName ] ) && collection.isModified( { shallow: true } ) ) {
					options.attributeNames.push( attrName );
				}
			}
			
			return require( 'data/NativeObjectConverter' ).convert( this, options );
		},
		
		
		/**
		 * Commits modified attributes' data. Data can no longer be reverted after a commit has been performed. Note: When developing with a {@link #proxy},
		 * this method should normally not need to be called explicitly, as it will be called upon the successful persistence of the Model's data
		 * to the server.
		 * 
		 * @override
		 */
		commit : function() {
			this.modifiedData = {};  // reset the modifiedData hash. There is no modified data.
			
			// Go through all embedded models/collections, and "commit" those as well
			var embeddedDataComponentAttrs = this.getEmbeddedDataComponentAttributes(),
			    data = this.data,
			    attrName,
			    dataComponent,
			    collection;
			
			for( var i = 0, len = embeddedDataComponentAttrs.length; i < len; i++ ) {
				attrName = embeddedDataComponentAttrs[ i ].getName();
				
				if( ( dataComponent = data[ attrName ] ) ) {
					dataComponent.commit();
				}
			}
			
			// Shallowly commit any 'related' (i.e. non-embedded) collections
			var relatedCollectionAttrs = this.getRelatedCollectionAttributes();
			for( i = 0, len = relatedCollectionAttrs.length; i < len; i++ ) {
				attrName = relatedCollectionAttrs[ i ].getName();
				
				if( ( collection = data[ attrName ] ) && collection.isModified( { shallow: true } ) ) {
					collection.commit( { shallow: true } );
				}
			}
			
			this.fireEvent( 'commit', this );
		},
		
		
		/**
		 * Rolls back the Model attributes that have been changed since the last commit or rollback.
		 * 
		 * @override
		 */
		rollback : function() {
			// Loop through the modifiedData hash, which holds the *original* values, and set them back to the data hash.
			var modifiedData = this.modifiedData;
			for( var attributeName in modifiedData ) {
				if( modifiedData.hasOwnProperty( attributeName ) ) {
					this.data[ attributeName ] = modifiedData[ attributeName ];
				}
			}
			
			this.modifiedData = {};
			
			this.fireEvent( 'rollback', this );
		},
		
		
		// --------------------------------
		
		
		/**
		 * Creates a clone of the Model, by copying its instance data. Note that the cloned model will *not* have a value
		 * for its {@link #idAttribute} (as it is a new model, and multiple models of the same type cannot exist with
		 * the same id). You may optionally provide a new id for the clone with the `id` parameter. 
		 * 
		 * Note: This is a very early, alpha version of the method, where the final version will most likely
		 * account for embedded models, while copying embedded models and other such nested data. Will also handle 
		 * circular dependencies. I don't recommend using it just yet.
		 * 
		 * @param {Mixed} [id] A new id for the Model. Defaults to undefined.
		 * @return {data.Model} The new Model instance, which is a clone of the Model this method was called on.
		 */
		clone : function( id ) {
			var data = _.cloneDeep( this.getData() );
			
			// Remove the id, so that it becomes a new model. If this is kept here, a reference to this exact
			// model will be returned instead of a new one, as the framework does not allow duplicate models with
			// the same id. Otherwise, if a new id is passed, it will be set to the new model.
			if( typeof id === 'undefined' ) {
				delete data[ this.idAttribute ];
			} else {
				data[ this.idAttribute ] = id;
			}
			
			return new this.constructor( data );
		},
		
		
		// --------------------------------
		
		// Persistence Functionality
		
			
		/**
		 * Sets the {@link data.persistence.proxy.Proxy} that for this particular model instance. Setting a proxy
		 * with this method will only affect this particular model instance, not any others.
		 * 
		 * To configure a proxy that will be used for all instances of the Model, set one in a Model sublass.
		 * 
		 * @param {data.persistence.proxy.Proxy} The Proxy to set to this model instance.
		 */
		setProxy : function( proxy ) {
			this.proxy = proxy;
		},
		
			
		/**
		 * Retrieves the {@link data.persistence.proxy.Proxy} that is configured for this model instance. To retrieve
		 * the proxy that belongs to the Model class itself, use the static {@link #static-method-getProxy getProxy} 
		 * method. Note that unless the model instance is configured with a different proxy, it will inherit the
		 * Model's static proxy.
		 * 
		 * @return {data.persistence.proxy.Proxy} The Proxy configured for the model, or null.
		 */
		getProxy : function() {
			return this.proxy || null;
		},
		
		
		/**
		 * Determines if the Model is currently {@link #loading}, via its {@link #proxy}.
		 * 
		 * @return {Boolean} `true` if the Model is currently loading a set of data, `false` otherwise.
		 */
		isLoading : function() {
			return this.loading;
		},
		
		
		/**
		 * Determines if the Model is currently {@link #method-save saving} its data, via its {@link #proxy}
		 * 
		 * @return {Boolean} `true` if the Model is currently saving its set of data, `false` otherwise.
		 */
		isSaving : function() {
			return this.saving;
		},
		
		
		/**
		 * Determines if the Model is currently {@link #method-destroy destroying} itself, via its {@link #proxy}.
		 * 
		 * @return {Boolean} `true` if the Model is currently saving its set of data, `false` otherwise.
		 */
		isDestroying : function() {
			return this.destroying;
		},
		
		
		/**
		 * Determines if the Model has been {@link #method-destroy destroyed}.
		 * 
		 * @return {Boolean} `true` if the Model has been destroyed, `false` otherwise.
		 */
		isDestroyed : function() {
			return this.destroyed;
		},
		
		
		/**
		 * (Re)Loads the Model's attributes from its persistent storage (such as a web server), using the configured 
		 * {@link #proxy}. Any changed data will be discarded. The Model must have a value for its {@link #idAttribute}
		 * for this method to succeed.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `model` : {@link data.Model} This Model instance.
		 * - `operation` : {@link data.persistence.operation.Read} The ReadOperation that was executed.
		 * 
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Function} [options.success] Function to call if the save is successful.
		 * @param {Function} [options.failure] Function to call if the save fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless of a success or fail state.
		 * @param {Object} [options.scope] The object to call the `success`, `failure`, and `complete` callbacks in. This may also
		 *   be provided as `context` if you prefer. Defaults to this Model.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the reload completes. The Promise is both 
		 *   resolved or rejected with the arguments listed above in the method description.
		 */
		load : function( options ) {
			options = options || {};
			var emptyFn    = Data.emptyFn,
			    scope      = options.scope    || options.context || this,
			    successCb  = options.success  || emptyFn,
			    errorCb    = options.error    || emptyFn,
			    completeCb = options.complete || emptyFn,
			    deferred   = new jQuery.Deferred();
			
			// <debug>
			if( !this.proxy ) {
				throw new Error( "data.Model::load() error: Cannot load. No proxy configured." );
			}
			if( this.isNew() ) {
				throw new Error( "data.Model::load() error: Cannot load. Model does not have an idAttribute that relates to a valid attribute, or does not yet have a valid id (i.e. an id that is not null)." );
			}
			// </debug>
			
			// Attach any user-provided callbacks to the deferred.
			deferred
				.done( _.bind( successCb, scope ) )
				.fail( _.bind( errorCb, scope ) )
				.always( _.bind( completeCb, scope ) );
			
			// Set the `loading` flag while the Model is loading. Will be set to false in onLoadSuccess or onLoadError
			this.loading = true;
			this.fireEvent( 'loadbegin', this );
			
			// Make a request to load the data from the proxy
			var me = this,  // for closures
			    operation = new ReadOperation( { modelId: this.getId(), params: options.params } );
			this.proxy.read( operation ).then(
				function( operation ) { me.onLoadSuccess( deferred, operation ); },
				function( operation ) { me.onLoadError( deferred, operation ); }
			);
			
			return deferred.promise();
		},
		
		
		/**
		 * Handles the {@link #proxy} successfully loading a set of data as a result of the {@link #method-load}
		 * method being called.
		 * 
		 * Resolves the `jQuery.Deferred` object created by {@link #method-load}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the {@link #method-load} method. This 
		 *   Deferred will be resolved after post-processing of the successful load is complete.
		 * @param {data.persistence.operation.Read} operation The ReadOperation object which represents the load.
		 */
		onLoadSuccess : function( deferred, operation ) {
			this.set( operation.getResultSet().getRecords()[ 0 ] );
			this.loading = false;
			
			this.commit();
			
			deferred.resolve( this, operation ); 
			this.fireEvent( 'load', this, operation );
		},
		
		
		/**
		 * Handles the {@link #proxy} failing to load a set of data as a result of the {@link #method-load} method 
		 * being called.
		 * 
		 * Rejects the `jQuery.Deferred` object created by {@link #method-load}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the {@link #method-load} method. This 
		 *   Deferred will be rejected after any post-processing.
		 * @param {data.persistence.operation.Read} operation The ReadOperation object which represents the load.
		 */
		onLoadError : function( deferred, operation ) {
			this.loading = false;
			
			deferred.reject( this, operation );
			this.fireEvent( 'load', this, operation );
		},
		
		
		/**
		 * Persists the Model data to persistent storage, using the configured {@link #proxy}. If the request to persist the Model's 
		 * data is successful, the Model's data will be {@link #method-commit committed} upon completion.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `model` : {@link data.Model} This Model instance.
		 * - `operation` : {@link data.persistence.operation.Write} The WriteOperation that was executed.
		 * 
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Boolean} [options.syncRelated=true] `true` to synchronize (persist) the "related" child models/collections 
		 *   of this Model (if it has any). Related models/collections must be stored under {@link data.attribute.Model}
		 *   or {@link data.attribute.Collection} Attributes for this to work. The models/collections that would be synchronized
		 *   would be the child models/{@link data.Collection collections} that are related to the Model (i.e. not 
		 *   {@link data.attribute.DataComponent#embedded embedded} in the Model). 
		 *   
		 *   Set to `false` to only save the data in this Model, leaving any related child models/collections to be persisted 
		 *   individually, at another time.
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Function} [options.success] Function to call if the save is successful.
		 * @param {Function} [options.error] Function to call if the save fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in. This may also
		 *   be provided as `context` if you prefer. Defaults to the Model.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the save completes. The Promise is both 
		 *   resolved or rejected with the arguments listed above in the method description.
		 */
		save : function( options ) {
			options = options || {};
			var me          = this,  // for closures
			    syncRelated = ( options.syncRelated === undefined ) ? true : options.syncRelated,  // defaults to true
			    emptyFn     = Data.emptyFn,
			    scope       = options.scope    || options.context || this,
			    successCb   = options.success  || emptyFn,
			    errorCb     = options.error    || emptyFn,
			    completeCb  = options.complete || emptyFn;
			
			// <debug>
			if( !this.proxy ) {
				// No proxy, cannot save. Throw an error
				throw new Error( "data.Model::save() error: Cannot save. No proxy." );
			}
			if( !this.hasIdAttribute() ) {
				// No id attribute, throw an error
				throw new Error( "data.Model::save() error: Cannot save. Model does not have an idAttribute that relates to a valid attribute." );
			}
			// </debug>
			
			// Set the `saving` flag while the Model is saving. Will be set to false in onSaveSuccess or onSaveError
			this.saving = true;
			this.fireEvent( 'savebegin', this );
			
			// First, synchronize any nested related (i.e. non-embedded) Models and Collections of the model.
			// Chain the synchronization of collections to the synchronization of this Model itself to create
			// the `modelSavePromise` (if the `syncRelated` option is true)
			var modelSavePromise;
			if( syncRelated ) {
				modelSavePromise = jQuery.when( this.syncRelatedCollections(), this.syncRelatedModels() ).then( function() { 
					return me.doSave( options ); 
			    } );
			} else {  // not synchronizing related collections/models
				modelSavePromise = this.doSave( options );
			}
			
			// Set up any callbacks provided in the options
			modelSavePromise
				.done( _.bind( successCb, scope ) )
				.fail( _.bind( errorCb, scope ) )
				.always( _.bind( completeCb, scope ) );
			
			return modelSavePromise;
		},
		
		
		/**
		 * Private utility method which is used to synchronize all of the nested related (i.e. not 'embedded') 
		 * collections for this Model. Returns a Promise object which is resolved when all collections have been 
		 * successfully synchronized.
		 * 
		 * @private
		 * @return {jQuery.Promise} A Promise object which is resolved when all collections have been successfully
		 *   synchronized. If any of the requests to synchronize collections should fail, the Promise will be rejected.
		 *   If there are no nested related collections, the promise is resolved immediately.
		 */
		syncRelatedCollections : function() {
			var collectionSyncPromises = [],
			    relatedCollectionAttributes = this.getRelatedCollectionAttributes();
			
			for( var i = 0, len = relatedCollectionAttributes.length; i < len; i++ ) {
				var collection = this.get( relatedCollectionAttributes[ i ].getName() );
				if( collection ) {  // make sure there is actually a Collection (i.e. it's not null)
					collectionSyncPromises.push( collection.sync() );
				}
			}
			
			// create and return single Promise object out of all the Collection synchronization promises
			return jQuery.when.apply( null, collectionSyncPromises );
		},
		
		
		/**
		 * Private utility method which is used to save all of the nested related (i.e. not 'embedded') 
		 * models for this Model. Returns a Promise object which is resolved when all models have been 
		 * successfully saved.
		 * 
		 * @private
		 * @return {jQuery.Promise} A Promise object which is resolved when all related models have been successfully
		 *   saved. If any of the requests to save a model should fail, the Promise will be rejected.
		 *   If there are no nested related models, the promise is resolved immediately.
		 */
		syncRelatedModels : function() {
			var modelSavePromises = [],
			    relatedModelAttributes = this.getRelatedModelAttributes();
			
			for( var i = 0, len = relatedModelAttributes.length; i < len; i++ ) {
				var model = this.get( relatedModelAttributes[ i ].getName() );
				if( model ) {  // make sure there is actually a Model (i.e. it's not null)
					modelSavePromises.push( model.save() );
				}
			}
			
			// create and return single Promise object out of all the Model save promises
			return jQuery.when.apply( null, modelSavePromises );
		},
		
		
		/**
		 * Private method that performs the actual save (persistence) of this Model. This method is called from 
		 * {@link #method-save} at the appropriate time. It is delayed from being called if the Model first has to 
		 * persist non-{@link data.attribute.DataComponent#embedded embedded}) child collections.
		 * 
		 * @private
		 * @param {Object} options The `options` object provided to the {@link #method-save} method.
		 * @return {jQuery.Promise} The observable Promise object which can be used to determine if the save call has 
		 *   completed successfully (`done` callback) or errored (`fail` callback), and to perform any actions that need to 
		 *   be taken in either case with the `always` callback.
		 */
		doSave : function( options ) {
			var me = this,   // for closures
			    deferred = new jQuery.Deferred();
			
			// Store a "snapshot" of the data that is being persisted. This is used to compare against the Model's current data at the time of when the persistence operation 
			// completes. Anything that does not match this persisted snapshot data must have been updated while the persistence operation was in progress, and the Model must 
			// be considered modified for those attributes after its commit() runs. This is a bit roundabout that a commit() operation runs when the persistence operation is complete
			// and then data is manually modified, but this is also the correct time to run the commit() operation, as we still want to see the changes if the request fails. 
			// So, if a persistence request fails, we should have all of the data still marked as modified, both the data that was to be persisted, and any new data that was set 
			// while the persistence operation was being attempted.
			var persistedData = _.cloneDeep( this.getData() );
			
			var handleServerUpdate = function( resultSet ) {  // accepts a data.persistence.ResultSet object
				var data = ( resultSet ) ? resultSet.getRecords()[ 0 ] : null;
				data = data || me.getData();  // no data returned, used the model's data. hack for now...
	
				// The request to persist the data was successful, commit the Model
				me.commit();
				
				// Loop over the persisted snapshot data, and see if any Model attributes were updated while the persistence request was taking place.
				// If so, those attributes should be marked as modified, with the snapshot data used as the "originals". See the note above where persistedData was set. 
				var currentData = me.getData();
				for( var attributeName in persistedData ) {
					if( persistedData.hasOwnProperty( attributeName ) && !_.isEqual( persistedData[ attributeName ], currentData[ attributeName ] ) ) {
						me.modifiedData[ attributeName ] = persistedData[ attributeName ];   // set the last persisted value on to the "modifiedData" object. Note: "modifiedData" holds *original* values, so that the "data" object can hold the latest values. It is how we know an attribute is modified as well.
					}
				}
			};
			
			
			// Make a request to create or update the data on the server
			var writeOperation = new WriteOperation( {
				models : [ this ],
				params : options.params
			} );
			this.proxy[ this.isNew() ? 'create' : 'update' ]( writeOperation ).then(
				function( operation ) { handleServerUpdate( operation.getResultSet() ); me.onSaveSuccess( deferred, operation ); },
				function( operation ) { me.onSaveError( deferred, operation ); }
			);
			
			return deferred.promise();  // return only the observable Promise object of the Deferred
		},
		
		
		/**
		 * Handles the {@link #proxy} successfully saving the Model as a result of the {@link #method-save}
		 * method being called.
		 * 
		 * Resolves the `jQuery.Deferred` object created by {@link #method-save}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the {@link #method-save} method. This 
		 *   Deferred will be resolved after post-processing of the successful save is complete.
		 * @param {data.persistence.operation.Write} operation The WriteOperation object which represents the save.
		 */
		onSaveSuccess : function( deferred, operation ) {
			this.saving = false;
			
			deferred.resolve( this, operation ); 
			this.fireEvent( 'save', this, operation );
		},
		
		
		/**
		 * Handles the {@link #proxy} failing to destroy the Model a result of the {@link #method-destroy} method 
		 * being called.
		 * 
		 * Rejects the `jQuery.Deferred` object created by {@link #method-save}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the {@link #method-save} method. This 
		 *   Deferred will be rejected after post-processing of the successful save is complete.
		 * @param {data.persistence.operation.Write} operation The WriteOperation object which represents the save.
		 */
		onSaveError : function( deferred, operation ) {
			this.saving = false;
			
			deferred.reject( this, operation );
			this.fireEvent( 'save', this, operation );
		},
		
		
		
		/**
		 * Destroys the Model on the backend, using the configured {@link #proxy}.
		 * 
		 * All of the callbacks, and the promise handlers are called with the following arguments:
		 * 
		 * - `model` : {@link data.Model} This Model instance.
		 * - `operation` : {@link data.persistence.operation.Write} The WriteOperation that was executed.
		 * 
		 * @param {Object} [options] An object which may contain the following properties:
		 * @param {Object} [options.params] Any additional parameters to pass along to the configured {@link #proxy}
		 *   for the operation. See {@link data.persistence.operation.Operation#params} for details.
		 * @param {Function} [options.success] Function to call if the destroy (deletion) is successful.
		 * @param {Function} [options.error] Function to call if the destroy (deletion) fails.
		 * @param {Function} [options.complete] Function to call when the operation is complete, regardless of success or failure.
		 * @param {Object} [options.scope] The object to call the `success`, `error`, and `complete` callbacks in. This may also
		 *   be provided as `context` if you prefer. Defaults to the Model.
		 * @return {jQuery.Promise} A Promise object which may have handlers attached for when the destroy (deletion) completes. The 
		 *   Promise is both resolved or rejected with the arguments listed above in the method description.
		 */
		destroy : function( options ) {
			options = options || {};
			var me          = this,   // for closures
			    emptyFn     = Data.emptyFn,
			    scope       = options.scope    || options.context || this,
			    successCb   = options.success  || emptyFn,
			    errorCb     = options.error    || emptyFn,
			    completeCb  = options.complete || emptyFn,
			    deferred    = new jQuery.Deferred();
			
			// No proxy, cannot destroy. Throw an error
			// <debug>
			if( !this.proxy ) {
				throw new Error( "data.Model::destroy() error: Cannot destroy model on server. No proxy." );
			}
			// </debug>
			
			// Attach any user-provided callbacks to the deferred.
			deferred
				.done( _.bind( successCb, scope ) )
				.fail( _.bind( errorCb, scope ) )
				.always( _.bind( completeCb, scope ) );
			
			// Set the `destroying` flag while the Model is destroying. Will be set to false in onDestroySuccess 
			// or onDestroyError
			this.destroying = true;
			this.fireEvent( 'destroybegin', this );
			
			var operation = new WriteOperation( {
				models : [ this ],
				params : options.params
			} );
			
			if( this.isNew() ) {
				// If it is a new model, there is nothing on the server to destroy. Simply fire the event and call the callback.
				operation.setSuccess();  // would normally be set by the proxy if we were making a request to it
				this.onDestroySuccess( deferred, operation );
				
			} else {
				// Make a request to destroy the data on the server
				this.proxy.destroy( operation ).then(
					function( operation ) { me.onDestroySuccess( deferred, operation ); },
					function( operation ) { me.onDestroyError( deferred, operation ); }
				);
			}
			
			return deferred.promise();  // return just the observable Promise object of the Deferred
		},
		
		
		/**
		 * Handles the {@link #proxy} successfully destroying the Model as a result of the {@link #method-destroy}
		 * method being called.
		 * 
		 * Resolves the `jQuery.Deferred` object created by {@link #method-destroy}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the {@link #method-destroy} method. This 
		 *   Deferred will be resolved after post-processing of the successful destroy is complete.
		 * @param {data.persistence.operation.Write} operation The WriteOperation object which represents the destroy.
		 */
		onDestroySuccess : function( deferred, operation ) {
			this.destroying = false;
			this.destroyed = true;
			
			deferred.resolve( this, operation ); 
			this.fireEvent( 'destroy', this, operation );
		},
		
		
		/**
		 * Handles the {@link #proxy} failing to destroy the Model a result of the {@link #method-destroy} method 
		 * being called.
		 * 
		 * Rejects the `jQuery.Deferred` object created by {@link #method-destroy}.
		 * 
		 * @protected
		 * @param {jQuery.Deferred} deferred The Deferred object created in the {@link #method-destroy} method. This 
		 *   Deferred will be rejected after post-processing of the successful destroy is complete.
		 * @param {data.persistence.operation.Write} operation The WriteOperation object which represents the destroy.
		 */
		onDestroyError : function( deferred, operation ) {
			this.destroying = false;
			
			deferred.reject( this, operation );
			this.fireEvent( 'destroy', this, operation );
		},
		
		
		// ------------------------------------
		
		// Protected utility methods
		
		
		/**
		 * Retrieves an array of the Attributes configured for this model that are {@link data.attribute.DataComponent DataComponent Attributes}.
		 * 
		 * @protected
		 * @return {data.attribute.DataComponent[]}
		 */
		getDataComponentAttributes : function() {
			return _.filter( this.attributes, function( attr ) { return ( attr instanceof DataComponentAttribute ); } );
		},
		
		
		/**
		 * Retrieves an array of the Attributes configured for this model that are {@link data.attribute.DataComponent DataComponent Attributes} 
		 * which are also {@link data.attribute.DataComponent#embedded}. This is a convenience method that supports the methods which
		 * use the embedded DataComponent Attributes. 
		 * 
		 * @protected
		 * @return {data.attribute.DataComponent[]} The array of embedded DataComponent Attributes.
		 */
		getEmbeddedDataComponentAttributes : function() {
			return _.filter( this.getDataComponentAttributes(), function( attr ) { return attr.isEmbedded(); } );
		},
		
		
		/**
		 * Retrieves an array of the Attributes configured for this model that are {@link data.attribute.Collection Collection Attributes}.
		 * 
		 * @protected
		 * @return {data.attribute.Collection[]}
		 */
		getCollectionAttributes : function() {
			return _.filter( this.attributes, function( attr ) { return attr instanceof CollectionAttribute; } );
		},
		
		
		/**
		 * Retrieves an array of the Attributes configured for this model that are {@link data.attribute.Collection Collection Attributes},
		 * but are *not* {@link data.attribute.Collection#embedded embedded} attributes (i.e. they are "related" attributes).
		 * 
		 * @protected
		 * @return {data.attribute.Collection[]} 
		 */
		getRelatedCollectionAttributes : function() {
			return _.filter( this.getCollectionAttributes(), function( attr ) { return !attr.isEmbedded(); } );
		},
		
		
		/**
		 * Retrieves an array of the Attributes configured for this model that are {@link data.attribute.Model Model Attributes}.
		 * 
		 * @protected
		 * @return {data.attribute.Model[]}
		 */
		getModelAttributes : function() {
			return _.filter( this.attributes, function( attr ) { return attr instanceof ModelAttribute; } );
		},
		
		
		/**
		 * Retrieves an array of the Attributes configured for this model that are {@link data.attribute.Collection Collection Attributes},
		 * but are *not* {@link data.attribute.Collection#embedded embedded} attributes (i.e. they are "related" attributes).
		 * 
		 * @protected
		 * @return {data.attribute.Collection[]} 
		 */
		getRelatedModelAttributes : function() {
			return _.filter( this.getModelAttributes(), function( attr ) { return !attr.isEmbedded(); } );
		}
		
	} );
	
	
	return Model;
	
} );
