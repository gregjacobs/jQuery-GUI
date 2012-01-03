/**
 * @class ui.Component
 * @extends Kevlar.util.Observable
 * 
 * <p>Generalized component that defines a displayable item that can be placed onto a page. Provides a base element (by default, a div),
 * and a framework for the instantiation, rendering, and (eventually) the destruction process, with events that can be listened to
 * each step of the way.</p>
 * 
 * <p>Components can be constructed via anonymous config objects, based on their `type` property. This is useful for defining components in a
 * manifest. This is the list of all pre-defined Component types that may be instantiated in this manner. Note that type names are case-insensitive.
 * <pre>
type                  Class
-------------         ------------------
component             {@link ui.Component}
container             {@link ui.Container}
button                {@link ui.Button}
buttonset             {@link ui.ButtonSet}
colorpicker           {@link ui.ColorPicker}
label | introduction  {@link ui.Label}
fieldset              {@link ui.FieldSet}
slider                {@link ui.Slider}

Containers
---------------------------------------
accordion             {@link ui.containers.AccordionContainer}
cards                 {@link ui.containers.CardsContainer}
columns               {@link ui.containers.ColumnsContainer}
section               {@link ui.containers.SectionContainer}
tabs                  {@link ui.containers.TabsContainer}

Form Field Components
---------------------------------------
checkbox | boolean    {@link ui.formFields.CheckboxField}
date                  {@link ui.formFields.DateField}
dropdown              {@link ui.formFields.DropdownField}
hidden                {@link ui.formFields.HiddenField}
link | linktextfield  {@link ui.formFields.LinkTextField}
radio                 {@link ui.formFields.RadioField}
textarea              {@link ui.formFields.TextAreaField}
text | string         {@link ui.formFields.TextField}

Tool Buttons
---------------------------------------
toolbutton            {@link ui.toolButtons.ToolButton}
closebutton           {@link ui.toolButtons.CloseButton}
editbutton            {@link ui.toolButtons.EditButton}
upbutton              {@link ui.toolButtons.UpButton}
downbutton            {@link ui.toolButtons.DownButton}
hidebutton            {@link ui.toolButtons.HideButton}
deletebutton          {@link ui.toolButtons.DeleteButton}
</pre>
 * </p>
 * 
 * <p>Some other things to note about Component and its subclasses are:
 * <div class="mdetail-params">
 *   <ul>
 *     <li>
 *       Any configuration options that are provided to its constructor are automatically applied (copied) onto the new Component object. This
 *       makes them available as properties, and allows them to be referenced in subclasses as `this.configName`.  However, unless the
 *       configuration options are also listed as public properties, they should not be used externally.
 *     </li>
 *     <li>
 *       Components directly support masking and un-masking their viewable area.  See the {@link #maskConfig} configuration option, and the {@link #mask} and
 *       {@link #unMask} methods.
 *     </li>
 *     <li>
 *       When a Component is {@link #destroy} destroyed, a number of automatic cleanup mechanisms are executed. See {@link #destroy} for details. 
 *     </li>
 *   </ul>
 * </div></p>
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global jQuery, Kevlar, ui */
ui.Component = Kevlar.extend( Kevlar.util.Observable, { 
	
	/**
	 * @cfg {String} id 
	 * The id that identifies this Component. Defaults to a unique id, 
	 * and may be retrieved by {@link #getId}.
	 */
	 
	/**
	 * @cfg {String} elId
	 * The id that should be used for the Component's element. Defaults to a unique id.
	 */
	
	/**
	 * @cfg {String} elType
	 * The element type that should be created as the Component's HTML element. For example, the string
	 * 'div' will create a &lt;div&gt; element for the Component. Any HTML element type can be used,
	 * and subclasses may override the default for a different implementation.
	 */
	elType : 'div',
	 
	/**
	 * @cfg {jQuery/HTMLElement} renderTo The HTML element to render this component to. If specified, 
	 * the component will be rendered immediately upon creation.
	 */
	
	/**
	 * @cfg {Boolean} hidden True to initially render the Component hidden.
	 */
	hidden : false,
	
	/**
	 * @cfg {Object} attr
	 * Any additional html attributes to apply to the outer div element. Should be an object where the keys are the attribute names, and the values are the attribute values.
	 */
	
	/**
	 * @cfg {String} cls
	 * Any additional CSS class(es) to add to this component's element. If multiple, they should be separated by a space. 
	 * Useful for styling Components and their inner elements (if any) based on regular CSS rules.
	 * (Note that this is named 'cls' instead of 'class', as 'class' is a JavaScript reserved word.)
	 */
	cls: '',
	
	/**
	 * @cfg {Object} style
	 * Any additional styles to apply to the outer div element. Should be an object where the keys are the css property names, and the values are the css values.
	 */
	
	
	/**
	 * @cfg {String} html
	 * Any explicit HTML to attach to the Component at render time.<br><br>
	 * 
	 * Note that this config, in the end, has the same effect as the {@link #contentEl} config, but is more clear 
	 * from the client code's side for adding explict HTML to the Component.
	 */
	
	/**
	 * @cfg {HTMLElement/jQuery} contentEl
	 * An existing element or jQuery wrapped set to place into the Component when it is rendered, which will become
	 * the "content" of the Component.  The element will be moved from its current location in the DOM to inside this
	 * Component's element.<br><br>
	 * 
	 * Note that this config, in the end, has the same effect as the {@link #html} config, but is more clear from the
	 * client code's side for adding DOM elements to the Component.
	 */
	
	
	/**
	 * @cfg {Number/String} height
	 * A height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} width
	 * A width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} minHeight
	 * A minimum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} minWidth
	 * A minimum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} maxHeight
	 * A maximum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	/**
	 * @cfg {Number/String} maxWidth
	 * A maximum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
	 */
	
	
	/**
	 * @cfg {Object} maskConfig A configuration object for the default mask that will be shown when the {@link #mask} method is called (if {@link #mask mask's}
	 * argument is omitted), or if the {@link #masked} configuration option is true (in which a mask will be shown over the Component, using this maskConfig, 
	 * when it is first rendered).  This default maskConfig can be overrided when calling {@link #mask} by passing a configuration object for its argument.<br><br>
	 * 
	 * Masks are shown and hidden using the {@link #mask} and {@link #unMask} methods. If this configuration option is not provided, the configuration
	 * options default to the default values of the configuration options for {@link ui.Mask}.
	 */
	
	/**
	 * @cfg {Boolean} masked True to instantiate the Component with its mask shown (the {@link #mask} method is automatically run when the Component
	 * is rendered).
	 */
	masked : false,
	
	
	/**
	 * @cfg {ui.plugins.AbstractPlugin/ui.plugins.AbstractPlugin[]} plugins
	 * A single plugin or array of plugins to attach to the Component. Plugins must extend the class {@link ui.plugins.AbstractPlugin}.
	 * See {@link ui.plugins.AbstractPlugin} for details on creating plugins.<br><br>
	 * 
	 * Note that Component will normalize this config into an array, converting a single plugin into a one-element array, or creating
	 * an empty array if no plugins were provided.  This is done so that subclasses may add plugins by pushing them directly
	 * onto the plugins array in their implementation of {@link #initComponent}. 
	 */
	
	
	
	/**
	 * @private
	 * @cfg {ui.Container} parentContainer
	 * The parent {@link ui.Container Container} of this Component (if any). This is set by the {@link ui.Container} that is adding this Component
	 * as a child, and should not be supplied directly.
	 */
	parentContainer: null,
	
	/**
	 * @private
	 * @property initialConfig
	 * Stores the initial configuration options provided to this component. This is currently used by ui.bits.BitWrapper
	 * to pass the initial configuration of the Component into the EditUIBitInstance that it is creating, and may be used
	 * for other purposes in the future as well.
	 * @type Object
	 */
 
	/**
	 * @property {Boolean} rendered (readonly)
	 * 
	 * Property that can be used to determine if the Component has been rendered.  
	 * Will be set to true after the render method has been executed.
	 */
	rendered: false,
	
	/**
	 * @private
	 * @property {Boolean} hidden (readonly)
	 * 
	 * Property that stores the 'hidden' state of the Component. Note that the component may be 
	 * considered "hidden" by its element's visibility (i.e. it will be considered hidden if its parent
	 * element is hidden), in which case the {@link #isHidden} method will return true. But this property
	 * stores the state of if the Component is supposed to be still hidden when its parent element is shown.
	 */
	
	/**
	 * @protected
	 * @property {Boolean} masked
	 * 
	 * Flag to store the current state of if the Component is masked or not. This is also a config option.
	 */
	
	/**
	 * @private
	 * @property {Boolean} deferMaskShow
	 * 
	 * Flag that is set to true if the {@link #mask} method is run, but the Component is currently hidden.
	 * The Component must be in a visible state to show the mask, as the ui.Mask class makes a calculation of 
	 * the height of the mask target element.  When the Component's {@link #show} method runs, this flag will be
	 * tested to see if it is true, and if so, will run the {@link #mask} method at that time.
	 */
	deferMaskShow : false,
	
	/**
	 * @private
	 * @property {ui.Mask} _mask
	 * 
	 * The ui.Mask instance that the Component is currently using to mask over the Component. This will be null
	 * if no ui.Mask has been created (i.e. the {@link #mask} method has never been called). 
	 */
	
	/**
	 * @private
	 * @property deferredMaskConfig
	 * @type Object
	 * If the masking of the Component needs to be deferred (either because the Component is not yet rendered, or because
	 * the Component is currently hidden), then the configuration options to show the mask with are stored in this property,
	 * for when the mask does in fact get shown.
	 */
	
	
	/**
	 * @property destroyed (readonly)
	 * Initially false, and will be set to true after the {@link #destroy} method executes.
	 * @type Boolean
	 */
	destroyed: false,
	
	/**
	 * @private
	 * @property $el
	 * The main element that is created for the Component (determined by the {@link #elType} config). 
	 * This will be available after the Component is rendered, and may be retrieved using {@link #getEl}
	 * @type jQuery
	 */	
	
	
	constructor : function( config ) {
		// Apply the properties of the configuration object onto this object, and the initialConfig object
		Kevlar.apply( this, config );
		this.initialConfig = Kevlar.apply( {}, config );
		
		
		// Call superclass (observable) constructor. Must be done after config has been applied.
		ui.Component.superclass.constructor.call( this );
		
        
		// Add events that this class will fire
		this.addEvents( 
			/**
			 * @event render
			 * Fires when this component has been rendered.
			 * @param {ui.Component} component This component.
			 */
			'render',
			
			/**
			 * @event show
			 * Fires when the component has been shown, using the {@link #show} method. Only fires
			 * if the Component has been rendered.
			 * @param {ui.Component} component This component.
			 */
			'show',
			
			/**
			 * @event hide
			 * Fires when the component has been hidden, using the {@link #hide} method. Only fires
			 * if the Component has been rendered.
			 * @param {ui.Component} component This component.
			 */
			'hide',
					
			/**
			 * @event beforedestroy
			 * Fires just before this component is destroyed. A handler of this event may return false to cancel 
			 * the destruction process for the Component.
			 * @param {ui.Component} component This component. 
			 */
			'beforedestroy',
			
			/**
			 * @event destroy
			 * Fires when this component has been destroyed.
			 * @param {ui.Component} component This component.
			 */
			'destroy'
		);
		
		
		// Workaround: manifests can specify an onRender function, which would shadow the prototype onRender function. Executing
		// it in a listener and removing the property to prevent this from happening.
		if( this.hasOwnProperty( 'onRender' ) ) {
			var providedOnRender = this.onRender;
			this.addListener( {
				'render' : function( component ) {
					// Call the provided onRender function in the scope of this object
					providedOnRender.call( this, component );
				},
				scope: this
			} );
			delete this.onRender;  // delete the provided (ownProperty) onRender to un-shadow the prototype's onRender.
		}
		
		
		// Generate a unique ID for this component, and a unique element ID for the component's div element, if not provided.
		this.id = this.id || 'ui-cmp-' + Kevlar.newId();
		this.elId = this.elId || 'ui-cmp-' + Kevlar.newId();
		
		// Normalize the 'plugins' config into an array before calling initComponent, so that subclasses may just push any
		// plugins that they wish directly onto the array without extra processing.
		this.plugins = this.plugins || [];
		if( Kevlar.isObject( this.plugins ) ) {
			this.plugins = [ this.plugins ];
		}
        
		
		// Call template method for the initialization of subclasses of this Component
		this.initComponent();
		
		
		// Initialize any plugins provided to the Component
		if( this.plugins.length > 0 ) {
			this.initPlugins( this.plugins );
		}
		
		// Render the component immediately if a 'renderTo' element is specified
		if( this.renderTo ) {
			this.render( this.renderTo );
			delete this.renderTo;   // no longer needed
		}
	},
	
	
	/**
	 * Template method for initialization. This method should replace constructor for subclasses
	 * of Component.
	 * 
	 * @protected
	 * @method initComponent
	 */
	initComponent : function() {
		// Template Method
	},
	
	
	/**
	 * Initializes the plugins for the Component.
	 * 
	 * @private
	 * @method initPlugins
	 * @param {ui.plugins.AbstractPlugin/ui.plugins.AbstractPlugin[]} plugin A single plugin, or array of plugins to initialize.
	 */
	initPlugins : function( plugin ) {
		if( Kevlar.isArray( plugin ) ) {
			for( var i = 0, len = plugin.length; i < len; i++ ) {
				this.initPlugins( plugin[ i ] ); 
			}
			return;  // array has been processed, return
		}
		
		if( !( plugin instanceof ui.plugins.AbstractPlugin ) ) {
			throw new Error( "error: a plugin provided to this Component was not of type ui.plugins.AbstractPlugin" );
		}
		
		// Initialize the plugin, passing a reference to this Component into it.
		plugin.initPlugin( this );
	},
	
	
	/**
	 * Renders the component into a containing HTML element.  Starts by creating the base div element for this component, and then 
	 * calls the template method {@link #onRender} to allow subclasses to add their own functionality/elements into the rendering process.
	 *
	 * @method render
	 * @param {HTMLElement/jQuery} containerEl The HTML element to render this component into.
	 */
	render : function( containerEl ) {
		var $containerEl = jQuery( containerEl );
		
		if( this.rendered ) {
			// Component is already rendered, just append it to the supplied container element
			this.$el.appendTo( $containerEl );
			
		} else {
			// First, handle any additional attributes (the 'attr' config) that were specified to add
			var additionalAttributes = [], 
			    attr = this.attr;
			if( attr ) {
				for( var attribute in attr ) {
					if( attr.hasOwnProperty( attribute ) ) {
						additionalAttributes.push( attribute + '="' + attr[ attribute ] + '"' );
					}
				}
			}
			
			// Create a CSS string of any specified styles (the 'style' config)
			var styles = "";
			if( this.style ) {
				styles = Kevlar.CSS.hashToString( this.style );
			}
			
			// Create the main (outermost) element for the Component. By default, creates a div element, such as:
			// <div id="someID" />
			this.$el = jQuery( '<' + this.elType + ' id="' + this.elId + '" class="' + this.cls + '" style="' + styles + '" ' + additionalAttributes.join( " " ) + ' />' );
			
			
			// Appending the element to the container before the call to onRender. It is necessary to do things in this order (and not rendering children and then appending)
			// for things like the jQuery UI tabs, which requires that their wrapping elements be attached to the DOM when they are instantiated.
			// Otherwise, those items require their instantiation to be placed into a setTimeout(), which causes a flicker on the screen (especially for the jQuery UI tabs). 
			$containerEl.append( this.$el );
			
			// Setting the render flag before the call to onRender so that onRender implementations can call methods that check this flag (such as setters
			// that handle the case of the Component not yet being rendered).
			this.rendered = true;
			
			// Call onRender template method for subclasses to add their own elements, and whatever else they need 
			this.onRender( $containerEl );
			
			
			
			
			// Attach any specified HTML or content element to the Component's content target. The content target is by default,
			// the Component's element, but may be overridden by subclasses that generate a more complex HTML structure.
			var $contentTarget = this.getContentTarget(); 
			if( this.html ) {
				$contentTarget.append( this.html );
			}
			if( this.contentEl ) {
				$contentTarget.append( this.contentEl );
			}
			
			// Apply any custom sizing
			if( typeof this.height !== 'undefined' ) { this.$el.height( this.height ); }
			if( typeof this.width !== 'undefined' ) { this.$el.width( this.width ); }
			if( typeof this.minHeight !== 'undefined' ) { this.$el.css( { minHeight: this.minHeight } ); }
			if( typeof this.minWidth !== 'undefined' ) { this.$el.css( { minWidth: this.minWidth } ); }
			if( typeof this.maxHeight !== 'undefined' ) { this.$el.css( { maxHeight: this.maxHeight } ); }
			if( typeof this.maxWidth !== 'undefined' ) { this.$el.css( { maxWidth: this.maxWidth } ); }
			
			
			// If the Component was configured with hidden = true, hide it now. This must be done after onRender,
			// because some onRender methods change the 'display' style of the outer element.
			if( this.hidden ) {
				this.$el.hide();
			}
			
			// If the Component was configured with masked = true, show the mask now.
			if( this.masked ) {
				this.mask( this.deferredMaskConfig );  // deferredMaskConfig will be defined if a call to mask() has been made before the Component has been rendered. Otherwise, it will be undefined.
			}
			
			// Call the afterRender template method
			this.afterRender( $containerEl );
			
			// Finally, fire the render event
			this.fireEvent( 'render', this );
		}
	},
	
	
	/**
	 * Template method that runs when a Component is being rendered, after the Component's base element has been created and appended
	 * to its parent element.
	 * 
	 * @protected
	 * @method onRender
	 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component is being rendered into.
	 */
	onRender : function( $containerEl ) { 
		// Template method
	},
	
	
	/**
	 * Template method that runs when a Component has been completely rendered (i.e. the base element has been created,
	 * the {@link #onRender} template method has run, the content/html has been appended, the sizing configs have been set,
	 * and the element has had its initial {@link #hidden} state set).
	 * 
	 * @protected
	 * @method afterRender
	 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component has been rendered into.
	 */
	afterRender : function( $containerEl ) { 
		// Template method
	},
	
	
	/**
	 * Updates the HTML of the component directly. Will handle the unrendered an rendered states of the Component.
	 *
	 * @method update
	 * @param {String/HTMLElement/jQuery} content The HTML content as a string, an HTML element, or a jQuery wrapped set of 
	 *   elements to update the component with.
	 */
	update : function( content ) {
		if( !this.rendered ) {
			// Remove this config, just in case it was specified. Setting the 'html' config (next) has the same effect as 'contentEl'.
			delete this.contentEl;
			
			// Set the 'html' config, for when the Component is rendered.
			this.html = content;
			
		} else {
			this.getContentTarget().empty().append( content );
		}
	},
	
	
	// ----------------------------
	
	
	/**
	 * Retrieves the element that should be the target for the Component's content (html).  For ui.Component, this is just the Component's
	 * base element (see {@link #$el}), but this method can be overridden in subclasses that define a more complex structure, where their
	 * content should be placed elsewhere. 
	 * 
	 * @method getContentTarget
	 * @return {jQuery} The element (jQuery wrapped set) where HTML content should be placed. The {@link #html} and {@link #contentEl} 
	 *   configs will be attached to this element.
	 */
	getContentTarget : function() {
		return this.getEl();
	},
	
	
	/**
	 * Returns the id this component.  See {@link #id}.
	 * 
	 * @method getId
	 * @return {String}
	 */
	getId : function() {
		return this.id;
	},
		
	
	/**
	 * Returns the container element for this component, wrapped in a jQuery object.  This element will only
	 * be available after the component has been rendered by {@link #render}.  The element that will be returned
	 * will be the one created for the Component in the {@link #render} method, and its type is dependent on the
	 * {@link #elType} config.
	 * 
	 * @method getEl
	 * @return {jQuery}
	 */
	getEl : function() {
		return this.$el;
	},
	
	
	/**
	 * Returns a <i>copy</i> of the original configuration options provided to this Component. This copy is only
	 * a shallow copy however, and object references will be maintained.
	 * 
	 * @method getInitialConfig
	 * @return {Object}
	 */
	getInitialConfig : function() {
		return this.initialConfig;
	},
	
	
	// ------------------------------------
	
	
	/**
	 * Shows the Component. 
	 *
	 * @method show
	 * @param {Object} [animConfig] A {@link ui.anim.Animation} config object (minus the {@link ui.anim.Animation#target target) property) 
	 *   for animating the showing of the Component. Note that this will only be run if the Component is currently {@link #rendered}.
	 */
	show : function( animConfig ) {
		this.hidden = false;  // set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested for in the render() method.
		
		if( this.rendered ) {
			// If a show animation was specified, run that now. Otherwise, simply show the element
			if( typeof animConfig === 'object' ) {
				animConfig.target = this;
				
				this.currentAnimation = new ui.anim.Animation( animConfig );    
				//this.currentAnimation.addListener( 'afteranimate', this.showComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.$el.show();
			}
			
			// Call template method, and fire the event
			this.onShow();
			this.fireEvent( 'show', this );
		}
	},
	
	
	/**
	 * Hook method for handling the component being shown. This will only be called when the 
	 * Component is shown after it is rendered. Note that this method is called immediately after
	 * any animation is started by providing the `animConfig` argument to {@link #show}.
	 * 
	 * @protected
	 * @method onShow
	 */
	onShow : function() {
		// If a mask show request has been made while the Component was hidden, show the mask now, with the configuration requested when the call to mask() was made (if any).
		if( this.deferMaskShow ) {
			this.mask( this.deferredMaskConfig );
		}
	},
	
	
	/**
	 * Hides the Component.
	 *
	 * @method hide
	 * @param {Object} [animConfig] A {@link ui.anim.Animation} config object (minus the {@link ui.anim.Animation#target target) property) 
	 *   for animating the hiding of the Component. Note that this will only be run if the Component is currently {@link #rendered}.
	 */
	hide : function( animConfig ) {
		this.hidden = true;  // set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested for in the render() method, and the Component will be hidden.
		
		if( this.rendered ) {
			// If a show animation was specified, run that now. Otherwise, simply show the element
			if( typeof animConfig === 'object' ) {
				animConfig.target = this;
				
				this.currentAnimation = new ui.anim.Animation( animConfig );    
				//this.currentAnimation.addListener( 'afteranimate', this.hideComplete, this );  // adding a listener instead of providing in config, in case there is already a listener in the config
				this.currentAnimation.start();
			} else {
				this.$el.hide();
			}
			
			this.onHide();
			this.fireEvent( 'hide', this );
		}
	},
	
	
	/**
	 * Hook method for handling the component being hidden. This will only be called when the 
	 * Component is hidden after it is rendered. Note that this method is called immediately after
	 * any animation is started by providing the `animConfig` argument to {@link #hide}.
	 * 
	 * @protected
	 * @method onHide
	 */
	onHide : Kevlar.emptyFn,
	
	
	/**
	 * Tests to see if the Component is hidden. Note that this method tests for the Component's element visibility
	 * (after it has been rendered), and will return true if 1) the element itself is set as "display: none", 2) a parent 
	 * element of the Component is set to "display: none", or 3) the element is not attached to the document.  To determine 
	 * if the Component's element itself is set as hidden, regardless of the visibility of parent elements or being attached
	 * to the document, check the {@link #hidden} property.
	 * 
	 * @method isHidden
	 * @return {Boolean}
	 */
	isHidden : function() {
		if( !this.rendered ) {
			return this.hidden;  // not yet rendered, return the current state of the 'hidden' config
			
		} else {
			// NOTE: Cannot simply use the jQuery :hidden selector. jQuery determines if an element is hidden by if it
			// has any computed height or width > 0. The Component's element can be shown, but if it's not taking up 
			// any space because it has no content, it would still be considered hidden by jQuery. We instead want to see
			// if the Component, or any of its ancestor elements are hidden via "display: none", to determine if it's hidden.
			// The Component must also be attached to the document to be considered "shown".
			//return this.$el.is( ':hidden' );  -- intentionally left here as a reminder not to use
			
			// Find out if the component itself, or any of its ancestor elements has "display: none".
			if( this.$el.css( 'display' ) === 'none' ) {    // slight optimization by testing the Component's element itself first, before grabbing parent elements to test
				return true;
				
			} else {
				var $parents = this.$el.parents(),
				    numParents = $parents.length;
				
				
				// If the element is not attached to the document (it has no parents, or the top level ancestor is not the <html> tag), then it must be hidden
				if( numParents === 0 || $parents[ numParents - 1 ].tagName.toLowerCase() !== 'html' ) {
					return true;
				}

				// Element is attached to the DOM, check all parents for one that is not displayed
				for( var i = 0, len = $parents.length; i < len; i++ ) {
					if( jQuery( $parents[ i ] ).css( 'display' ) === 'none' ) {
						return true;
					}
				}
			}
			
			// Passed checks, element must not be hidden
			return false;
		}
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Masks the component with a {@link ui.Mask}. Uses the default mask configuration provided by the {@link #maskConfig} configuration object,
	 * or optionally, the provided `maskConfig` argument.
	 * 
	 * @method mask
	 * @param {Object} maskConfig (optional) The explicit configuration options to set the {@link ui.Mask} that will mask over the Component.
	 *   If not provided, will use the default options provided by the {@link #maskConfig} configuration option.
	 */
	mask : function( maskConfig ) {
		maskConfig = maskConfig || this.maskConfig;  // use the provided argument if it exists, or the defaults provided by the config option otherwise
		
		// Set the flag for the isMasked method. Also, if the Component is not rendered, this is updated so that the mask will show on render time.
		this.masked = true;   
		
		if( !this.rendered ) {
			this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is rendered
			
		} else {
			// If the Component is currently hidden when the mask() request is made, we need to defer
			// it to when the Component's show() method is run. This is because ui.Mask has to make a calculation
			// of the mask target's height. 
			if( this.isHidden() ) {
				this.deferMaskShow = true;
				this.deferredMaskConfig = maskConfig;  // set the maskConfig to use when the Component is shown
				
			} else {
				// Component is rendered and is shown (i.e. not hidden), then we can show the mask
				
				// If there is not yet a mask instance for this Component, create one now.
				// Otherwise, just update its config.
				if( !this._mask ) {
					this._mask = new ui.Mask( this.getMaskTarget(), maskConfig );
				} else {
					this._mask.updateConfig( maskConfig );
				}
				this._mask.show();
				
				// mask has been shown, make sure deferMaskShow flag is set back to false
				this.deferMaskShow = false;
				delete this.deferredMaskConfig;  // in case this exists from a previous deferred mask, remove it now
			}
		}
	},
	
	
	/**
	 * Hides the mask (shown with the {@link #mask} method) from the Component's element.
	 * 
	 * @method unMask
	 */
	unMask : function() {
		this.masked = false;
		
		// in case there was a show request while hidden: set deferMaskShow back to false, and remove the deferredMaskConfig (as we're now hiding the mask)
		this.deferMaskShow = false;  
		delete this.deferredMaskConfig;
		
		if( this.rendered && this._mask ) {
			this._mask.hide();
		}
	},
	
	
	/**
	 * Determines if the Component is currently masked.  See the {@link #mask} method for details on showing the Component's mask.
	 * 
	 * @method isMasked
	 * @return {Boolean}
	 */
	isMasked : function() {
		return this.masked;
	},
	
	
	/**
	 * Method that defines which element the Component's mask should be shown over. For ui.Component,
	 * this is the Component's base {@link #$el element}, but this may be redefined by subclasses.
	 * 
	 * @protected
	 * @method getMaskTarget
	 * @return {jQuery}
	 */
	getMaskTarget : function() {
		return this.getEl();
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Sets the Container that owns (i.e. is a parent of) this Component.
	 * 
	 * @method setParentContainer
	 * @param {ui.Container} container
	 */
	setParentContainer : function( container ) {
		this.parentContainer = container;
	},
	
	
	/**
	 * Gets the Container that owns (i.e. is a parent of) this Component.
	 * 
	 * @method getParentContainer
	 * @return {ui.Container} The Container that owns this Component, or null if there is none.
	 */
	getParentContainer : function() {
		return this.parentContainer;
	},
	
	
	// -------------------------------------
	
	
	/**
	 * Bubbles up the Component/Container heirarchy, calling the specified function with each parent Container, starting
	 * with this Component. The scope (this) of function call will be the scope provided or the current Component. The arguments 
	 * to the function will be the `args` provided or the current component. If the function returns false at any point,
	 * the bubble is stopped.
	 * 
	 * @method bubble
	 * @param {Function} fn The function to call.
	 * @param {Object} scope (optional) The scope of the function (defaults to current node)
	 * @param {Array} args (optional) The args to call the function with (default to passing the current component)
	 */
	bubble : function( fn, scope, args ) {
		var p = this;
		while( p ) {
			if( fn.apply( scope || p, args || [p] ) === false) {
				break;
			}
			p = p.parentContainer;
		}
	},
	
	
	/**
	 * Finds a {@link ui.Container Container} above this Component at any level by a custom function. If the passed function returns
	 * true, the {@link ui.Container Container} will be returned.
	 * 
	 * @method findParentBy
	 * @param {Function} fn The custom function to call with the arguments (Container, this Component).
	 * @return {ui.Container} The first Container for which the custom function returns true.
	 */
	findParentBy : function( fn ) {
		for( var p = this.parentContainer; (p !== null) && !fn( p, this ); p = p.parentContainer ) { /* Empty */ }
		return p || null;
	},
	
	
	/**
	 * Finds a {@link ui.Container Container} above this Component at any level by {@link #id}.  If there is no parent Container
	 * with the supplied `id`, this method returns null.
	 * 
	 * @method findParentById
	 * @param {String} id The {@link #id} of the parent Container to look for.
	 * @return {ui.Container} The first Container which matches the supplied {@link #id}.
	 *   If no Container for the supplied {@link #id} is found, this method returns null.
	 */
	findParentById : function( id ) {
		for( var p = this.parentContainer; p && p.id !== id; p = p.parentContainer ) { /* Empty */ }
		return p || null;
	},
	
	
	/**
	 * Finds the closest {@link ui.Container Container} above this Component by Container `type`.  The Container `type` can be either
	 * the type name that is registered to the {@link ui.ComponentManager ComponentManager} (see the description of this class), or the JavaScript
	 * class (constructor function) of the Container.
	 * 
	 * @method findParentByType
	 * @param {Function} type The type name registered with the {@link ui.ComponentManager ComponentManager}, or the constructor function (class) of the Container.
	 * @return {ui.Container} The first Container which is an instance of the supplied type. 
	 */
	findParentByType : function( type ) {
		if( typeof type === 'string' ) {
			type = ui.ComponentManager.getType( type );
			
			// No type found for the given type name, return null immediately
			if( !type ) {
				return null;
			}
		}
		
		// Find the parent by type (js class / constructor function)
		for( var p = this.parentContainer; p && !(p instanceof type); p = p.parentContainer ) { /* Empty */ }
		return p || null;
	},
	
	
	/**
	 * Override of Kevlar.util.Observable's {@link Kevlar.util.Observable#getBubbleTarget getBubbleTarget} method, which specifies
	 * that the Component's {@link #parentContainer} is the bubble target for events.
	 * 
	 * @method getBubbleTarget
	 * @return {Kevlar.util.Observable} The Component's parent {@link ui.Container} if it is part of a Container hierarchy, or null if it is not.
	 */
	getBubbleTarget : function() {
		return this.parentContainer;
	},
	
	
	/**
	 * Destroys the Component. Frees (i.e. deletes) all references that the Component held to HTMLElements or jQuery wrapped sets
	 * (so as to prevent memory leaks) and removes them from the DOM, removes the Component's {@link #mask} if it has one, purges 
	 * all event {@link #listeners} from the object, and removes the Component's element ({@link #$el}) from the DOM, if the Component 
	 * is rendered.<br><br>
	 *
	 * Fires the {@link #beforedestroy} event, which a handler can return false from to cancel the destruction process,
	 * and the {@link #destroy} event.
	 * 
	 * @method destroy
	 */
	destroy : function() {
		if( !this.destroyed ) {
			if( this.fireEvent( 'beforedestroy', this ) !== false ) {
				// Run template method for subclasses first, to allow them to handle their processing
				// before the Component's element is removed
				this.onDestroy();
				
				// Destroy the mask, if it is an instantiated ui.Mask object (it may not be if the mask was never used)
				if( this._mask instanceof ui.Mask ) {
					this._mask.destroy();
				}
				
				// Remove any HTMLElement or jQuery wrapped sets used by the Component from the DOM, and free 
				// the references so that we prevent memory leaks.
				// Note: This includes the Component's $el reference (if it has been created by the Component being rendered).
				for( var prop in this ) {
					if( this.hasOwnProperty( prop ) ) {
						var propValue = this[ prop ];
						
						if( Kevlar.isElement( propValue ) ) {
							// First, wrap the raw HTMLElement in a jQuery object, for easy removal. Then delete the reference.
							jQuery( propValue ).remove();
							delete this[ prop ];
						} else if( Kevlar.isJQuery( propValue ) ) {
							propValue.remove();
							delete this[ prop ];
						}
					}
				}
				
				this.rendered = false;  // the Component is no longer rendered; it's $el has been removed (above)
				this.destroyed = true;
				this.fireEvent( 'destroy', this );
				this.purgeListeners();  // Note: Purge listeners must be called after 'destroy' event fires!
			}
		}
	},
	
	
	/**
	 * Template method for subclasses to extend that is called during the Component's destruction process.
	 * 
	 * @protected
	 * @method onDestroy
	 */
	onDestroy : function() {
		// Template Method
	}
	
} );


// Register the type so it can be created by the string 'Component' in the manifest
ui.ComponentManager.registerType( 'Component', ui.Component );
