/*global define */
define( [
	'lodash',
	'Class',
	'gui/Gui',
	'gui/ComponentManager',
	'gui/Component',
	'gui/layout/Manager',
	'gui/layout/Layout',
	'gui/layout/Auto'
], function( _, Class, Gui, ComponentManager, Component, LayoutManager, Layout, AutoLayout ) {

	/**
	 * @class gui.Container
	 * @extends gui.Component
	 * @alias type.container
	 *
	 * Base class for a component that holds other child components. Provides a default
	 * container layout that just adds child components directly into it with no layout.
	 */
	var Container = Component.extend( {
	
		/**
		 * @cfg {String} defaultType
		 * 
		 * The default Component 'type' to instantiate when child {@link #items} are specified as anonymous config objects
		 * without a `type` property of their own. 
		 */
		defaultType : 'container',
		
		/**
		 * @cfg {String/Function} acceptType
		 * 
		 * The {@link gui.Component} class (or subclass) to accept in the Container for child {@link #items}. If an added component 
		 * is not an instance of this type, an error will be thrown. This should be set to a {@link gui.Component} subclass (as only 
		 * {@link gui.Component Components} may be added to a Container in the first place).
		 * 
		 * This config is useful for subclasses to set/override if they require a specific {@link gui.Component} subclass to be added to
		 * them, so as to not allow just any {@link gui.Component} to be added, and direct the user as such.
		 * 
		 * The value for this configuration option can either be the constructor function for a {@link gui.Component} class, or a
		 * 'type' string which will be resolved to a {@link gui.Component} class via {@link gui.ComponentManager#getType}.
		 * 
		 * Note that the check for this is performed after any anonymous config objects have been converted into their corresponding
		 * {@link gui.Component} instance.
		 */
		acceptType : Component,
	
		/**
		 * @cfg {Boolean} destroyRemoved
		 * True if the Container should automatically destroy child Components that have been removed from it.
		 */
		destroyRemoved : true,
	
		/**
		 * @cfg {String/Object/gui.layout.Layout} layout
		 * The layout strategy object to use for laying out (displaying) the Container's child items.  This can either be a string with the
		 * type name of the layout, an object which should have the property `type` (for the layout's type name) and any other layout
		 * configuration options, or an instantiated {@link gui.layout.Layout} subclass.
		 */
	
		/**
		 * @cfg {Object/Object[]/gui.Component/gui.Component[]} items
		 * Any Components/Containers that will become children of this Container, and will be instantiated at
		 * construction time.  These can be retrieved from the Container using {@link #getItems}.
		 *
		 * Note that specifying child items is mutually exclusive with setting the {@link gui.Component#html} and
		 * {@link gui.Component#contentEl} configs, and will take precedence over them.
		 */
	
		/**
		 * @cfg
		 * @inheritdoc
		 */
		baseCls : 'gui-container',
	
	
		/**
		 * @private
		 * @property {gui.Component[]} childComponents
		 * 
		 * An array of child components. Created from the "items" config, or call(s) to the {@link #method-add} method.
		 */
		
		/**
		 * @private
		 * @property {Boolean} deferLayout
		 * 
		 * Will be set to true if a layout is requested (i.e. the {@link #doLayout} method is run), but the Container
		 * cannot be laid out at that time due to the Container being hidden.  This flag is tested for when the Container
		 * is then shown, and if true, will run {@link #doLayout} then.
		 */
		deferLayout : false,
	
	
		/**
		 * @inheritdoc
		 */
		initComponent : function() {
			// If the items config has a value, remove any html and contentEl configs, as the items config takes precedence.
			if( this.items ) {
				this.html = undefined;
				this.contentEl = undefined;
			}
	
			// Check that the `acceptType` config actually refer to a class, or resolve a type name to the class.
			this.acceptType = this.resolveType( this.acceptType );
			
			this.addEvents(
				/**
				 * Fires before a Component has been added to this Container. A handler of
				 * this event may return false to cancel the addition of the Component.
				 *
				 * @event beforeadd
				 * @param {gui.Container} container This Container.
				 * @param {gui.Component} component The Component that is to be added.
				 */
				'beforeadd',
	
				/**
				 * Fires after a Component has been added to this Container. This event bubbles.
				 *
				 * @event add
				 * @param {gui.Container} container This Container.
				 * @param {gui.Component} component The Component that was added.
				 * @param {Number} index The index in this Container's child items array that the Component was added to.
				 */
				'add',
	
				/**
				 * Fires when a Component has been reordered within the Container (i.e. its index has changed).
				 * This is fired by the {@link #insert} method if it notices that the Component being "inserted" is
				 * already in this Container, but at a different index. If the Component was previously in a different
				 * Container, then the {@link #event-add} event is fired.
				 *
				 * @event reorder
				 * @param {gui.Container} container This Container.
				 * @param {gui.Component} component The Component that was reordered within the Container.
				 * @param {Number} index The new index of the Component in this Container's child items array.
				 * @param {Number} previousIndex The previous index of the Component in this Container's child items array.
				 */
				'reorder',
	
				/**
				 * Fires before a Component has been removed from this Container. A handler of
				 * this event may return false to cancel the removal of the Component.
				 *
				 * @event beforeremove
				 * @param {gui.Container} container This Container.
				 * @param {gui.Component} component The Component that is to be removed.
				 */
				'beforeremove',
	
				/**
				 * Fires after a Component has been removed from this Container. This event bubbles.
				 *
				 * @event remove
				 * @param {gui.Container} container This Container.
				 * @param {gui.Component} component The Component that was removed.
				 * @param {Number} index The index in this Container's child items array that the Component was removed from.
				 */
				'remove',
				
				/**
				 * Fires after the Container's {@link #doLayout} method has successfully executed.  
				 * Note that this event will fire after the {@link #event-render} event fires for
				 * the initial rendering of the Container (as {@link #doLayout} is executed at that
				 * point).
				 *
				 * @event afterlayout
				 * @param {gui.Container} container This Container.
				 */
				'afterlayout'
			);
	
			// Call superclass initComponent
			this._super( arguments );
	
			this.childComponents = [];
	
			// Add child Components if specified in an items config
			if( this.items ) {
				this.add( this.items );
				delete this.items;  // no longer needed, instantiated item components have been put into this.childComponents
			}
	
			// Set any provided layout.
			if( this.layout ) {
				this.setLayout( this.layout );
			}
	
	
			// If initial data was provided for child Components, set it now.
			if( this.data ) {
				this.setData( this.data );
			}
		},
		
		
		/**
		 * Resolves the constructor function for the value provided to the `type` argument. If a string is provided,
		 * it is assumed to be a 'type' name and a lookup for the constructor function is performed via 
		 * {@link gui.ComponentManager#getType}. If a function is provided, the function is returned as-is.
		 * 
		 * This method is used to support the {@link #defaultType} and {@link #acceptType} configs.
		 * 
		 * @protected
		 * @param {String/Function} type The input type name, or constructor function.
		 * @return {Function} The constructor function for the `type`.
		 * @throws {Error} If the `type` does not resolve to a constructor function.
		 */
		resolveType : function( type ) {
			if( typeof type === 'string' && ComponentManager.hasType( type ) ) {
				type = ComponentManager.getType( type );
			}
			
			// <debug>
			if( !_.isFunction( type ) ) {
				throw new Error( "The provided `type` did not resolve to a constructor function" );
			}
			// </debug>
			
			return type;
		},
		
	
		// ----------------------------------------
	
		// Child Component Manipulation Methods
	
	
		/**
		 * Creates a Component from a configuration object. Automatically adds the parentContainer property to the supplied
		 * `config` object that refers to this Container, and adds the {@link #defaultType} to the `config` object
		 * if no `type` property was specified.
		 *
		 * @protected
		 * @method createComponent
		 * @param {Object} config The configuration object for the Component.
		 * @return {gui.Component} The instantiated Component.
		 */
		createComponent : function( config ) {
			// Set the Component's parentContainer property to this Container, and use the default component 'type' if one wasn't specified
			// in the provided config. Adding in the 'parentContainer' and 'type' properties onto a new object, because we
			// don't want to modify the original configuration object (as that object may be used multiple times, or elsewhere).
			config = _.defaults( _.clone( config ), {
				parentContainer: this,
				type: this.defaultType
			} );
	
			return ComponentManager.create( config );
		},
	
	
		/**
		 * Adds child {@link gui.Component Component(s)} to this Container, instantiating them into their appropriate
		 * gui.Component subclass.  When all Components are added, this method automatically calls {@link #doLayout} to
		 * refresh the layout.
		 *
		 * Note that if multiple Components are being added, it is recommended that they all be provided to this method
		 * in one call, using the array form of the `cmp` argument.  A call to {@link #doLayout} will only be done
		 * after all Components are added (and not once for each add).
		 *
		 * This method fires the 'add' event for each Component that is added.
		 *
		 *
		 * @method add
		 * @param {gui.Component/Object/gui.Component[]/Array} cmp A single child {@link gui.Component} or config object, or an array of
		 *   child {@link gui.Component Components} or config objects.
		 * @return {gui.Component/gui.Component[]} Returns the Component that was added, or an array of the Components that were added, depending on
		 *   the type provided to the `cmp` argument.  Single Component addition returns a single Component; array addition returns an array. See
		 *   the return value of {@link #insert}.
		 */
		add : function( cmp ) {
			var returnVal;
	
			if( _.isArray( cmp ) ) {
				returnVal = [];
				for( var i = 0, numItems = cmp.length; i < numItems; i++ ) {
					returnVal.push( this.doInsert( cmp[ i ] ) );
				}
	
			} else {
				returnVal = this.doInsert( cmp );  // note: will append the component when not specifying the "position" argument
			}
	
			// Redraw the layout after all Components have been added
			this.doLayout();
	
			return returnVal;
		},
	
	
		/**
		 * Inserts (or moves) a {@link gui.Component Component} into this Container.
		 *
		 * @method insert
		 * @param {gui.Component/Object} cmp The Component or config object of a Component to insert.
		 * @param {Number} position (optional) The position (index) to insert the Component at. If omitted, the component will be appended to the Container.
		 * @return {gui.Component} The Component that was inserted, or null if the Component was not added because a beforeadd event handler returned false.
		 */
		insert : function( cmp, position ) {
			cmp = this.doInsert( cmp, position );
	
			// Redraw the layout after the Component has been inserted
			this.doLayout();
	
			return cmp;
		},
	
	
		/**
		 * Private method that does the actual add or insert of the Component.  This is called by both {@link #method-add} and {@link #insert} methods, and exists
		 * so that those methods can call {@link #doLayout} after their processing is complete.
		 *
		 * @private
		 * @method doInsert
		 * @param {gui.Component/Object} component The Component or config object of a Component to insert.
		 * @param {Number} position (optional) The position (index) to insert the Component at. If omitted, the component will be appended to the Container.
		 * @return {gui.Component} The Component that was inserted, or null if the component was not added because a beforeadd event handler returned false.
		 */
		doInsert : function( component, position ) {
			// First, fix position if it is out of the bounds of the childComponents array
			if( typeof position !== 'number' ) {
				position = this.childComponents.length;  // append by default
			} else if( position < 0 ) {
				position = 0;
			} else if( position > this.childComponents.length ) {
				position = this.childComponents.length;
			}
	
	
			var isInstantiatedComponent = ( component instanceof Component ),   // if the component argument is an actual instantiated gui.Component, and not just a configuration object
			    isReorder = isInstantiatedComponent && this.has( component );  // Determines if this is an actual addition of the Component to the Container, or a reorder of the Component within the Container
	
			if( isReorder ) {
				// Component is currently in this Container, remove its reference from its current location in the childComponents array.
				// It will be re-added to the childComponents array next.
				var childComponents = this.childComponents;
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					if( childComponents[ i ] === component ) {
						this.childComponents.splice( i, 1 );  // remove component from array. will re-add later
						break;
					}
				}
	
				// Add the component to the new position in the childComponents array
				this.childComponents.splice( position, 0, component );
	
				// Call the onReorder template method, and fire the 'reorder' event
				this.onReorder( component, position, i );  // Component, new index, previous index
				this.fireEvent( 'reorder', this, component, position, i );  // Container, Component, new index, previous index
	
				return component;
	
			} else {
				// If the component is not yet a gui.Component instance at this point (i.e. it is a configuration object), instantiate it now so
				// we can provide it to the beforeadd event
				if( !isInstantiatedComponent ) {
					component = this.createComponent( component );
				}
				
				// Perform the check that the component is of the correct class type (governed by the 'acceptType' config).
				if( !( component instanceof this.acceptType ) ) {  // Note: this.acceptType defaults to gui.Component
					throw new Error( "A Component added to the Container was not of the correct class type ('acceptType' config)" );
				}
	
				if( this.fireEvent( 'beforeadd', this, component ) !== false ) {
					// If the component currently has a parent Container other than this one, remove the component from it. We will set its parent to this Container next.
					var currentParentContainer = component.getParentContainer();
					if( currentParentContainer ) {
						currentParentContainer.remove( component, /* destroyRemoved */ false );
					}
					
					// Set the component to have this Container as its parent container (regardless of if it has a current parent Container or not)
					component.setParentContainer( this );
	
					// Add the component to the new position in the childComponents array
					this.childComponents.splice( position, 0, component );
	
					// Run template method, and fire the event
					this.onAdd( component, position );
					this.fireEvent( 'add', this, component, position );
	
					return component;
	
				} else {
					// a beforeadd event handler returned false, return null from this method
					return null;
				}
			}
		},
	
	
		/**
		 * Hook method that is run when a Component is added or inserted into the Container.
		 *
		 * @protected
		 * @template
		 * @method onAdd
		 * @param {gui.Component} component The component that was added or inserted into this Container.
		 * @param {Number} index The index in this Container's child items array where the new Component was added.
		 */
		onAdd : Gui.emptyFn,
	
	
		/**
		 * Hook method that is run when a Component is reordered within the Container.
		 *
		 * @protected
		 * @template
		 * @method onReorder
		 * @param {gui.Component} component The Component that was reordered within the Container.
		 * @param {Number} index The new index of the Component in this Container's child items array.
		 * @param {Number} previousIndex The previous index of the Component in this Container's child items array.
		 */
		onReorder : Gui.emptyFn,
	
	
	
		/**
		 * Removes one or more child {@link gui.Component Component(s)} from this Container.  
		 * 
		 * Removed {@link gui.Component Components} will automatically have their {@link gui.Component#method-destroy} method called if 
		 * the {@link #destroyRemoved} config is true (the default), or if the `destroyRemoved` argument is explicitly set to true. 
		 * If the Component is not destroyed, its main {@link gui.Component#$el element} is detached from this Container.  When all 
		 * Components are removed, this method automatically calls {@link #doLayout} to refresh the layout.
		 *
		 * Note that if multiple Components are being removed, it is recommended that they all be provided to this method
		 * in one call, using the array form of the `cmp` argument.  A call to {@link #doLayout} will only be done
		 * after all Components have been removed (as opposed to once for each Component that is removed).
		 *
		 * The 'remove' event will be fired for each Component that is successfully removed (i.e. the Component was found in the 
		 * Container, and a {@link #beforeremove} event handler did not return false for it).
		 *
		 * @method remove
		 * @param {gui.Component/gui.Component[]} cmp A single child {@link gui.Component Component}, or an array of child Components.
		 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed component. Defaults to the value of this Container's {@link #destroyRemoved} config.
		 * @return {gui.Component/gui.Component[]} Returns the Component that was removed, or an array of the Components that were removed, depending on
		 *   the type provided to the `cmp` argument.  Single Component removal returns a single Component (or null if the Component was not removed);
		 *   array removal returns an array of the Components that were successfully removed.
		 */
		remove : function( cmp, destroyRemoved ) {
			var returnVal;
	
			if( _.isArray( cmp ) ) {
				returnVal = [];
				for( var i = 0, numItems = cmp.length; i < numItems; i++ ) {
					var removedComponent = this.doRemove( cmp[ i ], destroyRemoved );
					if( removedComponent ) {
						returnVal.push( removedComponent );
					}
				}
	
			} else {
				returnVal = this.doRemove( cmp, destroyRemoved );  // note: will append the component when not specifying the "position" argument
			}
	
			// Refresh the layout
			this.doLayout();
	
			return returnVal;
		},
		
		
		/**
		 * Removes the child Component at the given `idx`, and returns the removed component. If there is no component 
		 * at the given `idx`, then this method has no effect and returns `null`.
		 * 
		 * Note that the removed {@link gui.Component Component} will automatically have its {@link gui.Component#method-destroy destroy} 
		 * method called if the {@link #destroyRemoved} config is true (the default), or if the `destroyRemoved` argument is 
		 * explicitly set to true. If the Component is not destroyed, its main {@link gui.Component#$el element} is detached from 
		 * this Container.  
		 * 
		 * When the Component is removed, this method automatically calls {@link #doLayout} to refresh the layout.
		 * 
		 * The 'remove' event will be fired for each Component that is successfully removed (i.e. the Component was found in the 
		 * Container, and a {@link #beforeremove} event handler did not return false for it).
		 * 
		 * @param {Number} idx The index of the child component to remove.
		 * @return {gui.Component} Returns the Component that was removed, or `null` if there was no Component at the given `idx`.
		 */
		removeAt : function( idx ) {
			return this.remove( this.getItemAt( idx ) );
		},
	
	
		/**
		 * Removes all child Component(s) from this Container.
		 *
		 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed components. Defaults to the value of this Container's {@link #destroyRemoved} config.
		 */
		removeAll : function( destroyRemoved ) {
			var childComponents = this.childComponents;
			for( var i = childComponents.length-1; i >= 0; i-- ) {
				this.doRemove( childComponents[ i ], destroyRemoved );
			}
	
			// Refresh the layout
			this.doLayout();
		},
	
	
		/**
		 * Removes a child {@link gui.Component Component(s)} from this Container.  If a Component is successfully removed, the 'remove' event will be fired.
		 * Removed {@link gui.Component Components} will automatically have their destroy() method called if the {@link #destroyRemoved} config is true, or
		 * if the `destroyRemoved` argument is explicitly set to true.  If the Component is not destroyed, its main {@link gui.Component#getEl element} is
		 * detached from this Container.
		 *
		 * @private
		 * @method doRemove
		 * @param {gui.Component/gui.Component[]} cmp A single child {@link gui.Component Component}, or an array of child Components.
		 * @param {Boolean} destroyRemoved (optional) True to automatically destroy the removed component. Defaults to the value of this Container's {@link #destroyRemoved} config.
		 * @return {gui.Component} The Component that was removed, or null if no Component was removed (i.e. a {@link #beforeremove}
		 *   event handler returned false, or the Component to be removed was not found).
		 */
		doRemove : function( cmp, destroyRemoved ) {
			var i, len,
			    childComponents = this.childComponents,
				idx = -1;
	
			// default the destroyRemoved argument to the Container's destroyRemoved config if not provided (i.e. undefined)
			destroyRemoved = ( typeof destroyRemoved === 'undefined' ) ? this.destroyRemoved : destroyRemoved;
	
			// Find the component in this Container
			for( i = 0, len = childComponents.length; i < len; i++ ) {
				if( childComponents[ i ] === cmp ) {
					idx = i;
					break;
				}
			}
	
			// Make sure the component exists in this container before continuing
			if( idx !== -1 ) {
				if( this.fireEvent( 'beforeremove', this, cmp ) !== false ) {
					// Remove the parentContainer reference from the child Component. It was set to this Container when the Component was added.
					cmp.setParentContainer( null );
	
					// First, detach the Component's element. This is done first so that the onRemove() template method, and subscribers of the 'remove'
					// event, can process their code without the element still being in the DOM. This is also done so that if the Component is not being
					// destroyed (destroyRemoved flag is false), that it is still at least removed from the Container's DOM (as a call to destroy() would
					// normally do the same thing when removing the element itself).
					cmp.detach();  // detach the Component's element from the Container's element (if it's rendered)
	
					childComponents.splice( idx, 1 );  // remove the Component from the Container's childComponents array
	
					// Run template method, and fire the event
					this.onRemove( cmp, idx );
					this.fireEvent( 'remove', this, cmp, idx );
	
					// Destroy the Component if the destroyRemoved flag is true at this point. Doing this after the remove event so that subscribers can
					// process the removal before the Component is possibly put into a state where say, its data can no longer be retrieved.
					if( destroyRemoved ) {
						cmp.destroy();
					}
	
					return cmp;  // successful removal, return a reference to the removed Component
				}
			}
	
			return null;  // unsuccessful removal, return null
		},
	
	
		/**
		 * Hook method that is run when a Component is removed from the Container.
		 *
		 * @protected
		 * @template
		 * @method onRemove
		 * @param {gui.Component} component The component that was removed.
		 * @param {Number} index The index in this Container's child items array where the Component was removed from.
		 */
		onRemove : Gui.emptyFn,
	
	
	
		// ----------------------------------------
	
		// Child Component Accessor Methods
	
		/**
		 * Retrives the number of child items ({@link gui.Component components}) that are currently held by this Container.
		 * 
		 * @method getCount
		 * @return {Number}
		 */
		getCount : function() {
			return this.childComponents.length;
		},
	
	
		/**
		 * Retrieves the child items ({@link gui.Component components}) that are currently held by this Container.
		 *
		 * @method getItems
		 * @return {gui.Component[]}
		 */
		getItems : function() {
			return this.childComponents;
		},
	
	
		/**
		 * Retrieves the child item ({@link gui.Component Component} at the specified `index`. If the
		 * index is out of range of the child items, this method returns null.
		 *
		 * @method getItemAt
		 * @param {Number} index
		 * @return {gui.Component} The child item ({@link gui.Component Component}) at the specified index, or null if the index is out of range.
		 */
		getItemAt : function( index ) {
			return this.childComponents[ index ] || null;
		},
	
	
		/**
		 * Retrieves the index of the given child item ({@link gui.Component Component}). Returns -1 if the if the item
		 * is not found.
		 *
		 * @method getItemIndex
		 * @param {gui.Component} item The item to get the index of.
		 * @return {Number} The index of the item (component), or -1 if it was not found.
		 */
		getItemIndex : function( item ) {
			var childComponents = this.childComponents;
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				if( childComponents[ i ] === item ) {
					return i;
				}
			}
			return -1;  // item not found
		},
	
	
		/**
		 * Determine if this Container has a given `component` as a direct child component of this Container.
		 *
		 * @method has
		 * @param {gui.Component} component The {@link gui.Component Component} to look for as a child of this Container.
		 * @return {Boolean} True if the Component is found as a direct child of this Container, false otherwise.
		 */
		has : function( component ) {
			return this.getItemIndex( component ) !== -1;
		},
	
	
	
		// ----------------------------------------
	
	
		/**
		 * Extension of onShow method used to test if a layout request has been deferred on the Container due
		 * to the Container being hidden at the time.  If a layout request was deferred, {@link #doLayout}
		 * will be run.
		 *
		 * @protected
		 * @method onShow
		 */
		onShow : function() {
			// Call superclass onShow
			this._super( arguments );
			
			// If a layout has been deferred from a call to doLayout() while this Container was hidden,
			// we'll run the layout now.
			if( this.deferLayout ) {
				this.doLayout();
			}
	
			// Go through all child Component's, notifying them that they have been shown (if they are not hidden)
			var childComponents = this.childComponents;
			for( var i = 0, len = childComponents.length; i < len; i++ ) {
				var childComponent = childComponents[ i ];
				if( !childComponent.isHidden() ) {  // note: we don't need to query the DOM for this check, so no 'checkDom' argument to isHidden()
					childComponents[ i ].onShow();
				}
			}
		},
	
	
	
		// ----------------------------------------
	
		// Layout Methods
	
	
		/**
		 * Lays out the Container's child components ({@link #items}) using the configured {@link #layout} strategy object.
		 * If no {@link #layout} has been configured, the default {@link gui.layout.Auto} is used.
		 *
		 * Note that a layout can only be done if the Container is rendered and visible. This method will automatically
		 * be run when the Container's {@link #method-render} method runs. If the Container isn' visible when this method is called,
		 * the layout will be deferred until the {@link #method-show} method is called.
		 *
		 * @method doLayout
		 */
		doLayout : function() {
			// Run the superclass's (gui.Component's) layout functionality first
			this._super( arguments );
			
			if( !this.canLayout() ) {
				// If the Container is currently hidden, set this flag to true so that
				// when the show() method is run, a layout is triggered.
				this.deferLayout = true;
	
			} else {
				// Make sure the deferLayout flag is false, now that a layout is about to be run
				this.deferLayout = false;
				
				// Run the before layout template method
				this.onBeforeLayout();
				
				// Run the layout strategy, which will lay the child components out into this Container,
				// using the layout target returned by the getLayoutTarget() method.
				this.getLayout().doLayout();
	
				// Run the template method after layout has been executed, and fire the afterlayout event
				this.onLayout();
				this.fireEvent( 'afterlayout', this );
			}
		},

		
		/**
		 * Retrieves the element that should be the target for the Container's child components. For Container, this defaults to
		 * the element retrieved by {@link #getContentTarget}, but may be overridden to provide a different element (other than
		 * the content target) for child {@link #items}.
		 * 
		 * @protected
		 * @return {jQuery} The element (jQuery wrapped set) where the Container's child {@link #items} should be placed.
		 */
		getLayoutTarget : function() {
			return this.getContentTarget();
		},
		
		
		/**
		 * Hook method that is executed just before the {@link #layout layout's} {@link gui.layout.Layout#doLayout doLayout}
		 * method is executed to run the layout.
		 * 
		 * @protected
		 * @template
		 * @method onBeforeLayout
		 */
		onBeforeLayout : Gui.emptyFn,
		
		
		/**
		 * Hook method that is executed after {@link #doLayout} has successfully executed. Extend this method
		 * (calling the superclass method first) to implement any post-layout logic that the Container subclass
		 * should perform after its {@link #items child components} have been laid out.
		 *
		 * @protected
		 * @template
		 * @method onLayout
		 */
		onLayout : Gui.emptyFn,
		
	
		/**
		 * Determines if the Container can be laid out at this time. The Container must be rendered, and visible.
		 * It must be visible because for some layouts, especially those that use jQuery UI components or that
		 * need to calculate the size of elements, we can not lay out their child {@link gui.Component Components}
		 * when the Container's element is hidden (i.e. no css visibility/display).
		 *
		 * This method is basically used to determine if we can lay the child Components out, and if not, a layout
		 * will be deferred until the Container is shown.  All Containers/Components within a Dialog are a case for
		 * this, where their child Components are requested to be laid out before the Dialog is shown.
		 *
		 * @private
		 * @method canLayout
		 * @return {Boolean}
		 */
		canLayout : function() {
			return this.isRendered() && !this.isHidden( /* checkDom */ true );  // not hidden, we can run the layout
		},
	
	
	
		/**
		 * Retrieves the {@link gui.layout.Layout Layout} object that the Container is currently
		 * configured to use.  If no {@link #layout} is currently configured for the Container, this method
		 * creates a {@link gui.layout.Auto} to use for this Container, and returns that.
		 */
		getLayout : function() {
			if( !this.layout ) {
				this.setLayout( new AutoLayout() );
			}
			return this.layout;
		},
	
	
		/**
		 * Sets a new layout strategy object for the Container. Any previous layout will be detached from
		 * the Container (its container reference set to null).
		 *
		 * @param {String/Object/gui.layout.Layout} layout See the {@link #layout} config.
		 */
		setLayout : function( layout ) {
			// Destroy the current layout if we have a new one, and detach all Components in the Container, as 
			// a new layout is going to have to render them anyway.
			if( this.layout instanceof Layout && this.layout !== layout ) {
				var childComponents = this.childComponents;
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					childComponents[ i ].detach();
				}
				
				// Note: should destroy the layout *after* all child components have been detached, in case the layout removes 
				// elements that hold Component elements. We don't want Component elements, and all of their handlers and such, removed.
				this.layout.destroy();
			}

			this.layout = layout = LayoutManager.create( layout );
			layout.setContainer( this );
		},
	
	
	
		// ----------------------------------------
	
	
		/**
		 * Cascades down the {@link gui.Component Component}/Container heirarchy from this Container (called first), calling the specified
		 * function for each Component. The scope (`this` reference) of the function call will be the scope provided,
		 * or the current Component that is being processed.
		 *
		 * If the function returns false at any point, the cascade does not continue down that branch. However, siblings of the Container
		 * that was being processed when the function returned false are still processed.
		 *
		 * @param {Function} fn The function to call
		 * @param {Object} [scope] The scope of the function. Defaults to the {@link gui.Component Component} that is currently being
		 *   processed.
		 */
		cascade : function( fn, scope, args ) {
			if( fn.apply( scope || this, args || [this] ) !== false ) {
				var childComponents = this.childComponents;
	
				for( var i = 0, len = childComponents.length; i < len; i++ ) {
					if( childComponents[ i ].cascade ) {
						childComponents[ i ].cascade( fn, scope, args );
					} else {
						fn.apply( scope || childComponents[ i ], args || [ childComponents[ i ] ] );
					}
				}
			}
		},
	
	
		/**
		 * Finds a Component under this container at any level by {@link gui.Component#id id}.
		 *
		 * @param {String} id The ID of the Component to search for.
		 * @return {gui.Component} The component with the given `id`, or `null` if none was found.
		 */
		findById : function( id ) {
			var returnVal = null,
			    thisContainer = this;
	
			this.cascade( function( component ) {
				if( component !== thisContainer && component.getId() === id ) {
					returnVal = component;
					return false;
				}
			} );
			return returnVal;
		},
	
	
		/**
		 * Finds the {@link gui.Component Components} under this Container at any level by a custom function. If the passed function 
		 * returns true for a given Component, then that Component will be included in the results.
		 *
		 * @param {Function} fn The function to call. The function will be called with the following arguments:
		 * @param {gui.Component} fn.component The Component that is being inspected.
		 * @param {gui.Container} fn.thisContainer This Container instance.
		 * @param {Object} [scope] The scope to call the function in. Defaults to the Component being inspected.
		 * @return {gui.Component[]} Array of {@link gui.Component Components}
		 */
		findBy : function( fn, scope ) {
			var returnVal = [],
			    thisContainer = this;
	
			this.cascade( function( component ) {
				if( component !== thisContainer && fn.call( scope || component, component, thisContainer ) === true ) {
					returnVal.push( component );
				}
			} );
			return returnVal;
		},
	
	
		/**
		 * Finds the {@link gui.Component Components} under this Container at any level by Component `type`. The Component `type` can be either 
		 * the type name that is registered to the {@link gui.ComponentManager} (see the description of the {@link gui.Component} class), 
		 * or the JavaScript class (constructor function) of the {@link gui.Component Component}.
		 *
		 * @param {Function} type The type name registered with the {@link gui.ComponentManager}, or the constructor function (class) of the Component.
		 * @return {gui.Component[]} Array of {@link gui.Component Components} which match the `type`.
		 */
		findByType : function( type ) {
			if( typeof type === 'string' ) {
				type = ComponentManager.getType( type );
				
				// No type found for the given type name, return empty array immediately
				if( !type ) {
					return [];
				}
			}
			
			return this.findBy( function( cmp ) { 
				if( Class.isInstanceOf( cmp, type ) ) {
					return true; 
				}
			} );
		},
	
	
		// ----------------------------------------
	
	
		/**
		 * Destroys each child Component in the Container. Called when the Component's destroy() method is called.
		 *
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : function() {
			// Remove all child components (which will destroy them if destroyRemoved is true. Otherwise,
			// it will detach them, which makes it safe to destroy the layout).
			this.removeAll();
	
			// Destroy the Container's layout, if it has one
			if( this.layout instanceof Layout ) {  // just in case it's still the string config
				this.layout.destroy();
			}
			
			this._super( arguments );
		}
	
	} );
	
	
	ComponentManager.registerType( 'container', Container );
	
	
	return Container;
} );