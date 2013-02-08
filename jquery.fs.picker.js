/*
 * Picker Plugin [Formstone Library]
 * @author Ben Plum
 * @version 0.2.5
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
			var $items = $(this);
			for (var i = 0, count = $items.length; i < count; i++) {
				var $input = $items.eq(i);
				var $picker = $input.parent(".picker");
				
				$input.prop("disabled", true);
				$picker.addClass("disabled");
			}
			return $items;
		},
		
		// Enable field
		enable: function() {
			var $items = $(this);
			for (var i = 0, count = $items.length; i < count; i++) {
				var $input = $items.eq(i);
				var $picker = $input.parent(".picker");
				
				$input.prop("disabled", false);
				$picker.removeClass("disabled");
			}
			return $items;
		},
		
		// Destroy picker
		destroy: function() {
			var $items = $(this);
			for (var i = 0, count = $items.length; i < count; i++) {
				var $input = $items.eq(i);
				var $label = $("label[for=" + $input.attr("id") + "]");
				var $picker = $input.parent(".picker");
				var $handle = $picker.find(".picker-handle");
				
				// Restore DOM / Unbind click events
				$picker.off(".picker");
				$handle.remove();
				$input.off(".picker")
					  .removeClass("picker-element")
					  .unwrap();
				$label.removeClass("picker-label");
			}
			return $items;
		}
	};
	
	// Private Methods
	
	// Initialize
	function _init(opts) {
		opts = opts || {};
		
		// Define settings
		var settings = $.extend({}, options, opts);
		
		// Apply to each element
		var $items = $(this);
		for (var i = 0, count = $items.length; i < count; i++) {
			_build($items.eq(i), settings);
		}
		return $items;
	}
	
	// Build each
	function _build($input, opts) {
		if (!$input.data("picker")) {
			var $label = $("label[for=" + $input.attr("id") + "]");
			var type = $input.attr("type");
			var typeClass = "picker-" + (type == "radio" ? "radio" : "checkbox");
			var group = $input.attr("name");
			
			// Modify DOM
			var $merged = $($.merge($.merge([], $input), $label));
			$merged.wrapAll('<div class="picker ' + typeClass + ' ' + opts.customClass + '" />');
			
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
			}, opts);
			
			// Bind click events
			$input.on("focus.picker", data, _onFocus)
				  .on("blur.picker", data, _onBlur)
				  .on("change.picker", data, _onChange)
				  .on("deselect.picker", data, _onDeselect);
			
			$picker.on("click.picker", ".picker-handle", data, _onClick)
				   .data("picker", data);
		}
	}
	
	function _onClick(e) {
		e.preventDefault();
		e.stopPropagation();
		
		var data = e.data;
		
		if (!data.$input.is(":disabled")) {
			// Change events fire before, we change the val
			if (data.$input.is(":checked")) {
				_onDeselect(e);
			} else {
				_onSelect(e);
			}
		}
	}
	
	function _onChange(e) {
		var data = e.data;
		
		if (!data.$input.is(":disabled")) {
			// Change events fire after val has changed
			if (data.$input.is(":checked")) {
				_onSelect(e);
			} else {
				_onDeselect(e);
			}
		}
	}
	
	function _onSelect(e) {
		var data = e.data;
		
		if (typeof data.group !== "undefined" && data.isRadio) {
			$('input[name="' + data.group + '"]').not(data.$input).trigger("deselect");
		}
		
		data.$input.prop("checked", true);
		data.$picker.addClass("checked");
	}
	
	function _onDeselect(e) {
		var data = e.data;
		
		data.$input.prop("checked", false);
		data.$picker.removeClass("checked");
	}
	
	function _onFocus(e) {
		var data = e.data;
		data.$picker.addClass("focus");
	}
	
	function _onBlur(e) {
		var data = e.data;
		data.$picker.removeClass("focus");
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
