/**
 * @class ui.anim.Animation
 * @extends Jux.util.Observable
 * 
 * A class that encapsulates a single animation of a given HTMLElement, jQuery wrapped set, or {@link ui.Component}.
 * 
 * @constructor
 * @param {Object} config The configuration options for this Component, specified in an object (hash).
 */
/*global Class, jQuery, Jux, ui */
ui.anim.Animation = Class.extend( Jux.util.Observable, {
	
	/**
	 * @cfg {HTMLElement/jQuery/ui.Component} target (required)
	 * The target element(s) to animate. In the case of a {@link ui.Component}, the Component's {@link ui.Component#getEl getEl}
	 * method is run to retrieve the element to animate.  
	 */
	
	/**
	 * @cfg {String/Object} effect (required)
	 * One of the jQuery UI effects to use for the animation. See 
	 * <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a> for a list of
	 * effects.<br><br>
	 * 
	 * If specific options are required for the effect, this config may be specified as an object (hash) of keys/values.
	 * The key 'type' is required in this case, for the name of the effect. For a list of options for effects, see the link for the 
	 * particular {@link #effect} you are using here: <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a>, 
	 * and then scroll down to the 'Arguments' section for the additional options that can be used in this hash. Ex:
	 * <pre><code>effect : { type: 'slide', direction: 'up', mode: 'show' }</code></pre>
	 * 
	 * Note: This config is mutually exclusive with the {@link #to} config, and override it if provided.
	 */
	
	/**
	 * @cfg {Object} from
	 * A hash of CSS properties to start the animation from (i.e. these are set at the start of the animation). If
	 * none are provided, the animation animates from the element's current CSS state. 
	 */
	
	/**
	 * @cfg {Object} to (required)
	 * A hash of CSS properties to animate to. Note: this config is mutually exclusive with the {@link #effect} 
	 * config, and will be overridden if an {@link #effect} config is provided.
	 */
	
	/**
	 * @cfg {Number} duration
	 * The duration in milliseconds to run the animation.
	 */
	duration : 250,
	
	/**
	 * @cfg {String} easing
	 * The name of the easing to use to run the animation. Only used if using the {@link #to} config. For a full list 
	 * of available options, see <http://jqueryui.com/demos/effect/#easing>. 
	 */
	easing : 'linear',
	
	/**
	 * @cfg {Function} callback
	 * Callback to run when the animation is complete. This function is called with this Animation instance as its first argument.
	 */
	
	/**
	 * @cfg {Object} scope
	 * The scope to run the {@link #callback} in. Defaults to `window`.
	 */
	
	
	/**
	 * @private
	 * @property $target
	 * @type jQuery
	 * The jQuery wrapped set for the {@link #target}.
	 */
	
	/**
	 * @private
	 * @property running
	 * @type Boolean
	 * Flag to determine if the animation is currently running. Because this class's {@link #target} can be multiple elements, and
	 * because jQuery's animate() function calls its complete() callback once per each element, we need this flag to be able to set
	 * it back to false when the first complete() call is made. We don't want to run the {@link #end} method once for each element,
	 * just once for all elements as a whole.  
	 */
	running : false,
	
	/**
	 * @private
	 * @property complete
	 * @type Boolean
	 * Flag that is set to true once the animation is complete.
	 */
	complete : false,
	
	
	constructor : function( config ) {
		Jux.apply( this, config );
		
		// Call the superclass (Observable) constructor
		ui.anim.Animation.superclass.constructor.call( this );
		
		
		this.addEvents(
			/**
			 * @event beforeanimate
			 * Fires just before the animation starts. Handlers of this event may return false to
			 * prevent the animation from starting.
			 * @param {ui.anim.Animation} animation This Animation instance.
			 */
			'beforeanimate',
			
			/**
			 * @event afteranimate
			 * Fires when the animation completes.
			 * @param {ui.anim.Animation} animation This Animation instance.
			 */
			'afteranimate'
		);
		
		// Make sure there is a 'target' config, and normalize it if need be
		if( !this.target ) {
			throw new Error( "ui.anim.Animation: Error. No 'target' config provided" );
		} else if( this.target instanceof ui.Component ) {
			this.$target = jQuery( this.target.getEl() );
		} else {
			this.$target = jQuery( this.target );
		}
		delete this.target;
		
		// Make sure there is a 'to' config, or an 'effect' config
		if( !this.to && !this.effect ) {
			throw new Error( "ui.anim.Animation: Error. No 'to' or 'effect' config provided" );
		}
	},
	
	
	/**
	 * Starts the animation.
	 * 
	 * @method start
	 */
	start : function() {
		if( !this.running && !this.complete && this.fireEvent( 'beforeanimate', this ) !== false ) {
			this.running = true;
			
			// If the 'from' config was provided with CSS properties, apply them now
			if( this.from ) {
				this.$target.css( this.from );
			}
			
			// If the 'effect' config was provided, use that. Otherwise, animate to the 'to' config.
			if( this.effect ) {
				var effectType, effectOptions;
				if( typeof this.effect === 'object' ) {
					effectType = this.effect.type;
					effectOptions = this.effect;  // can just use the object itself with the 'type' property. 'type' be ignored by jQuery UI 
					
				} else {  // 'effect' was provided as a string
					effectType = this.effect;
					effectOptions = {};
				}
				
				// Run the effect
				this.$target.effect( effectType, effectOptions, this.duration, this.onLastFrame.createDelegate( this ) );
				
			} else {
				this.$target.animate( this.to, {
					duration : this.duration,
					easing   : this.easing,
					complete : this.onLastFrame.createDelegate( this )  // run the 'end' method in the scope of this class, not the DOM element that has completed its animation
				} );
			}
		}
	},
	
	
	/**
	 * Determines if the animation is currently running.
	 * 
	 * @method isRunning
	 * @return {Boolean} True if the animation is currently running, false otherwise.
	 */
	isRunning : function() {
		return this.running;
	},
	
	
	/**
	 * Determines if the animation is complete.
	 * 
	 * @method isComplete
	 * @return {Boolean} True if the animation has completed.
	 */
	isComplete : function() {
		return this.complete;
	},
	
	
	/**
	 * Pre-emptively ends the animation, if it is running, jumping the {@link #target} element(s) to their 
	 * "end of animation" state.
	 * 
	 * @method end
	 */
	end : function() {
		if( this.running ) {
			this.$target.stop( /* clearQueue */ false, /* jumpToEnd */ true );
			
			this.onLastFrame();
		}
	},
	
	
	/**
	 * Cleans up the Animation object after the last frame has been reached, and calls the {@link #callback} if one
	 * was provided.
	 * 
	 * @private
	 * @method onLastFrame
	 */
	onLastFrame : function() {
		if( this.running ) {
			// set this flag first, so stopping the animation does not enter this block again from another call to this method 
			// (in case the animation is stopped before it is complete, and we don't need it called for each element that is animated)
			this.running = false;
			this.complete = true;
			
			if( typeof this.callback === 'function' ) {
				this.callback.call( this.scope || window, this );
			}
			this.fireEvent( 'afteranimate', this );
			
			// Remove references to elements
			delete this.$target;
		}
	}
	
} );