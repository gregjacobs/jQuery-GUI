/*global define */
define( [
	'require',
	'jquery',
	'lodash',
	'Class',
	'Observable',
	'ui/Component'
], function( require, jQuery, _, Class, Observable, Component ) {
	
	/**
	 * @class ui.anim.Animation
	 * @extends Observable
	 * 
	 * A class that encapsulates a single animation of a given HTMLElement, jQuery wrapped set, or {@link ui.Component}.
	 */
	var Animation = Class.extend( Observable, {
		
		/**
		 * @cfg {HTMLElement/jQuery/ui.Component} target (required)
		 * 
		 * The target element(s) to animate. In the case of a {@link ui.Component}, the Component's {@link ui.Component#getEl getEl}
		 * method is run to retrieve the element to animate.
		 * 
		 * Note that this config is not required upon instantiation of the Animation, but must be present at the time that
		 * {@link #start} is executed. The target may be set after instantiation time using {@link #setTarget}.
		 */
		
		/**
		 * @cfg {String/Object} effect (required)
		 * 
		 * One of the jQuery UI effects to use for the animation. See 
		 * <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a> for a list of
		 * effects.
		 * 
		 * If specific options are required for the effect, this config may be specified as an object (hash) of keys/values.
		 * The key 'type' is required in this case, for the name of the effect. For a list of options for effects, see the link for the 
		 * particular {@link #effect} you are using here: <a href="http://docs.jquery.com/UI/Effects">http://docs.jquery.com/UI/Effects</a>, 
		 * and then scroll down to the 'Arguments' section for the additional options that can be used in this hash. Ex:
		 * `effect : { type: 'slide', direction: 'up', mode: 'show' }`
		 * 
		 * Note: This config is mutually exclusive with the {@link #to} config, and override it if provided.
		 */
		
		/**
		 * @cfg {Object} from
		 * 
		 * A hash of CSS properties to start the animation from (i.e. these are set at the start of the animation). If
		 * none are provided, the animation animates from the element's current CSS state. 
		 */
		
		/**
		 * @cfg {Object} to (required)
		 * 
		 * A hash of CSS properties to animate to. Note: this config is mutually exclusive with the {@link #effect} 
		 * config, and will be overridden if an {@link #effect} config is provided.
		 */
		
		/**
		 * @cfg {Number} duration
		 * 
		 * The duration in milliseconds to run the animation.
		 */
		duration : 250,
		
		/**
		 * @cfg {String} easing
		 * 
		 * The name of the easing to use to run the animation. Only used if using the {@link #to} config. For a full list 
		 * of available options, see <http://jqueryui.com/demos/effect/#easing>. 
		 */
		easing : 'linear',
		
		/**
		 * @cfg {Function} callback
		 * 
		 * Callback to run when the animation is complete. This function is called with this Animation instance as its first argument.
		 */
		
		/**
		 * @cfg {Object} scope
		 * 
		 * The scope to run the {@link #callback} in. Defaults to `window`.
		 */
		
		
		/**
		 * @private
		 * @property {jQuery} $target
		 * 
		 * The jQuery wrapped set for the {@link #target}, after being resolved by {@link #resolveTarget}.
		 */
		
		/**
		 * @private
		 * @property {Boolean} running
		 * 
		 * Flag to determine if the animation is currently running. Because this class's {@link #target} can be multiple elements, and
		 * because jQuery's animate() function calls its complete() callback once per each element, we need this flag to be able to set
		 * it back to false when the first complete() call is made. We don't want to run the {@link #end} method once for each element,
		 * just once for all elements as a whole.  
		 */
		running : false,
		
		/**
		 * @private
		 * @property {Boolean} complete
		 * 
		 * Flag that is set to true once the animation is complete.
		 */
		complete : false,
		
		
		/**
		 * @constructor
		 * @param {Object} [config] The configuration options for this instance.
		 */
		constructor : function( config ) {
			_.assign( this, config );
			
			// Call the superclass (Observable) constructor
			this._super( arguments );
			
			
			this.addEvents(
				/**
				 * Fires just before the animation starts. Handlers of this event may return false to
				 * prevent the animation from starting.
				 * 
				 * @event beforeanimate
				 * @param {ui.anim.Animation} animation This Animation instance.
				 * @preventable
				 */
				'beforeanimate',
				
				/**
				 * Fires when the animation completes.
				 * 
				 * @event afteranimate
				 * @param {ui.anim.Animation} animation This Animation instance.
				 */
				'afteranimate',
				
				/**
				 * An alias of {@link #afteranimate}, fires when the animation completes.
				 * 
				 * @event complete
				 * @param {ui.anim.Animation} animation This Animation instance.
				 */
				'complete'
			);
		},
		
		
		/**
		 * Sets the {@link #target} for the Animation. This method allows it to be set after instantiation,
		 * if the {@link #target} config was not provided.
		 * 
		 * @param {HTMLElement/jQuery/ui.Component} target The target element(s) to animate. In the case of a {@link ui.Component}, 
		 *   the Component's {@link ui.Component#getEl getEl} method is run to retrieve the element to animate.
		 * @chainable
		 */
		setTarget : function( target ) {
			this.$target = null;  // clear out any previous $target element resolution. The element will be resolved from the provided `target` when start() is executed
			
			this.target = target;
			return this;
		},
		
		
		/**
		 * Normalizes the {@link #target} config that was provided upon instantiation, or provided from
		 * {@link #setTarget}, and return the element that it refers to. If the t
		 * 
		 * @return {jQuery} The target element, wrapped in a jQuery set, or `null` if the target could not
		 *   be resolved to an element.
		 */
		resolveTarget : function() {
			var $target = this.$target || null;
			if( $target )   // already resolved the $target element, return it immediately
				return $target;
			
			// Make sure there is a 'target' config, and normalize it if need be
			var target = this.target;
			if( target ) {
				if( target instanceof require( 'ui/Component' ) ) {   // need to require() ui.Component here, because it is a circular dependency
					$target = jQuery( target.getEl() );
				} else {
					$target = jQuery( target );
				}
			}
			delete this.target;  // raw config no longer needed
			
			return ( this.$target = $target );  // cache and return the $target. If there was no `target` config, this will return null (as $target wasn't set to anything else)
		},
		
		
		/**
		 * Starts the animation. The {@link #target} and either a {@link #to} or {@link #effect} config must be
		 * set at this point to start the animation.
		 */
		start : function() {
			var $target = this.resolveTarget(),
			    from = this.from,
			    to = this.to,
			    effect = this.effect,
			    duration = this.duration,
			    onLastFrame = this.onLastFrame;
			
			// <debug>
			// Make sure there is a target element, and either a 'to' config or an 'effect' config
			if( !$target ) {
				throw new Error( "ui.anim.Animation.start(): Error. No `target` config provided" );
			}
			if( !to && !effect ) {
				throw new Error( "ui.anim.Animation.start(): Error. No `to` or `effect` config provided" );
			}
			// </debug>
			
			if( !this.running && !this.complete && this.fireEvent( 'beforeanimate', this ) !== false ) {
				this.running = true;
				
				// If the 'from' config was provided with CSS properties, apply them now
				if( from ) {
					$target.css( from );
				}
				
				// If the 'effect' config was provided, use that. Otherwise, animate to the 'to' config.
				if( effect ) {
					var effectType, effectOptions;
					if( typeof effect === 'object' ) {
						effectType = effect.type;
						effectOptions = effect;  // can just use the object itself with the 'type' property. 'type' be ignored by jQuery UI 
						
					} else {  // 'effect' was provided as a string
						effectType = effect;
						effectOptions = {};
					}
					
					// Run the effect
					$target.effect( effectType, effectOptions, duration, _.bind( onLastFrame, this ) );
					
				} else {
					$target.animate( to, {
						duration : duration,
						easing   : this.easing,
						complete : _.bind( onLastFrame, this )  // run the 'end' method in the scope of this class, not the DOM element that has completed its animation
					} );
				}
			}
		},
		
		
		/**
		 * Determines if the animation is currently running.
		 * 
		 * @return {Boolean} True if the animation is currently running, false otherwise.
		 */
		isRunning : function() {
			return this.running;
		},
		
		
		/**
		 * Determines if the animation is complete.
		 * 
		 * @return {Boolean} True if the animation has completed.
		 */
		isComplete : function() {
			return this.complete;
		},
		
		
		/**
		 * Pre-emptively ends the animation, if it is running, jumping the {@link #target} element(s) to their 
		 * "end of animation" state.
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
		 * @protected
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
				this.fireEvent( 'complete', this );
				
				// Remove references to elements
				delete this.$target;
			}
		}
		
	} );
	
	
	return Animation;
	
} );