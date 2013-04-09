/*global define */
define( [
	'lodash',
	'jqc/template/Template'
], function( _, Template ) {
	
	/**
	 * @class jqc.template.LoDash
	 * @extends jqc.template.Template
	 * 
	 * A wrapper class for Lo-Dash templates which helps with a few normalization procedures, and
	 * allows for lazy compilation of a template from its string source.
	 * 
	 * This is the default template used by the framework.
	 * 
	 * For more information on Lo-Dash templates, see: [http://lodash.com/docs#template](http://lodash.com/docs#template)
	 */
	var LoDashTpl = Template.extend( {
		
		/**
		 * @cfg {Boolean} compiled
		 * 
		 * `true` to compile the Lo-Dash template immediately when the LoDashTpl is instantiated. Defaults to false,
		 * for lazy compilation (i.e. the template is only compiled when it is first used). 
		 */
		compiled : false,
		
		
		/**
		 * @protected
		 * @property {String} tplSource
		 * 
		 * The source string that will generate the {@link #compiledTplFn}. This property will only be set
		 * if the constructor is called with a string or array of strings as its first argument.
		 */
		
		/**
		 * @protected
		 * @property {Object} tplOptions
		 * 
		 * The options that will be provided to the Lo-Dash template generator function to create the 
		 * {@link #compiledTplFn}. This property will only be set if the constructor is called with a string 
		 * or array of strings as its first argument.
		 */
		
		/**
		 * @protected
		 * @property {Function} compiledTplFn
		 * 
		 * The compiled Lo-Dash template function. This is generated by the {@link #compile} function
		 * when either called directly, or when the template is first used (lazy compilation).
		 */
		
		
		
		/**
		 * @constructor
		 * @param {String/String[]/Function/jqc.template.Template} tpl A string or an array of strings which will be concatenated 
		 *   together to generate the Lo-Dash template, a compiled Lo-Dash template function, or a {@link jqc.template.Template} 
		 *   instance which will simply be returned from this constructor.
		 * @param {Object} options Any options to provide to the Lo-Dash template generator function. This argument
		 *   is only valid when the first argument to this constructor is a string or array of strings. See 
		 *   [http://lodash.com/docs#template](http://lodash.com/docs#template) for the options that are accepted.
		 *   This parameter also accepts the configuration options of this class.
		 */
		constructor : function( tpl, options ) {
			this._super( arguments );
			
			if( tpl instanceof Template ) {
				return tpl;
			} else {
				options = options || {};
				
				if( _.isString( tpl ) || _.isArray( tpl ) ) {
					this.tplSource = [].concat( tpl ).join( "" );
					this.tplOptions = _.omit( options, 'compiled' );  // omit (i.e. filter out) the config options of this class
					
					if( options.compiled )
						this.compile();
					
				} else if( tpl && tpl.source ) {  // function was provided, check for 'source' property to see if it is a compiled Lo-Dash template
					this.compiledTplFn = tpl;
				
				// <debug>
				} else {
					throw new Error( "Invalid `tpl` argument to LoDashTpl constructor" );
				// </debug>
				}
			}
		},
		
		
		/**
		 * Compiles the template, if it is not yet a compiled Lo-Dash template function. You normally do not
		 * need to call this method, as it will be called automatically when the template is first used, but
		 * this may be called to pre-compile the template. Alternatively, the {@link #compiled} configuration 
		 * option may be used when instantiating for this effect as well.
		 */
		compile : function() {
			if( !this.compiledTplFn ) {
				this.compiledTplFn = _.template( this.tplSource, null, this.tplOptions );
			}
		},
		
		
		/**
		 * Applies the given `data` object to the Lo-Dash template, and returns the result.
		 * Compiles the template if it is not yet compiled.
		 * 
		 * @param {Object} [data] The data object to apply to the template (i.e. execute the compiled template function 
		 *   with). If the template does not use any data, this may be ommitted (an empty object will be provided instead).
		 * @return {String} The result of applying the `data` object to the template.
		 */
		apply : function( data ) {
			if( !this.compiledTplFn ) {
				this.compile();
			}
			
			return this.compiledTplFn( data || {} );
		}
		
	} );
	
	return LoDashTpl;
	
} );