(function () {
	var fixWithIfBinding = function (key) {
		var bindingHandler = ko.bindingHandlers[key];
		var oldUpdate = bindingHandler.update;

		bindingHandler.update = function (element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {
			oldUpdate(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext);
			CO.UI.InitializeForms(element);
		};
	};

	fixWithIfBinding('if');
	fixWithIfBinding('ifnot');
	fixWithIfBinding('with');

	ko.subscribable.fn.asRouteArgument = function (type) {
		this.routeArgumentType = type;

		return this;
	};

	ko.subscribable.fn.asMainCollection = function (keyProperty, keyType) {
		this.mainCollectionKey = {
			property: keyProperty,
			type: keyType
		};

		return this;
	};

})();