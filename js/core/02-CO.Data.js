window.CO = window.CO || {};

function getOfType(type) {
	var result;

	for (var i = 1; i < arguments.length && result == null; i++) {
		try {
			var data = arguments[i];
			if (data != null && data.constructor === type) {
				result = data;
			}
		} catch (e) { }
	}

	return result;
}

(function ($) {
	CO.Types.DataMapping = function DataMapping(mapping) {
		var _this = this;

		this.ignore = ['__type'];

		$.extend(this, mapping);

		this.Extend = function (extension) {
			return $.extend({}, _this, extension);
		};
	}

	CO.Types.DataEngine = function DataEngine(dal, mapping) {
		var _mapping = new CO.Types.DataMapping(mapping);

		this.Mapping = _mapping;

		this.Clone = function (type, object, parent) {
			var data = ko.mapping.toJS(object);

			return new type({ parent: parent, data: data, original: object });
		};

		this.Copy = function (source, target) {
			ko.mapping.fromJS(ko.mapping.toJS(source), _mapping, target);
		};

		this.DAL = dal;

		_onDemand = {};

		$.each(dal, function (a, b) {
			_onDemand[a] = {};
			$.each(b, function (key, func) {
				var funcStr = func.toString().replace('return', 'return function () { return').replace('}', '} }');
				eval('var newFunc = ' + funcStr + ';');
				_onDemand[a][key] = newFunc;
			});
		});

		this.DAL.OnDemand = _onDemand;

		CO.Data = this;
	}
})(jQuery);