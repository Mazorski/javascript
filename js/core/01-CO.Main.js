window.CO = window.CO || {
	Types: {}
};

(function ($) {

	var _elementRemovedEvents = {};

	var _elementGuids = {};

	var __createGuid = function () {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) { var r = Math.random() * 16 | 0, v = c == 'x' ? r : r & 0x3 | 0x8; return v.toString(16); }).toUpperCase();
	};

	var __elementGuid = function (element) {
		var guid = $(element).data('guid');
		if (!guid) {
			$(element).data('guid', guid = __createGuid());
			_elementGuids[guid] = element;
		}

		return guid;
	};

	Array.prototype.toDictionary = function (keyProperty) {
		var dictionary = {};
		for (var i = 0; i < this.length; i++) {
			dictionary[ko.unwrap(this[i][keyProperty])] = this[i];
		}
		return dictionary;
	};

	CO.TypeName = function type(obj) {
		return Object.prototype.toString.call(obj).slice(8, -1);
	};

	CO.ElementGuid = __elementGuid;

	CO.ElementByGuid = function (guid) { return _elementGuids[guid]; };

	CO.ElementRemoved = function (element, handler) {
		$(element).on('removed', function (e) {
			if (e.target === element) { handler(e); }
		});
	};

	$(function () {
		$(document).on("DOMNodeRemoved", function (e) {
			$(e.target).trigger('removed');
		});
	});
})(jQuery);