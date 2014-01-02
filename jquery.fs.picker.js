/* 
 * Picker v0.5.1 - 2014-01-02 
 * A jQuery plugin for replacing default checkboxes and radios. Part of the formstone library. 
 * http://www.benplum.com/formstone/picker/ 
 * 
 * Copyright 2014 Ben Plum; MIT Licensed 
 */ 

/** 
 * @plugin 
 * @name Picker 
 * @description A jQuery plugin for replacing default checkboxes and radios. Part of the formstone library. 
 * @version 0.5.1 
 */ 

;(function ($, window) {
	"use strict";
	
	/**
	 * @options
	 * @param customClass [string] <''> "Class applied to instance"
	 * @param toggle [boolean] <false> "Render 'toggle' styles"
	 * @param labelOn [string] <'ON'> "Label for 'On' position; 'toggle' only"
	 * @param labelOff [string] <'OFF'> "Label for 'Off' position; 'toggle' only"
	 */
	var options = {
		customClass: "",
		toggle: false,
		labelOn: "ON",
		labelOff: "OFF"
	};
	
	var pub = {
		
		/**
		 * @method 
		 * @name defaults
		 * @description Sets default plugin options
		 * @param opts [object] <{}> "Options object"
		 * @example $(".target").picker("defaults", opts);
		 */
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		/**
		 * @method 
		 * @name disable
		 * @description Disables target instance
		 * @example $(".target").picker("disable");
		 */
		disable: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
					
				if (typeof data !== "undefined") {
					var $picker = data.$picker;
					
					$input.prop("disabled", true);
					$picker.addClass("disabled");
				}
			});
		},
		
		/**
		 * @method 
		 * @name enable
		 * @description Enables target instance
		 * @example $(".target").picker("enable");
		 */
		enable: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
					
				if (typeof data !== "undefined") {
					var $picker = data.$picker;
					
					$input.prop("disabled", false);
					$picker.removeClass("disabled");
				}
			});
		},
		
		/**
		 * @method 
		 * @name destroy
		 * @description Removes instance of plugin
		 * @example $(".target").picker("destroy");
		 */
		destroy: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
					
				if (typeof data !== "undefined") {
					var $picker = data.$picker,
						$handle = $picker.find(".picker-handle"),
						$labels = $picker.find(".picker-toggle-label"),
						$label = $("label[for=" + $input.attr("id") + "]");
					
					// Restore DOM / Unbind click events
					$picker.off(".picker");
					$handle.remove();
					$labels.remove();
					$input.off(".picker")
						  .removeClass("picker-element")
						  .data("picker", null);
					$label.removeClass("picker-label")
						  .unwrap();
				}
			});
		},
		
		/**
		 * @method 
		 * @name update
		 * @description Updates instance of plugin
		 * @example $(".target").picker("update");
		 */
		update: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
				
				if (typeof data !== "undefined" && !$input.is(":disabled")) {
					if ($input.is(":checked")) {
						_onSelect({ data: data }, true);
					} else {
						_onDeselect({ data: data }, true);
					}
				}
			});
		}
	};
	
	/**
	 * @method private
	 * @name _init
	 * @description Initializes plugin
	 * @param opts [object] "Initialization options"
	 */
	function _init(opts) {
		// Settings
		opts = $.extend({}, options, opts);
		
		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), opts);
		}
		return $items;
	}
	
	/**
	 * @method private
	 * @name _build
	 * @description Builds each instance
	 * @param $input [jQuery object] "Target jQuery object"
	 * @param opts [object] <{}> "Options object"
	 */
	function _build($input, opts) {
		if (!$input.data("picker")) {
			// EXTEND OPTIONS
			opts = $.extend({}, opts, $input.data("picker-options"));
			
			var $label = $("label[for=" + $input.attr("id") + "]"),
				type = $input.attr("type"),
				typeClass = "picker-" + (type === "radio" ? "radio" : "checkbox"),
				group = $input.attr("name"),
				html = '<div class="picker-handle"><div class="picker-flag" /></div>';
			
			if (opts.toggle) {
				typeClass += " picker-toggle";
				html = '<span class="picker-toggle-label on">' + opts.labelOn + '</span><span class="picker-toggle-label off">' + opts.labelOff + '</span>' + html;
			}
			
			// Modify DOM
			$input.addClass("picker-element");
			$label.wrap('<div class="picker ' + typeClass + ' ' + opts.customClass + '" />')
				  .before(html)
				  .addClass("picker-label");
			
			// Store plugin data
			var $picker = $label.parents(".picker"),
				$handle = $picker.find(".picker-handle"),
				$labels = $picker.find(".picker-toggle-label");
			
			// Check checked
			if ($input.is(":checked")) {
				$picker.addClass("checked");
			}
			
			// Check disabled
			if ($input.is(":disabled")) {
				$picker.addClass("disabled");
			}
			
			$.extend(opts, {
				$picker: $picker,
				$input: $input,
				$handle: $handle,
				$label: $label,
				$labels: $labels,
				group: group,
				isRadio: (type === "radio"),
				isCheckbox: (type === "checkbox")
			});
			
			// Bind click events
			$input.on("focus.picker", opts, _onFocus)
				  .on("blur.picker", opts, _onBlur)
				  .on("change.picker", opts, _onChange)
				  .on("deselect.picker", opts, _onDeselect)
				  .data("picker", opts);
			
			$picker.on("click.picker", opts, _onClick);
		}
	}
	
	/**
	 * @method private
	 * @name _onClick
	 * @description Handles instance clicks
	 * @param e [object] "Event data"
	 */
	function _onClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		if (!$(e.target).is(data.$input)) {
			data.$input.trigger("click");
		}
	}
	
	/**
	 * @method private
	 * @name _onChange
	 * @description Handles external changes
	 * @param e [object] "Event data"
	 */
	function _onChange(e) {
		//if ($(e.currentTarget).parents(".picker").length === 0) {
		//	e.stopPropagation();
		//}
		
		var data = e.data;
		
		if (!data.$input.is(":disabled")) {
			// Checkbox change events fire after state has changed
			var checked = data.$input.is(":checked");
			if (data.isCheckbox) {
				if (checked) {
					_onSelect(e, true);
				} else {
					_onDeselect(e, true);
				}
			} else {
				// radio
				if (checked) {
					_onSelect(e);
				}
			}
		}
	}
	
	/**
	 * @method private
	 * @name _onSelect
	 * @description Changes input to "checked"
	 * @param e [object] "Event data"
	 * @param internal [boolean] "Internal update flag"
	 */
	function _onSelect(e, internal) {
		var data = e.data;
		
		if (typeof data.group !== "undefined" && data.isRadio) {
			$('input[name="' + data.group + '"]').not(data.$input).trigger("deselect");
		}
		
		data.$picker.addClass("checked");
	}
	
	/**
	 * @method private
	 * @name _onDeselect
	 * @description Changes input from "checked"
	 * @param e [object] "Event data"
	 * @param internal [boolean] "Internal update flag"
	 */
	function _onDeselect(e, internal) {
		var data = e.data;
		
		data.$picker.removeClass("checked");
	}
	
	/**
	 * @method private
	 * @name _onFocus
	 * @description Handles instance focus
	 * @param e [object] "Event data"
	 */
	function _onFocus(e) {
		e.data.$picker.addClass("focus");
	}
	
	/**
	 * @method private
	 * @name _onBlur
	 * @description Handles instance blur
	 * @param e [object] "Event data"
	 */
	function _onBlur(e) {
		e.data.$picker.removeClass("focus");
	}
	
	$.fn.picker = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);
