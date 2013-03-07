/*
 * Picker Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.2.8
 *
 * Copyright © 2012 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
 
if (jQuery) (function($) {
	
	// Default Options
	var options = {
		customClass: ""
	};
	
	// Public Methods
	var pub = {
		
		// Set Defaults
		defaults: function(opts) {
			options = $.extend(options, opts || {});
			return $(this);
		},
		
		// Disable field
		disable: function() {
			return $(this).each(function(i) {
				var $input = $(this),
					$picker = $input.parent(".picker");
				
				$input.prop("disabled", true);
				$picker.addClass("disabled");
			});
		},
		
		// Enable field
		enable: function() {
			return $(this).each(function(i) {
				var $input = $(this),
					$picker = $input.parent(".picker");
				
				$input.prop("disabled", false);
				$picker.removeClass("disabled");
			});
		},
		
		// Destroy picker
		destroy: function() {
			return $(this).each(function(i) {
				var $input = $(this),
					$picker = $input.parent(".picker"),
					$handle = $picker.find(".picker-handle"),
					$label = $("label[for=" + $input.attr("id") + "]");
				
				// Restore DOM / Unbind click events
				$picker.off(".picker");
				$handle.remove();
				$input.off(".picker")
					  .removeClass("picker-element")
					  .unwrap();
				$label.removeClass("picker-label");
			});
		}
	};
	
	// Private Methods
	
	// Initialize
	function _init(opts) {
		opts = opts || {};
		
		// Define settings
		var settings = $.extend({}, options, opts);
		
		// Apply to each element
		return $(this).each(function(i) {
			var $input = $(this);
			
			if (!$input.data("picker")) {
				var $label = $("label[for=" + $input.attr("id") + "]"),
					$merged = $($.merge($.merge([], $input), $label)),
					type = $input.attr("type"),
					typeClass = "picker-" + (type == "radio" ? "radio" : "checkbox"),
					group = $input.attr("name");
				
				// Modify DOM
				$merged.wrapAll('<div class="picker ' + typeClass + ' ' + settings.customClass + '" />');
				
				$input.addClass("picker-element")
					  .after('<div class="picker-handle"><div class="picker-flag" /></div>');
				$label.addClass("picker-label");
				
				// Store plugin data
				var $picker = $input.parent(".picker");
				var $handle = $picker.find(".picker-handle");
				
				// Check checked
				if ($input.is(":checked")) {
					$picker.addClass("checked");
				}
				
				// Check disabled
				if ($input.is(":disabled")) {
					$picker.addClass("disabled");
				}
				
				var data = $.extend({
					$picker: $picker,
					$input: $input,
					$handle: $handle,
					$label: $label,
					group: group,
					isRadio: (type == "radio"),
					isCheckbox: (type == "checkbox")
				}, settings);
				
				// Bind click events
				$input.on("focus.picker", data, _onFocus)
					  .on("blur.picker", data, _onBlur)
					  .on("change.picker", data, _onChange)
					  .on("deselect.picker", data, _onDeselect);
				
				$picker.on("click.picker", ".picker-handle", data, _onClick)
					   .data("picker", data);
			}
		});
	}
	
	// Handle click
	function _onClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		if (!data.$input.is(":disabled")) {
			// Change events fire before we change the val
			if (data.$input.is(":checked")) {
				if (!data.isRadio) {
					_onDeselect(e);
				}
			} else {
				_onSelect(e);
			}
		}
	}
	
	// Handle change
	function _onChange(e, internal) {
		if (!internal) {
			var data = e.data;
			
			if (!data.$input.is(":disabled")) {
				// Change events fire after val has changed
				if (data.$input.is(":checked")) {
					_onSelect(e, true);
				} else {
					_onDeselect(e, true);
				}
			}
		}
	}
	
	// Handle select
	function _onSelect(e, internal) {
		var data = e.data;
		
		if (typeof data.group !== "undefined" && data.isRadio) {
			$('input[name="' + data.group + '"]').not(data.$input).trigger("deselect");
		}
		
		data.$input.prop("checked", true);
		data.$picker.addClass("checked");
		
		if (!internal) {
			data.$input.trigger("change", [ true ]);
		}
	}
	
	// Handle deselect
	function _onDeselect(e, internal) {
		var data = e.data;
		
		data.$input.prop("checked", false);
		data.$picker.removeClass("checked");
		
		if (!internal) {
			data.$input.trigger("change", [ true ]);
		}
	}
	
	// Handle focus
	function _onFocus(e) {
		e.data.$picker.addClass("focus");
	}
	
	// Handle blur
	function _onBlur(e) {
		e.data.$picker.removeClass("focus");
	}
	
	// Define Plugin
	$.fn.picker = function(method) {
		if (pub[method]) {
			return pub[method].apply(this, Array.prototype.slice.call(arguments, 1));
		} else if (typeof method === 'object' || !method) {
			return _init.apply(this, arguments);
		}
		return this;
	};
})(jQuery);
