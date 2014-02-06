/*global define */
define( [
	'require',
	'jquery',
	'lodash',
	'Class',
	'gui/Gui',
	'Observable',
	'gui/util/Css',
	'gui/util/Html',
	'gui/Mask',
	'gui/anim/Animation',
	'gui/plugin/Plugin',
	'gui/template/Template',
	'gui/template/LoDash',
	'gui/ComponentManager'   // circular dependency. used via require() call in code below
], function( require, jQuery, _, Class, Gui, Observable, Css, Html, Mask, Animation, Plugin, Template, LoDashTpl ) {

	/**
	 * @class gui.Component
	 * @extends Observable
	 * @alias type.component
	 * 
	 * Generalized component that defines a displayable item that can be placed onto a page. This class is the base class of all components in
	 * the library.
	 * 
	 * The Component class provides a base HTML element (by default, a &lt;div&gt;), and a framework for the instantiation, rendering, and (eventually) 
	 * destruction of the component, with events that can be listened to each step of the way.
	 * 
	 * 
	 * ## Lazy Instantiation
	 * 
	 * Components can be constructed via anonymous config objects, based on their `type` property. This is useful for defining components in
	 * an anonymous object, when added as items of a {@link gui.Container}. For example:
	 * 
	 *     @example
	 *     require( [
	 *         'gui/Container',
	 *         'gui/Component'
	 *     ], function( Container ) {
	 *     
	 *         var container = new Container( {
	 *             renderTo : 'body',
	 *             
	 *             items : [
	 *                 { type: 'component', html: "Component1" },
	 *                 { type: 'component', html: "Component2" }
	 *             ]
	 *         } );
	 *     
	 *     } );
	 * 
	 * Other components from the library may be added as well. See each component's "type" property in the docs.
	 * 
	 * 
	 * ## Unrendered vs. Rendered State
	 * 
	 * When a Component is first instantiated, it is "unrendered." This means that no HTML elements have been created for it yet. Only when
	 * the {@link #method-render} method is executed will any HTML elements be generated.
	 * 
	 * For example:
	 * 
	 *     // Instantiate a new component
	 *     var component = new Component( { id: 'myComponent', html: '<span class="test-component">Test Component</span>' } );  // this HTML is *not* yet rendered to the page
	 *     
	 *     // Now render the component to the document body
	 *     component.render( 'body' );  // the HTML is generated, and appended to the document body
	 * 
	 * The component's {@link #$el element} will not exist until the component has been rendered.
	 * 
	 * This is an important distinction for when building components, in that methods that operate on a Component's DOM should properly handle 
	 * both an unrendered and rendered state. For example, assume one is building a simple TextField component:
	 * 
	 *     require( [
	 *         'gui/Component'
	 *     ], function( Component ) {
	 *     
	 *         // TextField class
	 *         var TextField = Component.extend( {
	 *             value : "",  // a configuration option
	 *         
	 *             renderTpl : '<input type="text" value="<%= component.value %>">',
	 *             
	 *             onRender : function() {
	 *                 this._super( arguments );
	 *                 
	 *                 this.$inputEl = this.$el.find( 'input' );  // store a reference to the input field when rendered
	 *             },
	 *             
	 *             // This method must check the rendered/unrendered state, in case it is called 
	 *             // before the Component is actually rendered anywhere
	 *             setValue : function( newValue ) {
	 *                 if( !this.isRendered() ) {
	 *                     this.value = newValue;          // Component not yet rendered, store the value for when it is
	 *                 } else {
	 *                     this.$inputEl.val( newValue );  // Component already rendered, update the HTML element directly
	 *                 }
	 *             }
	 *         } );
	 *         
	 *         
	 *         // Usage
	 *         var textField = new TextField( { value: "value1" } );
	 *         textField.setValue( "value2" );
	 *         
	 *         textField.render( 'body' );       // the TextField will render with the value "value2"
	 *         
	 *         textField.setValue( "value3" );   // the TextField will now show the value "value3"
	 *     } );
	 * 
	 * 
	 * The unrendered state of a Component allows for lazy rendering (i.e. rendering only when needed). This may be the case, for example, if
	 * a component exists within a {@link gui.tab.Panel TabPanel}. There is no reason to have the browser perform the extra work necessary to 
	 * render the components of a tab which hasn't been clicked on yet, so these components are left in their unrendered state until that time. 
	 * 
	 * These instantiated but unrendered components may still be updated by a {@link gui.app.Controller Controller} however. The client code 
	 * in the Controller should not have to first test if the component is rendered before calling methods on it, so the automatic handling 
	 * of rendered/unrendered state within the components makes this distinction transparent.
	 * 
	 * 
	 * ## Other notes
	 * 
	 * Some other things to note about Component and its subclasses are:
	 * 
	 * - Any configuration options that are provided to its constructor are automatically applied (copied) onto the new Component 
	 *   object. This makes them available as properties, and allows them to be referenced in subclasses as `this.configName`.  
	 *   However, unless the configuration options are also listed as public properties, they should not be used externally.
	 * - Components directly support masking and un-masking their viewable area.  See the {@link #masked}/{@link #maskConfig} 
	 *   configuration options, and the {@link #mask} and {@link #unmask} methods.
	 * - When a Component is {@link #method-destroy destroyed}, a number of automatic cleanup mechanisms are executed. 
	 *   See {@link #method-destroy} for details.
	 */
	var Component = Observable.extend( { 
		
		/**
		 * @cfg {String} id
		 *  
		 * The id that identifies this Component instance. Defaults to a unique id, and may be retrieved by {@link #getId}.
		 */
		
		/**
		 * @cfg {String} elType
		 * 
		 * The element type that should be created as the Component's HTML element. For example, the string
		 * 'div' will create a &lt;div&gt; element for the Component. Any HTML element type can be used,
		 * and subclasses may override the default for a different implementation.
		 */
		elType : 'div',
		 
		/**
		 * @cfg {jQuery/HTMLElement} renderTo 
		 * 
		 * The HTML element to render this component to. If specified, the component will be rendered immediately 
		 * upon creation.
		 */
		
		/**
		 * @cfg {Boolean} hidden
		 * 
		 * True to initially render the Component hidden.
		 */
		hidden : false,
		
		/**
		 * @protected
		 * @cfg {String} baseCls
		 * 
		 * The base CSS class to apply to the Component. This is meant for subclasses to specify, to change the CSS class that
		 * is applied to the Component's {@link #$el element}. 
		 * 
		 * The value of this config, by convention, is also used to prefix descendent elements of a Component subclass. For 
		 * example, {@link gui.panel.Panel Panel} sets this config to 'gui-panel', and its header and body elements are prefixed with 
		 * this to become 'gui-panel-header' and 'gui-panel-body', respectively. However when a {@link gui.window.Window Window} is 
		 * created (which is a subclass of {@link gui.panel.Panel Panel}, the value is 'gui-window', and the header and body become 
		 * 'gui-window-header' and 'gui-window-body' instead.
		 */
		baseCls : 'gui-component',
		
		/**
		 * @protected
		 * @cfg {String} componentCls
		 * 
		 * Any additional CSS class(es) to apply to the Component's root {@link #$el element}, to distinguish it for styling.
		 * This is used for subclasses whose parent defines a {@link #baseCls}, but then have to add additional styling
		 * themselves. 
		 * 
		 * For example, the base form {@link gui.form.field.Field Field} class adds the {@link #baseCls} 'gui-form-field', and
		 * the {@link gui.form.field.Text TextField} subclass wants to keep that class, and also add 'gui-form-field-text'
		 * to allow for any different styling of that particular subclass. The result is two css classes: 'gui-form-field' 
		 * and 'gui-form-field-text'. In the case of {@link gui.form.field.TextArea TextAreaField} (a subclass of TextField}, 
		 * its componentCls is 'gui-form-field-textarea', which overrides TextField's componentCls.
		 */
		
		/**
		 * @cfg {String} cls
		 * 
		 * Any additional CSS class(es) to add to this component's element. If multiple, they should be separated by a space. 
		 * Useful for styling Components and their inner elements (if any) based on regular CSS rules.
		 * (Note that this is named 'cls' instead of 'class', as 'class' is a JavaScript reserved word.)
		 */
		cls: '',
		
		/**
		 * @cfg {Object} style
		 * 
		 * Any additional CSS style(s) to apply to the outer div element. Should be an object where the keys are the CSS 
		 * property names, and the values are the CSS values. Ex:
		 * 
		 *     style : {
		 *         'text-decoration' : 'underline',
		 *         'padding-top'     : '20px',
		 *         'margin'          : '5px'
		 *     }
		 */
		
		/**
		 * @cfg {Object} attr
		 * 
		 * Any additional html attributes to apply to the outer div element. Should be an object where the keys are the attribute names, and the values are the 
		 * attribute values. Attribute values should be strings.
		 */
		
		
		/**
		 * @protected
		 * @cfg {String/String[]/Function/gui.template.LoDash} renderTpl
		 * 
		 * The template to use to render the Component's **internal** structure when first rendered. This is used for Component subclasses 
		 * to generate the markup that will make up the Component's structure that does not change. This is opposed to the {@link #tpl}
		 * config, which if present, is used to update the component's markup with new data via {@link #update}.
		 * 
		 * ## Details
		 * 
		 * The markup generated by this template (in conjunction with the {@link #renderTplData} config) will be created during the
		 * {@link #method-render rendering process}, before the {@link #onRender} hook method is called. This allows the code in 
		 * {@link #onRender} to perform any necessary operations on the generated structure.
		 * 
		 * If a subclass is supplying this config, it should also override the {@link #getContentTarget} method, and return the element
		 * that should be the target of the {@link #html}, {@link #contentEl}, and {@link #tpl} configs. For example:
		 * 
		 *     renderTpl : new LoDashTpl( [
		 *         '<div id="<%= elId %>-titlebar">',  // `elId` var is automatically provided in the {@link #renderTplData}, from the unique {@link #elId} property - See {@link #renderTplData}
		 *             '<%= title %>',                 // `title` var would need to be provided in the {@link #renderTplData} by subclass
		 *         '</div>',
		 *         '<div id="<%= elId %>-body"></div>'
		 *     ] ),
		 *     
		 *     getContentTarget : function() {
		 *         return this.bodyEl || (this.bodyEl = jQuery( '#' + this.elId + '-body' ));  // cache the bodyEl for subsequent calls
		 *     }
		 * 
		 * If, for example, the {@link #html} config is provided, then the value of the config will be placed into the "body" div.
		 * 
		 * ## Forms
		 * 
		 * This config may be a string, an array of strings, a compiled Lo-Dash template function, or a {@link gui.template.Template} 
		 * instance. For the string, array of strings, or function form, a {@link gui.template.LoDash LoDash template} instance will be 
		 * created when the Component is rendered. To use another Template type, pass in an instance of a {@link gui.template.Template} 
		 * subclass to this config. 
		 * 
		 * ## Variables Provided to the Template
		 * 
		 * For the set of common variables that are automatically provided to this template, see {@link #renderTplData}.
		 * 
		 * ## More Information About Templating
		 * 
		 * For more information on Lo-Dash templates (the default type), see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
		 */
		
		/**
		 * @protected
		 * @cfg {Object} renderTplData
		 * 
		 * The data to be provided to the {@link #renderTpl}, if any. For example, if we had the following {@link #renderTpl}:
		 * 
		 *     renderTpl : new LoDashTpl( [
		 *         '<div data-elem="titlebar"><%= title %></div>',
		 *         '<div data-elem="body"></div>'
		 *     ] )
		 *     
		 * Then we would want to set this config to:
		 * 
		 *     { title: "My Title" }
		 *     
		 * This may be done explicitly, in say {@link #initComponent} using the code `this.renderTplData = { title: "My Title" };`,
		 * or it may be returned by an override of the {@link #getRenderTplData} method.
		 * 
		 * 
		 * ## Common Variables
		 * 
		 * A set of common properties will always be available on this object for the {@link #renderTpl} (which are supplied by the 
		 * {@link #getRenderTplData} method), including:
		 * 
		 * - **component**: This Component instance. This may be used to retrieve configs, call methods, etc., from within the template.
		 * - **elId**: The value of the {@link #elId} property (an auto-generated, unique value).
		 * - **baseCls**: The {@link #baseCls} config, which is the base CSS class to prefix descendent elements' CSS
		 *   classes with. Ex: a {@link #baseCls} of 'gui-panel' is used to prefix a {@link gui.panel.Panel Panel's} body
		 *   element to become 'gui-panel-body', but when a {@link gui.window.Window Window} is created, the value is
		 *   'gui-window', and the body becomes 'gui-window-body' instead. 
		 * - **componentCls**: The {@link #componentCls} config.
		 */
		
		
		/**
		 * @cfg {String} html
		 * Any explicit HTML to attach to the Component at render time.
		 * 
		 * Note that this config, in the end, has the same effect as the {@link #contentEl} config, but is more clear 
		 * from the client code's side for adding explict HTML to the Component.
		 */
		
		/**
		 * @cfg {HTMLElement/jQuery} contentEl
		 * An existing element or jQuery wrapped set to place into the Component when it is rendered, which will become
		 * the "content" of the Component.  The element will be moved from its current location in the DOM to inside this
		 * Component's element.
		 * 
		 * Note that this config, in the end, has the same effect as the {@link #html} config, but is more clear from the
		 * client code's side for adding DOM elements to the Component.
		 */
		
		/**
		 * @cfg {String/String[]/Function/gui.template.Template} tpl
		 * 
		 * The template to use as the HTML template of the Component, which may be {@link #update updated} at a later time. For 
		 * specifying the one-time internal structure of the Component, use {@link #renderTpl} instead.
		 * 
		 * ## Details
		 * 
		 * This config is used in conjunction with the {@link #tplData} config (which will be the data that is provided to the template
		 * function) to create the component's markup. Its output is injected into the element specified by the 
		 * {@link #getContentTarget content target}, after the {@link #onRender} method has been executed. 
		 * 
		 * If this config is specified, it will override the {@link #html} and {@link #contentEl} configs. The markup that it 
		 * outputs can be updated with new data by using the {@link #update} method, and providing an Object as its first argument.
		 * 
		 * ## Forms
		 * 
		 * This config may be a string, an array of strings, a compiled Lo-Dash template function, or a {@link gui.template.Template} 
		 * instance. For the string, array of strings, or function form, a {@link gui.template.LoDash LoDash template} instance will be 
		 * created when the Component is rendered. To use another Template type, pass in an instance of a {@link gui.template.Template} 
		 * subclass to this config. 
		 * 
		 * ## Variables Provided to the Template
		 * 
		 * The variables provided to this template are specified either by the {@link #tplData} config (during initial render time), or 
		 * will be the variables provided to the {@link #update} method when updating at a later time.
		 * 
		 * There are also a common set of variables that will always be available to the template, which are:
		 * - **component**: This Component instance. This may be used to retrieve configs, call methods, etc., from within the template.
		 * - **elId**: The value of the {@link #elId} property (an auto-generated, unique value).
		 * - **baseCls**: The {@link #baseCls} config, which is the base CSS class to prefix descendent elements' CSS
		 *   classes with. Ex: a {@link #baseCls} of 'gui-panel' is used to prefix a {@link gui.panel.Panel Panel's} body
		 *   element to become 'gui-panel-body', but when a {@link gui.window.Window Window} is created, the value is
		 *   'gui-window', and the body becomes 'gui-window-body' instead. 
		 * - **componentCls**: The {@link #componentCls} config.
		 * 
		 * ## More Information About Templating
		 * 
		 * For more information on Lo-Dash templates (the default type), see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
		 */
		
		/**
		 * @cfg {Object} tplData
		 * 
		 * The data to provide to the {@link #tpl} when initially rendering the Component. If this config is not
		 * specified, but a {@link #tpl} config is, then the {@link #tpl} will simply be provided the default set of variables as its 
		 * data (see {@link #tpl}).
		 * 
		 * Note that the template data can be provided after {@link #method-render} time to update the markup of the Component using 
		 * the {@link #update} method. However, if initial data is available, it should be provided with this config so that the 
		 * template is run with the correct initial data the first time, and doesn't need to be run again unless the data has 
		 * changed.
		 */
		
		
		/**
		 * @cfg {Number/String} height
		 * 
		 * A height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} width
		 * 
		 * A width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} minHeight
		 * 
		 * A minimum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} minWidth
		 * 
		 * A minimum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} maxHeight
		 * 
		 * A maximum height to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		/**
		 * @cfg {Number/String} maxWidth
		 * 
		 * A maximum width to give the Component. Accepts a number (for the number of pixels) or any valid CSS string. Defaults to automatic sizing. 
		 */
		
		
		/**
		 * @cfg {Object} maskConfig 
		 * 
		 * A configuration object for the default mask that will be shown when the {@link #mask} method is called (if 
		 * {@link #mask mask's} argument is omitted), or if the {@link #masked} configuration option is `true` (in which case a mask 
		 * will be shown over the Component, using this `maskConfig` when it is first rendered). This default maskConfig can be 
		 * overriden when calling {@link #mask} by passing a configuration object to its argument.
		 * 
		 * Masks are shown and hidden using the {@link #mask} and {@link #unmask} methods. If this configuration option is not 
		 * provided, the configuration options default to the default values of the configuration options for {@link gui.Mask}.
		 */
		
		/**
		 * @cfg {Boolean} masked 
		 * 
		 * `true` to instantiate the Component with its mask shown (the {@link #mask} method is called 
		 * automatically when the Component is instantiated), using the configuration specified by {@link #maskConfig}.
		 */
		
		
		/**
		 * @cfg {gui.plugin.Plugin/gui.plugin.Plugin[]} plugins
		 * 
		 * A single plugin or array of plugins to attach to the Component. Plugins must extend the class {@link gui.plugin.Plugin}.
		 * See {@link gui.plugin.Plugin} for details on creating plugins.
		 * 
		 * Note that Component will normalize this config into an array, converting a single plugin into a one-element array, or creating
		 * an empty array if no plugins were provided.  This is done so that subclasses may add plugins by pushing them directly
		 * onto the plugins array in their implementation of {@link #initComponent}. 
		 */
		
		
		/**
		 * @protected
		 * @cfg {gui.Container} parentContainer
		 * 
		 * The parent {@link gui.Container Container} of this Component (if any), which this Component is a child of. This is set 
		 * by the {@link gui.Container Container} that is adding this Component as a child, and should not be supplied directly.
		 */
		parentContainer: null,
		
		
		/**
		 * @property {Boolean} isGuiComponent
		 * 
		 * A flag (which is always set to `true`) that signifies that this object is a Component or Component subclass. This 
		 * is used mainly to avoid an `instanceof` check with some of the collaborator classes of Component (like {@link gui.Mask}),
		 * such as to not introduce a circular dependency when not necessary.
		 */
		isGuiComponent : true,
		
		/**
		 * @private
		 * @property {String} uuid (readonly)
		 * 
		 * A unique identifier for the Component, which is unique among all Components on a given page. Can be
		 * retrieved with {@link #getUuid}.
		 */
		 
		/**
		 * @protected
		 * @property {String} elId (readonly)
		 * 
		 * The unique id that is generated for the Component's {@link #$el element}. This is different than {@link #id} so that 
		 * each Component is always guaranteed to have a unique ID for its {@link #$el element}. 
		 * 
		 * Component subclasses often query the DOM for the elements that they create in a {@link #renderTpl} based on this elId. 
		 * If we only used {@link #id} to uniquely identify elements, then there would be the possibility that the user could
		 * accidentally create two components with the same {@link #id}, in which case the second Component would actually 
		 * query and be operating on the DOM elements created for the first Component by mistake.
		 */
		
		/**
		 * @protected
		 * @property {Boolean} rendered
		 * 
		 * Property that can be used to determine if the Component has been rendered.  
		 * Will be set to true after the render method has been executed.
		 */
		rendered: false,
		
		/**
		 * @protected
		 * @property {jQuery} $el
		 * 
		 * The main element that is created for the Component (determined by the {@link #elType} config). 
		 * This will be available after the Component is rendered, and may be retrieved using {@link #getEl}
		 */
		
		/**
		 * @private
		 * @property {Boolean} hidden
		 * 
		 * Property that stores the 'hidden' state of the Component. This property is set to true immediately
		 * when the Component is hidden (even if a hide animation is to take place), and set to false immediately
		 * when the Component is shown (even if a show animation is to take place). This behavior is for the fact
		 * that even if the Component is in the process of showing, it is already shown in some manner.
		 * 
		 * Note that the Component may still be considered "hidden" by its element's visibility, and this case
		 * may be tested for with the `checkDom` parameter that {@link #isHidden} provides.
		 */
	
		/**
		 * @private
		 * @property {Boolean} showing
		 * 
		 * Flag that is set to true while the Component is showing (i.e. a show animation is running). It is set to false
		 * when the Component has fully shown (its animation has completed).
		 */
		showing : false,
	
		/**
		 * @private
		 * @property {Boolean} hiding
		 * 
		 * Flag that is set to true when the Component is hiding (i.e. a hide animation is running). It is set to false
		 * when the Component has fully hidden (its animation has completed).
		 */
		hiding : false,
	
		/**
		 * @private
		 * @property {gui.anim.Animation} currentAnimation
		 * 
		 * The currently running {@link #method-show}/{@link #method-hide} animation, if any. Will be null if the Component
		 * is not currently in the process of showing or hiding. This is only relevant when {@link #method-show} or
		 * {@link #method-hide} is called with the `anim` option.
		 */
		currentAnimation : null,
		
		
		
		/**
		 * @private
		 * @property {gui.Mask} componentMask
		 * 
		 * The gui.Mask instance that the Component is using to mask the Component. This will be `undefined` if no Mask has 
		 * been created (i.e. the {@link #masked} config was not set to `true`, and the {@link #mask} method was never called). 
		 */
		
		/**
		 * @protected
		 * @property {Boolean} updateCalledWithContent
		 * 
		 * This special flag is for if a {@link #tpl} exists, but the {@link #update} method was called with direct HTML content
		 * (instead of {@link #tplData}). This only matters while the Component is in its {@link #rendered unrendered} state. A 
		 * value of `true` tells the {@link #method-render} method to skip rendering the {@link #tpl}, and instead use the direct 
		 * {@link #html} content that was provided to the call to {@link #update}.
		 */

		
		/**
		 * @protected
		 * @property {Boolean} destroying
		 * 
		 * Property which is set to `true` while the {@link #method-destroy} method executes. This is mainly for the
		 * {@link #onDestroy} hook method, which may call other methods that may want to determine if the Component is 
		 * destroying itself, in order to avoid doing unnecessary work.
		 * 
		 * An example of this would be a method that resets the Component's element to an "empty" state due to unbinding
		 * itself from a data entity, but really shouldn't do so when the Component's element is just going to be removed 
		 * from the DOM anyway. 
		 */
		destroying: false,
		
		/**
		 * @protected
		 * @property {Boolean} destroyed
		 * 
		 * Initially `false`, and will be set to `true` after the {@link #method-destroy} method executes.
		 */
		destroyed: false,
		
		
		/**
		 * @constructor
		 * @param {Object} config The configuration options for this Component, specified in an object (hash).
		 */
		constructor : function( config ) {
			// Apply the properties of the configuration object onto this object
			_.assign( this, config );
			
			
			// Call superclass (observable) constructor. Must be done after config has been applied.
			this._super( arguments );
			
	        
			// Add events that this class will fire
			this.addEvents( 
				/**
				 * Fires when this Component has been {@link #method-render rendered}.
				 * 
				 * @event render
				 * @param {gui.Component} component This Component instance.
				 */
				'render',
				
				/**
				 * Fires before the Component is shown. Handlers of this event may cancel the showing of the Component by 
				 * returning false.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event beforeshow
				 * @param {gui.Component} component This Component instance.
				 * @preventable
				 */
				'beforeshow',
				
				/**
				 * Fires when the Component has been shown, using the {@link #method-show} method. If an `anim` option
				 * was passed to the {@link #method-show} method, this event fires immediately, just after the beginning of the
				 * animation. To find out when the animation is complete, listen to the {@link #aftershow} event.
				 *
				 * Note that this event fires as soon as the Component is starting to show because handlers most likely expect to do 
				 * something with the Component immediately. So for handlers of Components that first don't show with any `anim`, and 
				 * then are given one at a later time, they will still work as expected (as opposed to the behavior of if this event 
				 * fired at the end of the animation).
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 * 
				 * @event show
				 * @param {gui.Component} component This Component instance.
				 */
				'show',
	
				/**
				 * An alias of the {@link #event-show} event, which can make handler-adding code more consistent and clear
				 * when running animations. Also, having a 'begin' event for 'show' also maintains consistency with {@link #hidebegin}.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event showbegin
				 * @param {gui.Component} component This Component instance.
				 */
				'showbegin',
	
				/**
				 * Fires when the Component has fully shown, after any animation has finished. Note that this
				 * event will fire regardless of if an `anim` option was provided to the {@link #method-show} method or not.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event aftershow
				 * @param {gui.Component} component This Component instance.
				 */
				'aftershow',
				
				/**
				 * Fires before the Component is hidden. Handlers of this event may cancel the hiding of the Component by 
				 * returning false.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event beforehide
				 * @param {gui.Component} component This Component instance.
				 * @preventable
				 */
				'beforehide',
	
				/**
				 * Fires when the Component has been hidden, using the {@link #method-hide} method. If an `anim` option was passed
				 * to the {@link #method-hide} method, this event fires *after* the animation has finished hiding the Component. 
				 * To find out when a hide animation has started, listen to the {@link #hidebegin} event.
				 * 
				 * Note that this event fires only after the Component has fully hidden because handlers most likely expect to do something
				 * after the Component is hidden from the DOM. So for handlers of Components that first don't hide with any `anim`, and
				 * then are given one at a later time, they will still work as expected (as opposed to the behavior of if this event fired 
				 * at the start of the animation).
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 * 
				 * @event hide
				 * @param {gui.Component} component This Component instance.
				 */
				'hide',
	
				/**
				 * Fires when the Component is beginning to hide. This event is useful if an `anim` option is specified to the
				 * {@link #method-hide} method, as it fires just before the animation starts. The {@link #event-hide} 
				 * (and {@link #afterhide}) event will fire when the animation is complete, and the Component has been completely 
				 * hidden. Note that this event will  fire regardless of if an `anim` option is provided to the {@link #method-hide} 
				 * method or not.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event hidebegin
				 * @param {gui.Component} component This Component instance.
				 */
				'hidebegin',
	
				/**
				 * An alias of the {@link #event-hide} event, which can make handler-adding code more consistent and clear.
				 * Having a 'complete' event for 'hide' also maintains consistency with {@link #aftershow}.
				 * 
				 * Only fires if the Component has been {@link #method-render rendered}.
				 *
				 * @event afterhide
				 * @param {gui.Component} component This Component instance.
				 */
				'afterhide',
				
				/**
				 * Fires just before this Component is destroyed. A handler of this event may return false to cancel 
				 * the destruction process for the Component.
				 * 
				 * @event beforedestroy
				 * @param {gui.Component} component This Component instance. 
				 * @preventable
				 */
				'beforedestroy',
				
				/**
				 * Fires when this Component has been destroyed.
				 * 
				 * @event destroy
				 * @param {gui.Component} component This Component instance.
				 */
				'destroy'
			);
			
			
			// Generate a globally unique identifier for the Component, which is unique for all Components on the page.
			// This will also be used as the `elId`, and the default value for the `id` config if one was not provided.
			this.uuid = this.elId = 'gui-cmp-' + _.uniqueId();
			this.id = this.id || this.uuid;  // default the Component's id to the uuid if not provided
			
			
			// Normalize the 'plugins' config into an array before calling initComponent, so that subclasses may just push any
			// plugins that they wish directly onto the array without extra processing.
			this.plugins = this.plugins || [];
			if( !_.isArray( this.plugins ) ) {
				this.plugins = [ this.plugins ];
			}
	        
			
			// Call template method for the initialization of subclasses of this Component
			this.initComponent();

			// If the Component was configured to be masked, call mask() to set it up.
			if( this.masked ) {
				this.mask();
				delete this.masked;  // no longer needed
			}
			
			// Initialize any plugins provided to the Component
			if( this.plugins.length > 0 ) {
				this.initPlugins( this.plugins );
			}
			
			// Render the component immediately if a 'renderTo' element is specified
			if( this.renderTo ) {
				this.render( this.renderTo );
				delete this.renderTo;  // no longer needed
			}
		},
		
		
		/**
		 * Hook method for initialization. This method should replace constructor for subclasses
		 * of Component.
		 * 
		 * @protected
		 * @method initComponent
		 */
		initComponent : Gui.emptyFn,
		
		
		/**
		 * Initializes the plugins for the Component.
		 * 
		 * @private
		 * @param {gui.plugin.Plugin/gui.plugin.Plugin[]} plugin A single plugin, or array of plugins to initialize.
		 */
		initPlugins : function( plugin ) {
			if( _.isArray( plugin ) ) {
				for( var i = 0, len = plugin.length; i < len; i++ ) {
					this.initPlugins( plugin[ i ] ); 
				}
				return;  // array has been processed, return
			}
			
			if( !( plugin instanceof Plugin ) ) {
				throw new Error( "error: a plugin provided to this Component was not of type gui.plugin.Plugin" );
			}
			
			// Initialize the plugin, passing a reference to this Component into it.
			plugin.init( this );
		},
		
		
		/**
		 * Renders the component into a containing HTML element.  Starts by creating the base div element for this component, and then 
		 * calls the hook method {@link #onRender} to allow subclasses to add their own functionality/elements into the rendering process.
		 * When fully complete, the {@link #event-render render event is fired}, and then {@link #doLayout} is executed (if the `deferLayout` 
		 * option is not provided as `true`).
		 *
		 * @param {HTMLElement/jQuery} containerEl The HTML element to render this component into.
		 * @param {Object} [options] Any of the following options. (Note: for backward compatibility, this argument may be the `position` option below.)
		 * @param {String/Number/HTMLElement/jQuery} [options.position] The index, element id, or element that the component should be inserted before.
		 *   This element should exist within the `containerEl`.
		 * @param {Boolean} [options.deferLayout=false] True to defer the execution of {@link #doLayout} during the rendering
		 *   process until manually called.
		 */
		render : function( containerEl, options ) {
			// Destroyed components can't be re-rendered. Return out.
			if( this.destroyed ) {
				return;
			}
			
			// Maintain backward compatibility where the `options` argument was the `position` option
			var position;
			if( _.isNumber( options ) || _.isString( options ) || _.isElement( options ) || options instanceof jQuery ) {
				position = options;
				options = { position: position };  // store it in there for when it is provided to hook methods
			} else {
				options = options || {};
				position = options.position;
			}
			
			
			var $containerEl = jQuery( containerEl );
			
			// Normalize position to the element where the Component is to be placed before (if provided)
			if( typeof position !== 'undefined' ) {
				if( typeof position === 'number' ) {
					// note: If the numeric `position` doesn't resolve to an element to insert before, it will become `undefined`, causing the code later to just append it instead. 
					// This is desired behavior, as inserting into an element at a position greater than the number of elements in the container, would make sense to simply append.
					position = $containerEl.children().get( position );   // get() will return undefined if there is no element at that position
				} else {
					position = $containerEl.find( position );  // if an element was provided, make sure that the element exists in the container element provided as well
				}
			}
			
			
			if( this.rendered ) {
				// Component is already rendered, just append it to the supplied container element
				if( position ) {
					// If the element where this Component is to be positioned before happens to already be this Component's element,
					// jQuery's insertBefore() has the effect of removing the element from the DOM... Hence, only move the Component's
					// element if it is not to be placed "before itself" (in which otherwise, it is already in the correct position, 
					// and we don't need to do anything anyway) 
					if( position[ 0 ] !== this.$el[ 0 ] ) {
						this.$el.insertBefore( position );
					}
				} else {
					this.$el.appendTo( $containerEl );
				}
				
			} else {
				// Handle any additional attributes (the `attr` config) that were specified to add (or any attributes
				// added by subclass implementations of getRenderAttributes())
				var attr = Html.attrMapToString( this.getRenderAttributes() );
				delete this.attr;  // config no longer needed
				
				// Create a CSS string of any specified styles (the `style` config + sizing configs such as width/height)
				var style = Css.mapToString( this.getRenderStyle() );  // convert the Object (map) returned by getRenderStyle() into a CSS string
				delete this.style;  // config no longer needed
				
				// If there is a `renderTpl`, execute it now
				var renderTpl = this.renderTpl,
				    renderTplMarkup = "";
				if( renderTpl ) {
					renderTpl = ( renderTpl instanceof Template ) ? renderTpl : new LoDashTpl( renderTpl );  // normalize renderTpl to a Template instance if it is not one already
					renderTplMarkup = renderTpl.apply( this.getRenderTplData() );
					
					delete this.renderTpl;      // no longer needed
					delete this.renderTplData;  // no longer needed
				}
				
				// Create the main (outermost) element for the Component. By default, creates a div element, such as: <div id="someId"></div>
				// With a `renderTpl`, it will create the div with its `renderTpl` result as its inner HTML. Ex:
				// <div id="someId"><div id="bodyEl" /></div>
				var cls = _.compact( [ this.baseCls, this.componentCls, this.cls ] ).join( " " );  // _.compact() removes falsy values. In this case, undefined values.
				var elMarkup = [
					'<', this.elType, ' id="', this.elId, '" class="', cls, '" style="', style, '" ', attr, '>',
						renderTplMarkup,
					'</', this.elType, '>'
				].join( "" );
				this.$el = jQuery( elMarkup );
				
				
				// Appending the element to the container before the call to onRender. It is necessary to do things in this order (and not rendering children and then appending)
				// for things like the jQuery UI tabs, which requires that their wrapping elements be attached to the DOM when they are instantiated.
				// Otherwise, those items require their instantiation to be placed into a setTimeout(), which causes a flicker on the screen (especially for the jQuery UI tabs). 
				if( position ) {
					this.$el.insertBefore( position );
				} else {
					this.$el.appendTo( $containerEl );
				}
				
				
				// Setting the render flag before the call to onRender so that onRender implementations can call methods that check this flag (such as setters
				// that handle the case of the Component not yet being rendered).
				this.rendered = true;
				
				// Call onRender hook method for subclasses to add their own elements, and whatever else they need 
				this.onRender( $containerEl, options );
				
				// Make sure the `tpl` has been created into a LoDashTpl instance, not only for the initial rendering,
				// but also for when calling `update()` with a data object.
				if( this.tpl && !( this.tpl instanceof Template ) ) {
					this.tpl = new LoDashTpl( this.tpl );
				}
				
				
				// Attach the output of the `tpl` config (if provided) or any specified HTML or content element to the Component's content 
				// target. The content target is by default, the Component's element, but may be overridden by subclasses that generate a 
				// more complex HTML structure.
				var $contentTarget = this.getContentTarget();
				if( this.tpl && !this.updateCalledWithContent ) {  // tpl config takes precedence over html/contentEl configs, *unless* update() has been called with HTML content
					var tplData = _.assign( {}, this.getDefaultTplData(), this.tplData );
					$contentTarget.append( this.tpl.apply( tplData ) );
					
				} else {
					if( this.html ) {
						$contentTarget.append( this.html );
					}
					if( this.contentEl ) {
						$contentTarget.append( this.contentEl );
					}
				}
				delete this.tplData;                  // no longer needed
				delete this.updateCalledWithContent;  // no longer needed
				delete this.html;                     // no longer needed
				delete this.contentEl;                // no longer needed
				
				
				// If the Component was configured with hidden = true, hide it now. This must be done after onRender,
				// because some onRender methods change the 'display' style of the outer element.
				if( this.hidden ) {
					this.$el.hide();
				}
				
				// Call the onAfterRender hook method, and fire the 'render' event
				this.onAfterRender( $containerEl, options );
				this.fireEvent( 'render', this );
				
				// Finally, if the deferLayout option was not provided as true, run the layout on the Component (or Container, 
				// if it's a gui.Container subclass!)
				if( !options.deferLayout ) {
					this.doLayout();
				}
			}
		},
		
		
		/**
		 * Retrieves the additional attributes that are used to render the Component's {@link #$el element} with.
		 * This method is called from {@link #method-render} when initially rendering the component.
		 * 
		 * @protected
		 * @return {Object} An Object (map) of the additional attributes which should be applied to the Component's
		 *   main {@link #$el element}.
		 */
		getRenderAttributes : function() {
			return this.attr || {};
		},
		
		
		/**
		 * Retrieves the style properties that are used to render the Component's {@link #$el element} with. This method 
		 * is called from {@link #method-render} when initially rendering the component.
		 * 
		 * @protected
		 * @return {Object} An Object (map) of the style properties which should be applied to the Component's main 
		 *   {@link #$el element}.
		 */
		getRenderStyle : function() {
			var style = this.style || {};
			
			// Apply any custom sizing
			var width = this.width,
			    height = this.height,
			    minWidth = this.minWidth,
			    minHeight = this.minHeight,
			    maxWidth = this.maxWidth,
			    maxHeight = this.maxHeight;
			
			var undef,  // to allow for minification var collapse
			    normalizeSizeValue = Css.normalizeSizeValue;  // to allow for minification var collapse
			if( width !== undef )     style.width = normalizeSizeValue( width );
			if( height !== undef )    style.height = normalizeSizeValue( height );
			if( minWidth !== undef )  style.minWidth = normalizeSizeValue( minWidth );
			if( minHeight !== undef ) style.minHeight = normalizeSizeValue( minHeight );
			if( maxWidth !== undef )  style.maxWidth = normalizeSizeValue( maxWidth );
			if( maxHeight !== undef ) style.maxHeight = normalizeSizeValue( maxHeight );
			
			return style;
		},
		
		
		/**
		 * Retrieves the common set of properties to pass to both the {@link #renderTpl} and {@link #tpl} as variables.
		 * 
		 * @protected
		 * @return {Object} An Object (map) with the properties. See {@link #renderTpl} and {@link #tpl} for details.
		 */
		getDefaultTplData : function() {
			return {
				component    : this,
				elId         : this.elId,
				baseCls      : this.baseCls,
				componentCls : this.componentCls
			};
		},
		
		
		/**
		 * Retrieves the data to be used by the {@link #renderTpl}. Adds the common properties to any {@link #renderTplData} config
		 * provided before returning. These properties are enumerated in the {@link #renderTplData} config doc.
		 * 
		 * This method may be overridden to add properties to the returned object. However, this superclass method should always 
		 * be called first, to supply the initial properties.
		 * 
		 * @protected
		 * @return {Object} An Object (map) with the properties needed for the {@link #renderTpl}.
		 */
		getRenderTplData : function() {
			return _.assign( {}, this.getDefaultTplData(), this.renderTplData || {} );
		},
		
		
		/**
		 * Determines if the Component is currently {@link #rendered}.
		 * 
		 * @return {Boolean} True if the Component is rendered, false otherwise.
		 */
		isRendered : function() {
			return this.rendered;
		},
		
		
		/**
		 * Hook method that runs when a Component is being rendered, after the Component's base element has been created, its
		 * {@link #renderTpl} has been processed and appended, and the element has been appended to its parent element.
		 * 
		 * @protected
		 * @method onRender
		 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component is being rendered into.
		 * @param {Object} options The options provided to {@link #method-render}.
		 */
		onRender : Gui.emptyFn,
		
		
		/**
		 * Hook method that runs when a Component has been completely rendered. This includes everything up to the point of
		 * when the {@link #onRender} hook method has been called, and after the {@link #html}, {@link #contentEl}, and 
		 * {@link #tpl} configs have been processed and their content has been added to the Component's {@link #$el element}.
		 * It is also called after the initial {@link #cfg-hidden} state has been processed, and any initial 
		 * {@link #masked mask} has been applied.
		 * 
		 * @protected
		 * @method onAfterRender
		 * @param {jQuery} $containerEl The HTML element wrapped in a jQuery set that the component has been rendered into.
		 * @param {Object} options The options provided to {@link #method-render}.
		 */
		onAfterRender : Gui.emptyFn,
		
		
		/**
		 * Updates the HTML of the component directly, or re-runs the {@link #tpl} to update the HTML if {@link #tplData template data}
		 * (an Object) is provided. Will handle the unrendered and rendered states of the Component.
		 *
		 * @param {String/HTMLElement/jQuery/Object} contentOrTplData The HTML content as a string, an HTML element, or a jQuery 
		 *   wrapped set of elements to update the component's {@link #getContentTarget content target} with. If an Object is provided, 
		 *   it is taken as the {@link #tplData data} that the {@link #tpl} should be executed with, allowing this method to update the 
		 *   Component's markup via its {@link #tpl}.
		 */
		update : function( content ) {
			var isTplData = _.isPlainObject( content );  // will be true if it is a plain JavaScript Object, meaning template data is being provided
			
			if( !this.rendered ) {
				if( isTplData ) {
					this.tplData = content;
					this.updateCalledWithContent = false; // in case update() was previously called with `html` (string) content,
					                                      // and this flag was set to true, then we must set it back to false. See
					                                      // case below where it is set to `true` for more details.
				
				} else {  // Not a plain JavaScript Object, must be HTML content
					// Remove this config, just in case it was specified. Setting the 'html' config (next) has the same effect as 'contentEl'.
					delete this.contentEl;
					
					// Set the 'html' config, for when the Component is rendered.
					this.html = content;
					this.updateCalledWithContent = true;  // in case there is a `tpl` config, this flag tells render() to use the `html` 
                                                          // config instead of `tpl` when it renders. We don't want to delete the `tpl`
                                                          // config, since it may be used with data provided to this method at a later time.
				}
			} else {
				var contentTarget = this.getContentTarget().empty();  // empty out the element first
				
				if( isTplData ) {
					var tplData = _.assign( {}, this.getDefaultTplData(), content );
					contentTarget.append( this.tpl.apply( tplData ) );
				} else {
					contentTarget.append( content );
				}
			}
		},
		
		
		
		// Layout Functionality
		
		/**
		 * This method was initially intended to bring Component layouts into the mix (instead of only having {@link gui.Container Container}
		 * layouts, which lay out {@link gui.Container#items child components}). A Component layout was going to size and position the HTML 
		 * elements that a particular Component had created in its {@link #onRender} method.
		 * 
		 * However, at the time of this writing, we never got around to implementing this feature, and {@link gui.Container} extends
		 * this method for its {@link gui.Container#layout layout} of {@link gui.Container#items child components}. This method was added into 
		 * the Component class (this class) later though, in an effort to allow Components to respond to being laid out by their {@link #parentContainer}.
		 * When the Component's {@link #parentContainer} runs its {@link gui.Container#layout layout}, this method is executed from it. A 
		 * Component author may implement an extension of the {@link #onComponentLayout} hook method to respond to the Component being laid 
		 * out by its {@link #parentContainer}, such as to implement updating the size or positioning of its child elements upon being laid out.
		 * Note that {@link #onComponentLayout} will eventually be called just from the Component's initial {@link #method-render rendering} 
		 * process as well, if the Component is not being rendered by a {@link #parentContainer} layout (i.e. it is a standalone Component,
		 * not part of a {@link gui.Container Container}/Component hierarchy).
		 * 
		 * So, bottom line, if you wish for your Component to do something when it is laid out by its {@link #parentContainer},
		 * implement the {@link #onComponentLayout} method. See {@link #onComponentLayout} for details.
		 */
		doLayout : function() {
			// Note: this method is extended in the gui.Container subclass. Keep this in mind if ever implementing Component
			// layouts properly, which should both run both the Component's layout, *and* the Container's layout (in that order).
			
			// Simply call the hook method to allow subclasses to participate in the Component being laid out, and fire the event.
			this.onComponentLayout();
		},
		
		
		/**
		 * Hook method that is executed when {@link #doLayout} has executed. Extend this method (calling the superclass method first)
		 * to implement any logic that the Component subclass should perform when it is either: 
		 * 
		 * a) Initially rendered (as a standalone component, not part of a {@link gui.Container Container}/Component hierarchy), or
		 * b) Has been laid out by its {@link #parentContainer}. If initially rendered by its {@link #parentContainer parent container's}
		 * layout, then this will be the same event.
		 * 
		 * For example, a Component could resize its inner elements for new dimensions set on the Component by its 
		 * {@link #parentContainer parentContainer's} {@link gui.Container#layout layout} algorithm. The layout may size the Component
		 * upon its initial rendering, an update to the child components of the {@link #parentContainer}, or from say, a browser resize
		 * where the layout runs again.
		 *
		 * @protected
		 * @template
		 * @method onComponentLayout
		 */
		onComponentLayout : Gui.emptyFn,
		
		
		/**
		 * When called on the Component, this method bubbles up to the top of the {@link gui.Container Container}/Component hierarchy,
		 * and runs {@link #doLayout} on the top-most component. This has the effect of re-doing the layout for all Containers/Components
		 * in that particular hierarchy. As such, this may be an expensive operation; use with care. This may be useful however for components
		 * that are sized based on their content, and when their content size changes, they should force a layout to adjust for the new
		 * content size.
		 */
		updateLayout : function() {
			// Bubble up to the top level parent container of this Component's hierarchy, and then call doLayout() on it
			var p = this;
			while( p.parentContainer ) {
				p = p.parentContainer;
			}
			p.doLayout();
		},
		
		
		// ----------------------------
		
		// Attribute, CSS Class, and Element Style related functionality
		
		/**
		 * Sets an attribute on the Component's {@link #$el element}.
		 * 
		 * @param {String/Object} name The attribute name. This first argument may also be provided as an Object of key/value
		 *   pairs for attribute names/values to apply to the Component's {@link #$el element}.
		 * @param {String} value The value for the attribute. Optional if the first argument is an Object.
		 * @return {gui.Component} This Component, to allow method chaining.
		 */
		setAttr : function( name, value ) {
			if( !this.rendered ) {
				this.attr = this.attr || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.attr, name );  // apply each of the properties on the provided 'attrs' object onto the component's attributes
				} else {
					this.attr[ name ] = value;
				}
				
			} else {
				this.$el.attr( name, value );  // will work for both method signatures
			}
			return this;
		},
		
		
		/**
		 * Adds a CSS class to the Component's {@link #$el element}.
		 * 
		 * @param {String} cssClass One or more CSS classes to add to the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @return {gui.Component} This Component, to allow method chaining.
		 */
		addCls : function( cssClass ) {
			if( !this.rendered ) {
				this.cls = Css.addCls( this.cls, cssClass );  // update the `cls` config in the unrendered state
			} else {
				this.$el.addClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
		
		
		/**
		 * Removes a CSS class from the Component's {@link #$el element}.
		 * 
		 * @param {String} cssClass One or more CSS classes to remove from the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @return {gui.Component} This Component, to allow method chaining.
		 */
		removeCls : function( cssClass ) {
			if( !this.rendered ) {
				this.cls = Css.removeCls( this.cls, cssClass );  // update the `cls` config in the unrendered state
			} else {
				this.$el.removeClass( cssClass ); // delegate to jQuery in this case
			}
			return this;
		},
	
	
		/**
		 * Adds or removes a CSS class from the Component's {@link #$el element}, based on if the CSS class already exists on the element
		 * or not. If providing the `flag` argument, the `cssClass` will be added or removed based on if `flag` is true or false.
		 * 
		 * @param {String} cssClass One or more CSS classes to remove from the Component's element. If specifying multiple CSS classes,
		 *   they should be separated with a space. Ex: "class1 class2"
		 * @param {Boolean} [flag] True if the class(es) should be added, false if they should be removed. This argument is optional,
		 *   and if provided, determines if the class should be added or removed.
		 * @return {gui.Component} This Component, to allow method chaining.
		 */
		toggleCls : function( cssClass, flag ) {
			if( typeof flag === 'undefined' ) {
				this[ !this.hasCls( cssClass ) ? 'addCls' : 'removeCls' ]( cssClass );
			} else {
				this[ flag ? 'addCls' : 'removeCls' ]( cssClass );
			}
			return this;
		},
		
		
		/**
		 * Determines if the Component's {@link #$el element} has the given `cssClass`.
		 * 
		 * @param {String} cssClass The CSS class to test for.
		 * @return {Boolean} True if the {@link #$el element} has the given `cssClass`, false otherwise.
		 */
		hasCls : function( cssClass ) {
			if( !this.rendered ) {
				return Css.hasCls( this.cls, cssClass );  // check the `cls` config in the unrendered state
			} else {
				return this.$el.hasClass( cssClass );
			}
		},
		
		
		/**
		 * Sets a CSS style property on the Component's {@link #$el element}.
		 * 
		 * @param {String/Object} name The CSS property name. This first argument may also be provided as an Object of key/value
		 *   pairs for CSS property names/values to apply to the Component's {@link #$el element}.
		 * @param {String} value The value for the CSS property. Optional if the first argument is an Object.
		 * @return {gui.Component} This Component, to allow method chaining.
		 */
		setStyle : function( name, value ) {
			if( !this.rendered ) {
				this.style = this.style || {};
				
				if( typeof name === 'object' ) {
					_.assign( this.style, name );  // apply each of the properties on the provided 'styles' object onto the component's style
				} else {
					this.style[ name ] = value;
				}
				
			} else {
				this.$el.css( name, value );  // will work for both method signatures (i.e. when `name` is an object, and when provided both name / value)
			}
			return this;
		},
		
		
		// ----------------------------
		
		
		/**
		 * Retrieves the element that should be the target for the Component's content (html).  For gui.Component, this is just the Component's
		 * base element (see {@link #$el}), but this method can be overridden in subclasses that define a more complex structure, where their
		 * content should be placed elsewhere. 
		 * 
		 * @protected
		 * @return {jQuery} The element (jQuery wrapped set) where HTML content should be placed. The {@link #html} and {@link #contentEl} 
		 *   configs will be attached to this element.
		 */
		getContentTarget : function() {
			return this.getEl();
		},
		
		
		/**
		 * Returns the globally unique {@link #uuid} of this Component.
		 * 
		 * @return {String}
		 */
		getUuid : function() {
			return this.uuid;
		},
		
		
		/**
		 * Returns the {@link #id} of this Component.
		 * 
		 * @return {String}
		 */
		getId : function() {
			return this.id;
		},
		
		
		/**
		 * Returns the {@link #baseCls} of this Component. This is a useful accessor for classes collaborating with the
		 * Component, to use the same {@link #baseCls} where appropriate.
		 * 
		 * @return {String}
		 */
		getBaseCls : function() {
			return this.baseCls;
		},
		
		
		/**
		 * Returns the {@link #componentCls} of this Component. This is a useful accessor for classes collaborating with the
		 * Component, to use the same {@link #componentCls} where appropriate.
		 * 
		 * @return {String}
		 */
		getComponentCls : function() {
			return this.componentCls;
		},
		
		
		/**
		 * Returns the container element for this component, wrapped in a jQuery object.  This element will only
		 * be available after the component has been rendered by {@link #method-render}.  The element that will be returned
		 * will be the one created for the Component in the {@link #method-render} method, and its type is dependent on the
		 * {@link #elType} config.
		 * 
		 * @return {jQuery}
		 */
		getEl : function() {
			return this.$el;
		},
		
		
		/**
		 * Sets the size of the element.
		 * 
		 * @param {Number} width The width, in pixels, for the Component. If undefined, no width will be set.
		 * @param {Number} height The height, in pixels, for the Component. If undefined, no height will be set.
		 */
		setSize : function( width, height ) {
			if( typeof width !== 'undefined' ) {
				this.width = width;
				
				if( this.rendered ) {
					this.$el.width( width );
				}
			}
			if( typeof height !== 'undefined' ) {
				this.height = height;
				
				if( this.rendered ) {
					this.$el.height( height );
				}
			}
		},
		
		
		/**
		 * Sets the width of the element.
		 *
		 * @param {Number/String} width The width. If a number, assumes pixels, otherwise uses the exact string.
		 */
		setWidth : function( width ) {
			this.setSize( width, undefined );
		},
		
		
		/**
		 * Returns the width of the Component. 
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 *
		 * @return {Number}
		 */
		getWidth : function() {
			return this.$el.width();
		},
		
		
		/** 
		 * Returns the inner width of the Component. The inner width of the Component is the Component's width, plus
		 * its padding.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @return {Number}
		 */
		getInnerWidth : function() {
			return this.$el.innerWidth();
		},
		
		
		/**
		 * Returns the outer width of the Component. The outer width of the Component is the Component's width, plus
		 * its padding, plus its border width. Provide the optional argument `includeMargin` as true to include the margin
		 * as well.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @param {Boolean} [includeMargin=false]
		 * @return {Number}
		 */
		getOuterWidth : function( includeMargin ) {
			return this.$el.outerWidth( includeMargin || false );  // must pass boolean arg (at least for jQuery 1.9.1)
		},
	
		
		/**
		 * Sets the height of the element.
		 *
		 * @param {Number/String} height The height. If a number, assumes pixels, otherwise uses the exact string.
		 */
		setHeight : function( height ) {
			this.setSize( undefined, height );
		},
		
	
		/**
		 * Returns the height of the Component. 
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 *
		 * @return {Number}
		 */
		getHeight : function() {
			return this.$el.height();
		},
		
		
		/** 
		 * Returns the inner height of the Component. The inner height of the Component is the Component's height, plus
		 * its padding.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @return {Number}
		 */
		getInnerHeight : function() {
			return this.$el.innerHeight();
		},
		
		
		/** 
		 * Returns the outer height of the Component. The outer height of the Component is the Component's height, plus
		 * its padding, plus its border width. Provide the optional argument `includeMargin` as true to include the margin
		 * as well.
		 * 
		 * Note: this may only be called after the component has been {@link #method-render rendered}.
		 * 
		 * @param {Boolean} [includeMargin=false]
		 * @return {Number}
		 */
		getOuterHeight : function( includeMargin ) {
			return this.$el.outerHeight( includeMargin || false );  // must pass boolean arg (at least for jQuery 1.9.1)
		},
	
		
		/**
		 * Returns the configured width of the component.
		 *
		 * @return {Number}
		 */
		getConfiguredWidth : function() {
			return this.width;
		},
	
		
		/**
		 * Returns the configured height of the component.
		 *
		 * @return {Number}
		 */
		getConfiguredHeight : function() {
			return this.height;
		},
		
		
		/**
		 * Retrieves the width of the padding for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right padding 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the padding for the given `sides`.
		 */
		getPadding : function( sides ) {
			return Css.getPadding( this.$el, sides );
		},	
		
		
		/**
		 * Retrieves the width of the margin for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right margin 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the margin for the given `sides`.
		 */
		getMargin : function( sides ) {
			return Css.getMargin( this.$el, sides );
		},
		
		
		/**
		 * Retrieves the width of the border for the given `sides` of the component's {@link #$el element}. 
		 * `sides` can be either 't', 'r', 'b', 'l' for "top", "right", "bottom", or "left", *or* it can be a 
		 * combination of more than one to add the widths together. Ex: 'lr' would add the left and right border 
		 * together and return that number.
		 * 
		 * Note: This method can only be run after the Component has been {@link #rendered}.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The width of the border for the given `sides`.
		 */
		getBorderWidth : function( sides ) {
			return Css.getBorderWidth( this.$el, sides );
		},
		
		
		/**
		 * Retrieves the "frame" size of the component's {@link #$el element}, which is the sum of the width of the padding, margin, and border, 
		 * for the given `sides` of the `element`. `sides` can be either 't', 'r', 'b', or 'l' (for "top", "right", "bottom", or "left"), *or* 
		 * it can be a combination of more than one to add the padding widths together. Ex: 'rl' would add the right and left padding/border/margin 
		 * together and return that number.
		 * 
		 * @param {String} sides 't', 'r', 'b', 'l', or a combination of multiple sides put together. Ex: 'lr'. 
		 *   See the description in this method.
		 * @return {Number} The sum total of the width of the border, plus padding, plus margin, for the given `sides`.
		 */
		getFrameSize : function( sides ) {
			return Css.getFrameSize( this.$el, sides );
		},
	
		
		// ------------------------------------
		
		
		/**
		 * Convenience method to show or hide the Component using a boolean.
		 * 
		 * @param {Boolean} visible True to show the Component, false to hide it.
		 * @return {gui.Component} This Component, to allow method chaining.
		 */
		setVisible : function( visible ) {
			return this[ visible ? 'show' : 'hide' ]();
		},
		
		
		/**
		 * Shows the Component. 
		 *
		 * @param {Object} [options] An object which may contain the following options:
		 * @param {Object} [options.anim] An {@link gui.anim.Animation Animation} config object (minus the 
		 *   {@link gui.anim.Animation#target target} property) for animating the showing of the Component. 
		 *   Note that this will only be run if the Component is currently {@link #rendered}.
		 * @chainable
		 */
		show : function( options ) {
			// If the Component is currently visible, or a 'beforeshow' handler returned false, simply return out.
			if( !this.hidden || this.fireEvent( 'beforeshow', this ) === false )
				return this;
			
			// set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested 
			// for in the render() method to determine if the Component should be rendered hidden or not.
			this.hidden = false;
			
			if( this.rendered ) {
				options = options || {};
				
				// If the Component is currently in the process of being animated to its hidden state when the call to this method 
				// is made, finish it up so we can open it again.
				if( this.hiding ) {
					this.currentAnimation.end();  // ends the "hiding" animation, and runs onHideComplete()
				}
				
				this.showing = true;  // will only be true while any show animation is running
				this.onBeforeShow( options );  // call hook method
				
				// make sure the element is displayed. This is done even for animations, which will always need
				// to display the element in some way first before animating size, opacity, etc
				this.$el.show();
				
				// Call template method, and fire the events. These are done before the animation is complete. See the 'show' and 
				// 'aftershow' event descriptions for details on why this is done now, instead of when the animation (if any) 
				// is complete.
				this.onShow( options );
				this.fireEvent( 'showbegin', this );
				this.fireEvent( 'show', this );
				
				// If a show animation was specified, run that now. Otherwise, simply show the element
				var animConfig = options.anim;  // Note: setting this after the onBeforeShow() hook method has executed, to give it a chance to modify the `anim` option
				if( animConfig ) {
					animConfig = _.assign( {}, animConfig, { target: this } );  // the `animConfig` provides defaults. We specify the target explicitly.
					
					var anim = this.currentAnimation = new Animation( animConfig );
					anim.on( 'complete', _.partial( this.onShowComplete, options ), this );  // adding a listener instead of providing in config, in case there is already a listener in the config
					anim.start();
				} else {
					this.onShowComplete( options );
				}
			}
			
			return this;
		},
	
	
		/**
		 * Private method that handles when the Component has been fully shown. This may be delayed from the call to {@link #method-show} 
		 * if an animation was run, or may be called immediately (synchronously) if not. Sets private properties to the state they 
		 * should be in when the Component has been fully shown, calls the {@link #onAfterShow} hook method, and fires the 
		 * {@link #aftershow} event.
		 *
		 * @private
		 * @template
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShowComplete : function( options ) {
			this.showing = false;
			this.currentAnimation = null;  // remove the reference to the "showing" animation
			
			this.onAfterShow( options );
			this.fireEvent( 'aftershow', this );
		},
		
		
		/**
		 * Hook method that is run before the Component has been shown (before an animation has started, if any).
		 *
		 * @protected
		 * @template
		 * @method onBeforeShow
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onBeforeShow : Gui.emptyFn,
		
		
		/**
		 * Hook method for handling the component being shown. This will only be called when the 
		 * Component is shown after it is rendered. Note that this method is called immediately after
		 * any animation is started by providing the `animConfig` argument to {@link #method-show}.
		 * 
		 * @protected
		 * @template
		 * @method onShow
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onShow : Gui.emptyFn,
		
		
		/**
		 * Hook method that is run when the Component has been fully shown. This may be delayed from the call to {@link #method-show} 
		 * if an animation was run, or may be called immediately (synchronously) if not. 
		 *
		 * @protected
		 * @template
		 * @method onAfterShow
		 * @param {Object} options The options object which was originally provided to the {@link #method-show} method.
		 */
		onAfterShow : Gui.emptyFn,
		
		
		
		/**
		 * Hides the Component.
		 *
		 * @param {Object} [options] An object which may contain the following options:
		 * @param {Object} [options.anim] An {@link gui.anim.Animation Animation} config object (minus the 
		 *   {@link gui.anim.Animation#target target) property) for animating the showing of the Component. 
		 *   Note that this will only be run if the Component is currently {@link #rendered}.
		 * @chainable
		 */
		hide : function( options ) {
			// If the Component is currently hidden, or a 'beforehide' handler returned false, simply return out.
			if( this.hidden || this.fireEvent( 'beforehide', this ) === false )
				return this;
			
			// set flag regardless of if the Component is rendered or not. If not yet rendered, this flag will be tested 
			// for in the render() method to determine if the Component should be rendered hidden or not.
			this.hidden = true;
			
			if( this.rendered ) {
				options = options || {};
				
				// If the Component is currently in the process of being animated to its shown (visible) state when the call to this 
				// method is made, finish it up so we can open it again.
				if( this.showing ) {
					this.currentAnimation.end();  // ends the "showing" animation, and runs onShowComplete()
				}
				
				this.hiding = true;  // will only be true while any hide animation is running
				this.onBeforeHide( options );  // call hook method
				
				this.fireEvent( 'hidebegin', this );
				
				// If a show animation was specified, run that now. Otherwise, simply show the element
				var animConfig = options.anim;  // Note: setting this after the onBeforeShow() hook method has executed, to give it a chance to modify the `anim` option
				if( animConfig ) {
					animConfig = _.assign( {}, animConfig, { target: this } );  // the `animConfig` provides defaults. We specify the target explicitly.
					
					var anim = this.currentAnimation = new Animation( animConfig );    
					anim.on( 'complete', _.partial( this.onHideComplete, options ), this );  // adding a listener instead of providing in config, in case there is already a listener in the config
					anim.start();
				} else {
					this.onHideComplete( options );
				}				
			}
			
			return this;
		},
	
	
		/**
		 * Private method that is run when the Component has fully hidden. This may be delayed from the call to {@link #method-hide} if a
		 * animation is run, or may be called immediately if not. Hides the Component (if it is not already hidden), runs the 
		 * {@link #onHide} hook method, and fires the {@link #event-hide} event.
		 *
		 * @private
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onHideComplete : function( options ) {
			this.hiding = false;
			this.currentAnimation = null;  // remove the reference to the "hiding" animation
			
			this.$el.hide();   // make sure the element is hidden at this point
			
			// Run hook methods, and fire the 'hide' events
			this.onHide( options );
			this.fireEvent( 'hide', this );
			this.onAfterHide( options );          // maintains consistency with having an `onAfterShow()` method
			this.fireEvent( 'afterhide', this );  // maintains consistency with having an `aftershow` event
		},
		
		
		/**
		 * Hook method that is run just before the Component it to be hidden (before an animation has started, if any).
		 *
		 * @protected
		 * @template
		 * @method onBeforeHide
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onBeforeHide : Gui.emptyFn,
		
		
		/**
		 * Hook method that is run when the Component has fully hidden. This will only be called when the Component is hidden after it 
		 * is rendered. This may be delayed from the call to {@link #method-hide} if a animation is run, or may be called immediately 
		 * if not.
		 * 
		 * @protected
		 * @template
		 * @method onHide
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onHide : Gui.emptyFn,
	
	
		/**
		 * Hook method that is run when the Component has fully hidden. This will only be called when the Component is hidden after it 
		 * is rendered. This may be delayed from the call to {@link #method-hide} if a animation is run, or may be called immediately 
		 * if not.
		 *
		 * @protected
		 * @template
		 * @method onAfterHide
		 * @param {Object} options The options object which was originally provided to the {@link #method-hide} method.
		 */
		onAfterHide : Gui.emptyFn,
		
		
		/**
		 * Determines if the Component is hidden.
		 * 
		 * If the `checkDom` flag is not passed or is `false`, then this method simply returns the value of the {@link #property-hidden}
		 * flag. If the `checkDom` flag is passed as true, this method tests for the Component's element visibility, and will 
		 * return true if 1) the element itself is set as "display: none", 2) a parent element of the Component is set to 
		 * `display: none;`, or 3) the element is not attached to the document.
		 * 
		 * @param {Boolean} [checkDom=false] `true` to also interrogate the DOM to see if the Component is hidden to the user
		 *   (i.e. the element is not attached to the DOM, or its CSS `display` property is set to 'none'). If this argument is 
		 *   provided as `true`, and the component is not yet {@link #method-render rendered}, then this method will always return 
		 *   `true` (as an unrendered component can't be visible, and therefore must be hidden).
		 * @return {Boolean} `true` if the Component is hidden, `false` otherwise.
		 */
		isHidden : function( checkDom ) {
			if( this.hidden ) {  // quick test: if the component's flag says it's hidden, immediately return true
				return true;
				
			} else {
				// `hidden` flag is false, check other conditions
				if( !this.rendered ) {
					return ( checkDom ) ? true : false;  // `hidden` flag is false, and if checkDom flag is passed as true, we want to return true (as the Component must be hidden if it is not yet rendered into the DOM)
					
				} else {
					return ( checkDom ) ? !this.isDomVisible() : false;  // not checking the DOM, return the state of the flag (which must be false at this point)
				}
			}
		},
		
		
		/**
		 * Tests to see if the Component is visible.
		 * 
		 * If the `domVisible` flag is not passed or is `false`, then this method simply returns the opposite state of the internal
		 * {@link #property-hidden} flag. If the `domVisible` flag is passed as true, this method tests for the Component's element visibility, 
		 * and will return false if 1) the element itself is set as "display: none", 2) a parent element of the Component is set to 
		 * `display: none;`, or 3) the element is not attached to the document.
		 * 
		 * @param {Boolean} [domVisible=true] `true` to also interrogate the DOM to see if the Component is visible to the user
		 *   (i.e. the element is attached to the DOM, and its CSS `display` property is something other than 'none'). If this argument 
		 *   is provided as `true`, and the component is not yet {@link #method-render rendered}, then this method will always return 
		 *   `false` (as an unrendered component can't be visible).
		 * @return {Boolean} `true` if the Component is visible, `false` otherwise.
		 */
		isVisible : function( checkDom ) {
			return !this.isHidden( checkDom );
		},
		
		
		/**
		 * Utility method which determines if the Component's {@link #$el element} is visible in the DOM. Runs an 
		 * algorithm to check:
		 * 
		 * 1. If the {@link #$el element} is attached to the DOM.
		 * 2. If the {@link #$el element} itself is not `display: none;`
		 * 3. If any of the {@link #$el element's} parent elements are `display: none;`
		 * 
		 * For most cases, one would want to use {@link #isVisible} instead.
		 * 
		 * @protected
		 * @return {Boolean} `true` if the Component's {@link #$el element} is visible in the DOM, false otherwise.
		 *   If the component is not rendered, returns false immediately.
		 */
		isDomVisible : function() {
			if( !this.isRendered() )
				return false;  // can't be DOM visible if it's not rendered
			
			
			var $el = this.$el;
			
			// NOTE: Cannot simply use the jQuery :hidden selector. jQuery determines if an element is hidden by if it
			// has any computed height or width > 0. The Component's element can be shown, but if it's not taking up 
			// any space because it has no content, it would still be considered hidden by jQuery. We instead want to see
			// if the Component, or any of its ancestor elements are hidden via "display: none", to determine if it's hidden.
			// The Component must also be attached to the document to be considered "shown".
			//return $el.is( ':hidden' );  -- intentionally left here as a reminder not to use
			
			// Find out if the component itself, or any of its ancestor elements has "display: none".
			if( $el.css( 'display' ) === 'none' ) {    // slight optimization by testing the Component's element itself first, before grabbing parent elements to test
				return false;
				
			} else {
				var $parents = $el.parents(),
				    numParents = $parents.length;
				
				// If the element is not attached to the document (it has no parents, or the top level ancestor is not the <html> tag), then it must be hidden
				if( numParents === 0 || $parents[ numParents - 1 ].tagName.toLowerCase() !== 'html' ) {
					return false;
				}

				// Element is attached to the DOM, check all parents for one that is not displayed
				for( var i = 0, len = $parents.length; i < len; i++ ) {
					if( $parents.eq( i ).css( 'display' ) === 'none' ) {
						return false;
					}
				}
			}
			
			// Passed checks, element must not be hidden (i.e. must be visible)
			return true;
		},
		
		
		/**
		 * Detaches the Component from the DOM, if it is currently rendered and in the DOM. This method can be used
		 * for performance reasons, to completely remove the element from the DOM when it is unnecessary for the 
		 * Component to be in it.
		 * 
		 * The Component may be re-attached to the DOM by calling {@link #method-render} again on it (with the new container
		 * element to append/insert it into).
		 */
		detach : function() {
			if( this.rendered ) {
				this.$el.detach();
			}
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Masks the component with a {@link gui.Mask}. Uses the default mask configuration provided by the {@link #maskConfig} 
		 * configuration object, or optionally, the provided `maskConfig` argument.
		 * 
		 * @param {Object} maskConfig (optional) The explicit configuration options to set the {@link gui.Mask} that will mask 
		 *   over the Component. If not provided, will use the default options provided by the {@link #maskConfig} configuration 
		 *   option.
		 */
		mask : function( maskConfig ) {
			maskConfig = maskConfig || this.maskConfig;  // use the provided argument if it exists, or the defaults provided by the config option otherwise
			
			if( !this.componentMask ) {
				this.componentMask = this.createMask( _.assign( { target: this }, maskConfig ) );
			} else {
				this.componentMask.resetConfig( maskConfig );
			}
			this.componentMask.show();  // if the Component has not yet been rendered, the Mask will wait for it
		},
		
		
		/**
		 * Factory method used to create the {@link #componentMask} for the Component.
		 * 
		 * @protected
		 * @param {Object} maskCfg The configuration options for the Mask.
		 * @return {gui.Mask}
		 */
		createMask : function( maskCfg ) {
			return new Mask( maskCfg );
		},
		
		
		/**
		 * Hides the mask (shown with the {@link #mask} method) from the Component's element.
		 */
		unmask : function() {
			if( this.componentMask ) this.componentMask.hide();  // note: if there is no `componentMask`, then `mask()` has never been called, and we don't need to do anything.
		},
		
		
		/**
		 * Hides the mask (shown with the {@link #mask} method) from the Component's element.
		 * 
		 * @deprecated 0.7.3 Use {@link #unmask} instead.
		 */
		unMask : function() {
			this.unmask();
		},
		
		
		/**
		 * Determines if the Component is currently masked. See the {@link #mask} method for details on showing the Component's mask.
		 * 
		 * @return {Boolean} `true` if the Component is currently masked, `false` otherwise.
		 */
		isMasked : function() {
			return !!this.componentMask && this.componentMask.isVisible();
		},
		
		
		/**
		 * Method that defines which element the Component's mask should be shown over. For gui.Component,
		 * this is the Component's base {@link #$el element}, but this may be redefined by subclasses.
		 * 
		 * This method is called by {@link gui.Mask} when masking a Component, to determine where the Mask's
		 * elements should be placed.
		 * 
		 * @return {jQuery}
		 */
		getMaskTarget : function() {
			return this.getEl();
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Sets the Container that owns (i.e. is a parent of) this Component.
		 * 
		 * @param {gui.Container} container
		 */
		setParentContainer : function( container ) {
			this.parentContainer = container;
		},
		
		
		/**
		 * Gets the Container that owns (i.e. is a parent of) this Component.
		 * 
		 * @return {gui.Container} The Container that owns this Component, or null if there is none.
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
		 * Finds a {@link gui.Container Container} above this Component at any level by a custom function. If the passed function returns
		 * true, the {@link gui.Container Container} will be returned.
		 * 
		 * @param {Function} fn The custom function to call with the arguments (Container, this Component).
		 * @return {gui.Container} The first Container for which the custom function returns true.
		 */
		findParentBy : function( fn ) {
			for( var p = this.parentContainer; (p !== null) && !fn( p, this ); p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Finds a {@link gui.Container Container} above this Component at any level by {@link #id}.  If there is no parent Container
		 * with the supplied `id`, this method returns null.
		 * 
		 * @param {String} id The {@link #id} of the parent Container to look for.
		 * @return {gui.Container} The first Container which matches the supplied {@link #id}.
		 *   If no Container for the supplied {@link #id} is found, this method returns null.
		 */
		findParentById : function( id ) {
			for( var p = this.parentContainer; p && p.id !== id; p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Finds the closest {@link gui.Container Container} above this Component by Container `type`.  The Container `type` can be either
		 * the type name that is registered to the {@link gui.ComponentManager ComponentManager} (see the description of this class), or the JavaScript
		 * class (constructor function) of the Container.
		 * 
		 * @param {Function} type The type name registered with the {@link gui.ComponentManager ComponentManager}, or the constructor function (class) of the Container.
		 * @return {gui.Container} The first Container which is an instance of the supplied type. 
		 */
		findParentByType : function( type ) {
			if( typeof type === 'string' ) {
				type = require( 'gui/ComponentManager' ).getType( type );
				
				// No type found for the given type name, return null immediately
				if( !type ) {
					return null;
				}
			}
			
			// Find the parent by type (js class / constructor function)
			for( var p = this.parentContainer; p && !(p instanceof type); p = p.parentContainer );  // intentional semicolon, loop does the work
			return p || null;
		},
		
		
		/**
		 * Determines if this Component is a descendent of the provided `container`.
		 * 
		 * @param {gui.Container} container
		 * @return {Boolean} `true` if the Component is a descendant of the `container`, otherwise `false`.
		 */
		isDescendantOf : function( container ) {
			for( var p = this.parentContainer; p && p !== container; p = p.parentContainer );  // intentional semicolon, loop does the work
			return !!p;
		},
		
		
		// -------------------------------------
		
		
		/**
		 * Destroys the Component. Frees (i.e. deletes) all references that the Component held to HTMLElements or jQuery wrapped sets
		 * (so as to prevent memory leaks) and removes them from the DOM, removes the Component's {@link #componentMask mask} if it 
		 * has one, purges all event {@link #listeners} from the object, and removes the Component's element ({@link #$el}) from the 
		 * DOM, if the Component is rendered.
		 *
		 * Fires the {@link #beforedestroy} event, which a handler can return false from to cancel the destruction process,
		 * and the {@link #event-destroy} event.
		 */
		destroy : function() {
			if( !this.destroyed && this.fireEvent( 'beforedestroy', this ) !== false ) {
				this.destroying = true;
				
				// Run template method for subclasses first, to allow them to handle their processing
				// before the Component's element is removed
				this.onDestroy();
				
				// If the Component is currently animating, end it
				if( this.currentAnimation ) {
					this.currentAnimation.end();
				}
				
				// Destroy the mask, if one was instantiated by a call to mask()
				if( this.componentMask ) {
					this.componentMask.destroy();
				}
				
				// Remove any HTMLElement or jQuery wrapped sets used by the Component from the DOM, and free 
				// the references so that we prevent memory leaks.
				// Note: This includes the Component's $el reference (if it has been created by the Component being rendered).
				for( var prop in this ) {
					if( this.hasOwnProperty( prop ) ) {
						var propValue = this[ prop ];
						
						if( _.isElement( propValue ) ) {
							// First, wrap the raw HTMLElement in a jQuery object, for easy removal. Then delete the reference.
							jQuery( propValue ).remove();
							delete this[ prop ];
						} else if( propValue instanceof jQuery ) {
							propValue.remove();
							delete this[ prop ];
						}
					}
				}
				
				this.rendered = false;  // the Component is no longer rendered; it's $el has been removed (above)
				this.destroying = false;
				this.destroyed = true;
				this.fireEvent( 'destroy', this );
				this.purgeListeners();  // Note: Purge listeners must be called after 'destroy' event fires!
			}
		},
		
		
		/**
		 * Template method for subclasses to extend that is called during the Component's destruction process.
		 * 
		 * @protected
		 * @method onDestroy
		 */
		onDestroy : Gui.emptyFn,
		
		
		/**
		 * Determines if the Component has been destroyed.
		 * 
		 * @return {Boolean} `true` if the Component has been {@link #method-destroy destroyed}, `false` otherwise.
		 */
		isDestroyed : function() {
			return this.destroyed;
		}
	
	} );
	
	
	// NOTE: Due to circular dependency issues with RequireJS, ComponentManager automatically registers this class with
	// the type string 'component'. Leaving below line commented as a reminder. Even if we add an async require() call here,
	// it is possible that the Component class is still not registered in time for use.
	//ComponentManager.registerType( 'component', Component );   -- leave as reminder

	return Component;
	
} );
