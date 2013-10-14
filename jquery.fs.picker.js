/*
 * Picker Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.4.0
 *
 * Copyright © 2013 Ben Plum <mr@benplum.com>
 * Released under the MIT License <http://www.opensource.org/licenses/mit-license.php>
 */
 
if (jQuery) (function($) {
	
	// Default Options
	var options = {
		customClass: "",
		toggle: false,
		labelOn: "ON",
		labelOff: "OFF"
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
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
					
				if (typeof data != "undefined") {
					var $picker = data.$picker;
					
					$input.prop("disabled", true);
					$picker.addClass("disabled");
				}
			});
		},
		
		// Enable field
		enable: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
					
				if (typeof data != "undefined") {
					var $picker = data.$picker;
					
					$input.prop("disabled", false);
					$picker.removeClass("disabled");
				}
			});
		},
		
		// Destroy picker
		destroy: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
					
				if (typeof data != "undefined") {
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
		
		// Update field
		update: function() {
			return $(this).each(function(i, input) {
				var $input = $(input),
					data = $input.data("picker");
				
				if (typeof data != "undefined" && !$input.is(":disabled")) {
					if ($input.is(":checked")) {
						_onSelect({ data: data }, true);
					} else {
						_onDeselect({ data: data }, true);
					}
				}
			});
		}
	};
	
	// Private Methods
	
	// Initialize
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
	
	// Build 
	function _build($input, opts) {
		if (!$input.data("picker")) {
			// EXTEND OPTIONS
			opts = $.extend({}, opts, $input.data("picker-options"));
			
			var $label = $("label[for=" + $input.attr("id") + "]"),
				type = $input.attr("type"),
				typeClass = "picker-" + (type == "radio" ? "radio" : "checkbox"),
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
				isRadio: (type == "radio"),
				isCheckbox: (type == "checkbox")
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
	
	// Handle Picker click
	function _onClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		if (!$(e.target).is(data.$input)) {
			data.$input.trigger("click");
		}
	}
	
	// Handle input click
	function _onChange(e) {
		e.stopPropagation();
		
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
	
	// Handle select
	function _onSelect(e, internal) {
		var data = e.data;
		
		if (typeof data.group !== "undefined" && data.isRadio) {
			$('input[name="' + data.group + '"]').not(data.$input).trigger("deselect");
		}
		
		data.$picker.addClass("checked");
	}
	
	// Handle deselect
	function _onDeselect(e, internal) {
		var data = e.data;

		data.$picker.removeClass("checked");
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
