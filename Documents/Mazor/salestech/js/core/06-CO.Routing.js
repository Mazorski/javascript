window.CO = window.CO || {};

(function ($) {

	var _routeMappingByRoute;
	var _routeMappingByName;
	var _routeObservables = {};

	var __isPrimitive = function (val) {
		return val == null || /^[sbn]/.test(typeof val);
	};

	var __onlyPrimitives = function (args) {
		args = Array.prototype.slice.call(args);
		var resultArgs = [];

		for (var i = 0; i < args.length; i++) {
			if (__isPrimitive(args[i])) { resultArgs.push(args[i]); }
		}

		return resultArgs;
	};

	var __mapRouteObservables = function (viewModel) {
		if (!viewModel) { return; }

		var type = CO.TypeName(viewModel);

		if (_routeObservables[type]) { return; }

		var array = _routeObservables[type] = [];

		$.each(viewModel, function (property, value) {
			if (ko.isObservable(value) && value.routeArgumentType) {
				array.push({ property: property, type: value.routeArgumentType });
			}
		});
	};

	var __bindRouteObservables = function (viewModel, route) {
		if (!viewModel) { return []; }

		var type = CO.TypeName(viewModel);

		var routeObservables = _routeObservables[type];

		var subscriptions = [];

		for (var i = 0; i < routeObservables.length; i++) {
			var routeObservable = routeObservables[i];

			subscriptions.push(viewModel[routeObservable.property].subscribe(function () {
				CO.Routing.UpdateRoute(route);
			}));
		}

		return subscriptions;
	};

	var __disposeRoute = function (route, subscriptions, view, viewRemoved, viewRemovedHandler) {

		for (var i = 0; i < subscriptions.length; i++) {
			subscriptions[i].dispose();
		}

		$(view).unbind('removed', viewRemovedHandler);

		if (viewRemoved) { CO.Routing.RemoveRoute(route); }
		else { $(view).remove(); }

	};

	var __parseRoute = function (route) {
		var key;
		var name;
		var args;

		if (route.indexOf('$') != -1) {
			var split = route.split('$');
			key = split[0];
			route = split[1];
		}

		if (route.indexOf('-') != -1) {
			var split = route.split('-');
			name = split[0];
			args = split.slice(1);
		}
		else { name = route; args = []; }

		if (_routeMappingByRoute[name]) { name = _routeMappingByRoute[name]; }

		return { key: key, name: name, args: args };
	};

	var __routeToString = function (name, args, key, returnEmptyIfNoArgs) {
		var argsHaveValues = false;

		for (var i = 0; i < args.length; i++) {
			if (args[i] != null && args[i] != '') {
				if (typeof args[i] == 'string') { args[i] = args[i].replace('-', '|_|'); }
				argsHaveValues = true;
			}
		}

		if (_routeMappingByName[name]) { name = _routeMappingByName[name]; }

		while (args.length > 0 && (args[args.length - 1] == null || args[args.length - 1] == '')) { args.pop(); }

		var noArgs = args.length == 0 || !argsHaveValues;

		return (noArgs && returnEmptyIfNoArgs ? '' : (key ? key + '$' : '') + name + (noArgs ? '' : '-' + args.join('-')));
	};

	var __castArg = function (value, type) {
		var result;

		if (value.constructor === type) { return value; }

		switch (type) {
			case Number:
				if (value == '') { result = null; }
				else {
					if (value.indexOf('.') != -1) { result = parseFloat(value); }
					else { result = parseInt(value); }
					if (isNaN(result)) { result = null; }
				}
				break;
			default:
				result = value == '' ? null : value.replace('|_|', '-');
				break;
		}

		return result;
	};

	CO.Types.ViewRoute = function ViewRoute(view, viewName, viewModel, title, isInitialView, args) {
		var _this = this;
		var _view = view;
		var _viewName = viewName;
		var _viewModel = viewModel;
		var _viewModelType = viewModel ? CO.TypeName(viewModel) : null;
		var _initialized = false;
		var _observableSubscriptions = [];

		var __applyArgs = function (args) {
			if (!_viewModel) { return; }

			args = __onlyPrimitives(args);

			var routeObservables = _routeObservables[_viewModelType];

			for (var i = 0; i < args.length; i++) {
				var routeObservable = routeObservables[i];

				var value = __castArg(args[i], routeObservable.type);

				_viewModel[routeObservable.property](value);
			}
		};

		var __viewRemoved = function () {
			__dispose(true);
		};

		var __dispose = function (viewRemoved) {
			__disposeRoute(_this, _observableSubscriptions, _view, viewRemoved, __viewRemoved);
		};

		var __initialize = function (args) {
			if (_viewModel) {
				__mapRouteObservables(_viewModel);

				if (args) { __applyArgs(args); }

				__mapRouteObservables(_viewModel);

				_observableSubscriptions = __bindRouteObservables(_viewModel, _this);
			}

			CO.ElementRemoved(_view, __viewRemoved);
		};

		this.Title = title;

		this.Name = viewName;

		this.ViewModel = viewModel;

		this.IsInitialView = isInitialView;

		this.Dispose = function () { __dispose(false); };

		this.ToString = function (returnEmptyIfNoArgs) {
			var args = [];

			if (_viewModel) {
				var routeObservables = _routeObservables[_viewModelType];

				for (var i = 0; i < routeObservables.length; i++) {
					var routeObservable = routeObservables[i];

					args.push(_viewModel[routeObservable.property]());
				}
			}

			return __routeToString(_viewName, args, null, returnEmptyIfNoArgs);
		};

		__initialize(args);
	}

	CO.Types.CollectionFunctionRoute = function CollectionFunctionRoute(parentViewModel, entity, key, propertyName) {
		var _this = this;
		var $this = $(this);
		var _view;
		var _viewModel;
		var _viewModelType;
		var _parentViewModel = parentViewModel;
		var _propertyName = propertyName;
		var _lastArgs = [];
		var _argTypes;
		var _function;
		var _observableSubscriptions = [];
		var _mainCollection;
		var _mainCollectionObservableSubscription;
		var _keyProperty;
		var _key = key;
		var _keyType;
		var _entity = entity;

		var __mainCollectionLoaded = function (entities, callback) {
			if (entities && entities.length > 0) {
				if (_mainCollectionObservableSubscription) {
					_mainCollectionObservableSubscription.dispose();
					_mainCollectionObservableSubscription = null;
				}

				if (_key.constructor !== _keyType) { _key = __castArg(_key, _keyType); }

				for (var i = 0; i < entities.length; i++) {
					if (entities[i][_keyProperty] == _key || entities[i][_keyProperty]() == _key) {
						_entity = entities[i];

						if (callback) { callback(); return; }
					}
				}
			}
		};

		var __initializeMainCollection = function (callback) {
			if (!_mainCollection) {
				$.each(_parentViewModel, function (property, value) {
					if (ko.isObservable(value) && value.mainCollectionKey) {
						_mainCollection = value;
						_keyProperty = value.mainCollectionKey.property;
						_keyType = value.mainCollectionKey.type;
						return false;
					}
				});

				_mainCollectionObservableSubscription = _mainCollection.subscribe(function (entities) { __mainCollectionLoaded(entities, callback); });

				__mainCollectionLoaded(_mainCollection(), callback);
			}
		};

		var __initializeFunction = function () {
			if (!_function) {

				var func = _entity[_propertyName];

				if (func) {
					var routedFunction = func.routed;

					if (routedFunction) {
						_function = routedFunction.OriginalFunction;
						_keyType = routedFunction.KeyType;
						_argTypes = routedFunction.ArgTypes;
					}
				}
			}
		};

		var __applyArgsToFunction = function (args, callback) {

			__initializeFunction();

			args = __onlyPrimitives(args);

			_lastArgs = args.slice(0, _argTypes.length);

			_function.call(_entity, { callback: callback, args: _lastArgs });

		};

		var __applyArgsToViewModel = function (args) {

			args = __onlyPrimitives(args);

			var routeObservables = _routeObservables[_viewModelType];

			for (var i = 0; i < args.length && i < routeObservables.length; i++) {
				var routeObservable = routeObservables[i];

				args[i] = __castArg(args[i], routeObservable.type);

				_viewModel[routeObservable.property](args[i]);
			}

		};

		var __mapObservables = function () {
			__mapRouteObservables(_viewModel);
		};

		var __bindObservables = function () {
			_observableSubscriptions = __bindRouteObservables(_viewModel, _this);
		};

		var __setData = function (data) {
			_this.ViewModel = _viewModel = data.viewModel;
			_viewModelType = _viewModel ? CO.TypeName(_viewModel) : null

			if (data.title) { _this.Title = data.title }

			if (data.view) {
				_view = data.view;

				CO.ElementRemoved(_view, __viewRemoved);
			}
		};

		var __viewRemoved = function () {
			__dispose(true);
		};

		var __dispose = function (viewRemoved) {
			__disposeRoute(_this, _observableSubscriptions, _view, viewRemoved, __viewRemoved);
		};

		this.OnDataSet = function (handler) { $this.bind('dataSet', handler); };

		this.Title = "";

		this.ViewModel = null;

		this.Name = propertyName;

		this.Invoke = function (args, callback) {
			__applyArgsToFunction(args, function (data) {

				__setData(data);
				__mapObservables();
				__bindObservables();

				$this.trigger('dataSet', _this);

				if (callback) { callback(data); }
			});
		};

		this.InvokeByRoute = function (args, callback) {
			__initializeMainCollection(function () {
				__applyArgsToFunction(args, function (data) {
					__setData(data);
					__mapObservables();
					__applyArgsToViewModel(args);
					__bindObservables();
					$this.trigger('dataSet', _this);
					if (callback) { callback(data); }
				});
			});
		};

		this.Function = _function;

		this.Dispose = function () { __dispose(false); };

		this.ToString = function () {

			var args = [];

			var routeObservables = _routeObservables[_viewModelType];

			if (routeObservables) {
				for (var i = 0; i < routeObservables.length; i++) {
					var routeObservable = routeObservables[i];

					args.push(_viewModel[routeObservable.property]());
				}
			}

			if (_argTypes) {
				for (var i = 0; i < _argTypes.length; i++) {
					args.push(_lastArgs[i]);
				}
			}

			return __routeToString(_propertyName, args, _key);
		};
	}

	CO.Types.CollectionRoutedFunction = function RoutedFunction(viewModel, entity, key, originalFunction) {
		var _this = this;
		var $this = $(this);
		var _viewModel = viewModel;
		var _entity = entity;
		var _key = key;
		var _propertyName;

		var __initializePropertyName = function () {
			if (!_propertyName) {
				$.each(_entity, function (property, value) {
					if (value === _this.Invoke) { _propertyName = property; return false; }
				});
			}
		};

		var __invoke = function () {
			__initializePropertyName();

			route = new CO.Types.CollectionFunctionRoute(_viewModel, _entity, _key, _propertyName);

			route.Invoke(arguments);

			$this.trigger('invoked', route);
		};

		this.OnInvoked = function (handler) { $this.on('invoked', handler); };

		this.Invoke = __invoke;
		this.Invoke.routed = this;

		this.OriginalFunction = originalFunction;

		this.ArgTypes = Array.prototype.slice.apply(arguments).slice(5);
	};

	CO.Types.FunctionRoute = function FunctionRoute(parentViewModel, propertyName) {
		var _this = this;
		var $this = $(this);
		var _view;
		var _viewModel;
		var _viewModelType;
		var _parentViewModel = parentViewModel;
		var _propertyName = propertyName;
		var _lastArgs = [];
		var _argTypes;
		var _function;
		var _observableSubscriptions = [];

		var __initializeFunction = function () {
			if (!_function) {

				var func = _parentViewModel[_propertyName];

				if (func) {
					var routedFunction = func.routed;

					if (routedFunction) {
						_function = routedFunction.OriginalFunction;
						_argTypes = routedFunction.ArgTypes;
					}
				}
			}
		};

		var __applyArgsToFunction = function (args, callback) {

			__initializeFunction();

			args = __onlyPrimitives(args);

			_lastArgs = args.slice(0, _argTypes.length);

			_function.call(_parentViewModel, { callback: callback, args: _lastArgs });

		};

		var __applyArgsToViewModel = function (args) {

			args = __onlyPrimitives(args);

			var routeObservables = _routeObservables[_viewModelType];

			for (var i = 0; i < args.length && i < routeObservables.length; i++) {
				var routeObservable = routeObservables[i];

				args[i] = __castArg(args[i], routeObservable.type);

				_viewModel[routeObservable.property](args[i]);
			}

		};

		var __viewRemoved = function () {
			__disposeRoute(_this, _observableSubscriptions, _view, true, __viewRemoved);
		};

		var __mapObservables = function () {
			__mapRouteObservables(_viewModel);
		};

		var __bindObservables = function () {
			_observableSubscriptions = __bindRouteObservables(_viewModel, _this);
		};

		var __setData = function (data) {
			_this.ViewModel = _viewModel = data.viewModel;
			_viewModelType = _viewModel ? CO.TypeName(_viewModel) : null

			if (data.title) { _this.Title = data.title }

			if (data.view) {
				_view = data.view;

				CO.ElementRemoved(_view, __viewRemoved);
			}
		};

		var __dispose = function () {
			__disposeRoute(_this, _observableSubscriptions, _view, false, __viewRemoved);
		};

		this.OnDataSet = function (handler) { $this.bind('dataSet', handler); };

		this.Title = "";

		this.ViewModel = null;

		this.Name = propertyName;

		this.Invoke = function (args, callback) {
			__applyArgsToFunction(args, function (data) {

				__setData(data);
				__mapObservables();
				__bindObservables();

				$this.trigger('dataSet', _this);

				if (callback) { callback(data); }
			});
		};

		this.InvokeByRoute = function (args, callback) {
			__applyArgsToFunction(args, function (data) {
				__setData(data);
				__mapObservables();
				__applyArgsToViewModel(args);
				__bindObservables();
				$this.trigger('dataSet', _this);
				if (callback) { callback(data); }
			});
		};

		this.Function = _function;

		this.Dispose = __dispose;

		this.ToString = function () {

			var args = [];

			var routeObservables = _routeObservables[_viewModelType];

			if (routeObservables) {
				for (var i = 0; i < routeObservables.length; i++) {
					var routeObservable = routeObservables[i];

					args.push(_viewModel[routeObservable.property]());
				}
			}

			if (_argTypes) {
				for (var i = 0; i < _argTypes.length; i++) {
					args.push(_lastArgs[i]);
				}
			}

			return __routeToString(_propertyName, args);
		};
	}

	CO.Types.RoutedFunction = function RoutedFunction(viewModel, originalFunction) {
		var _this = this;
		var $this = $(this);
		var _viewModel = viewModel;
		var _propertyName;

		var __initializePropertyName = function () {
			if (!_propertyName) {
				$.each(_viewModel, function (property, value) {
					if (value === _this.Invoke) { _propertyName = property; return false; }
				});
			}
		};

		var __invoke = function () {
			__initializePropertyName();

			route = new CO.Types.FunctionRoute(_viewModel, _propertyName);

			route.Invoke(arguments);

			$this.trigger('invoked', route);
		};

		this.OnInvoked = function (handler) { $this.on('invoked', handler); };

		this.Invoke = __invoke;
		this.Invoke.routed = this;

		this.OriginalFunction = originalFunction;

		this.ArgTypes = Array.prototype.slice.apply(arguments).slice(2);
	};

	CO.Types.HashRoutingProvider = function HashRoutingProvider(onView) {
		var _onView = onView;
		var _isInitial = true;
		var _navigatedHash = null;

		this.RoutingExists = function () {
			return __segments().length > 0;
		};

		this.Navigate = function (path) {
			window.location = _navigatedHash = '#/' + path;
		};

		var __segments = function () {
			var hash = window.location.hash;
			if (hash == '#' || hash == '#/') {
				return [];
			}
			else {
				return window.location.hash.split('/').slice(1);
			}
		};

		this.Segments = __segments;

		$(function () {

			$(window).hashchange(function () {
				if (window.location.hash != _navigatedHash) {
					var routes = __segments();

					if (routes.length == 0) {
						if (!_isInitial) { _onView([], _isInitial); }
					}
					else {
						var routeDefinitions = [];

						for (var i = 0; i < routes.length; i++) {
							routeDefinitions.push(__parseRoute(routes[i]));
						}

						_onView(routeDefinitions, _isInitial);
					}
				}
			});

			$(window).hashchange();
			_isInitial = false;
		});
	};

	CO.Types.RoutingEngine = function RoutingEngine() {
		var _this = this;
		var _routes = [];
		var _routingProvider;

		var __updateRouteTitles = function () {

			var routeTitles = [];

			for (var i = 0; i < _routes.length; i++) {
				routeTitles.push(_routes[i].Title);
			}

			_this.RouteTitles(routeTitles);
		};

		var __disposeAllRoutes = function () {
			for (var i = 0; i < _routes.length; i++) {
				_routes[i].Dispose();
			}

			_routes = [];
			_routeSegments = [];
		};

		var __executeFunctionRouteChain = function (viewModel, routeDefinitions, index) {

			index = index || 0;

			if (viewModel && routeDefinitions && index < routeDefinitions.length) {

				var routeDefinition = routeDefinitions[index];
				var key = routeDefinition.key;
				var action = routeDefinition.name;
				var args = routeDefinition.args;

				var nextIndex = index + 1;
				var callback;

				if (nextIndex < routeDefinitions.length) {
					callback = function (data) {
						__executeFunctionRouteChain(data.viewModel, routeDefinitions, nextIndex);
					};
				}
				else { callback = function () { __navigate(); }; }

				var route;
				if (key) {
					route = new CO.Types.CollectionFunctionRoute(viewModel, null, key, action);
				}
				else {
					route = new CO.Types.FunctionRoute(viewModel, action);
				}

				__addRoute(route, true);

				route.InvokeByRoute(args, callback);
			}
			else { __navigate(); }
		};

		var __onView = function (routeDefinitions, isInitial) {

			if (!isInitial) {
				var definitionsLength = routeDefinitions.length == 0 ? 1 : routeDefinitions.length;
				var routesLengthMinusOne = _routes.length - 1;
				var routesLengthPlusOne = _routes.length + 1;

				if (routesLengthMinusOne == definitionsLength) {
					var sameRoute = true;

					if (routeDefinitions.length == 0) {
						sameRoute = _routes[0].IsInitialView;
					}
					else {
						for (var i = 0; i < routeDefinitions.length; i++) {
							if (routeDefinitions[i].name != _routes[i].Name) {
								sameRoute = false; break;
							}
						}
					}

					if (sameRoute) { _routes[_routes.length - 1].Dispose(); return; }
				}
				else if (routesLengthPlusOne == definitionsLength) {
					var sameRoute = true;

					for (var i = 0; i < _routes.length; i++) {
						if (routeDefinitions[i].name != _routes[i].Name) {
							sameRoute = false; break;
						}
					}

					if (sameRoute) {
						var lastRoute = _routes[_routes.length - 1];
						var lastRouteDefinition = routeDefinitions[routeDefinitions.length - 1];
						var viewModel = lastRoute.ViewModel;

						if (viewModel) {
							var key = routeDefinition.key;
							var action = routeDefinition.name;
							var args = routeDefinition.args;
							var func = viewModel[action];

							if (func) {
								var routedFunction = func.routed;

								if (routedFunction) {

									var route;
									if (key) {
										route = new CO.Types.CollectionFunctionRoute(viewModel, null, key, action);
									}
									else {
										route = new CO.Types.FunctionRoute(viewModel, action);
									}

									routedFunction.InvokeByRoute(route, lastRouteDefinition.args);

								}
							}
						}

						return;
					}
				}
			}

			if (routeDefinitions.length > 0) {

				__disposeAllRoutes();

				var viewRouteDefinition = routeDefinitions[0];
				var functionRouteDefinitions = routeDefinitions.slice(1);

				var viewName = viewRouteDefinition.name;
				var args = viewRouteDefinition.args;

				CO.View.LoadByRoute(viewName, function (data) {

					var route = new CO.Types.ViewRoute(data.view, data.viewName, data.viewModel, data.title, data.isInitialView, args);

					__addRoute(route, true);

					__executeFunctionRouteChain(data.viewModel, functionRouteDefinitions);

				});

			}
			else {
				CO.View.DestroyUnmappedViews();
				CO.View.LoadMainElementInitialView();
			}

		};

		var __navigate = function () {

			var segments = [];

			if (_routes.length == 1 && _routes[0].IsInitialView) {
				var toString = _routes[0].ToString(true);
				if (toString != '') { segments.push(toString); }
			}
			else {
				for (var i = 0; i < _routes.length; i++) {
					segments.push(_routes[i].ToString());
				}
			}

			_routingProvider.Navigate(segments.join('/'));

			__updateRouteTitles();
		};

		var __addRoute = function (route, byRoute) {
			_routes.push(route);

			if (!byRoute) { __navigate(); }
		};

		var __updateRoute = function (route) {

			var index = $.inArray(route, _routes);

			if (index != -1) {
				var segments = _routingProvider.Segments();

				segments[index] = route.ToString();

				_routingProvider.Navigate(segments.join('/'));
			}

		};

		var __onMainElementViewApplied = function (e, data) {
			if (_routeMappingByName[data.viewName]) { data.viewName = _routeMappingByName[data.viewName]; }

			__disposeAllRoutes();

			__addRoute(new CO.Types.ViewRoute(data.view, data.viewName, data.viewModel, data.title, data.isInitialView));
		};

		var __constructType = function (constructor, args) {

			function DynamicType() {
				return constructor.apply(this, args);
			}

			DynamicType.prototype = constructor.prototype;

			var instance = new DynamicType();

			return instance;
		};

		this.AddRoute = __addRoute;

		this.UpdateRoute = __updateRoute;

		this.RemoveRoute = function (route) {

			var index = $.inArray(route, _routes);

			if (index != -1) {
				_routes.splice(index, 1);

				__navigate();
			}

		};

		this.RoutingExists = function () {
			return _routingProvider.RoutingExists();
		};

		this.Routed = function (target, func) {

			var routedFunction = __constructRoutedFunction(CO.Types.RoutedFunction, arguments);

			routedFunction.OnInvoked(function (e, route) {

				route.OnDataSet(function (e, route) {
					__updateRouteTitles();
				});

				__addRoute(route, false);

			});

			return routedFunction.Invoke;

		};

		this.Routed = function (viewModel, func) {

			var routedFunction = __constructType(CO.Types.RoutedFunction, arguments);

			routedFunction.OnInvoked(function (e, route) {

				route.OnDataSet(function (e, route) {
					__updateRouteTitles();
				});

				__addRoute(route, false);

			});

			return routedFunction.Invoke;

		};

		this.CollectionRouted = function (viewModel, entity, key, func) {

			var routedFunction = __constructType(CO.Types.CollectionRoutedFunction, arguments);

			routedFunction.OnInvoked(function (e, route) {

				route.OnDataSet(function (e, route) {
					__updateRouteTitles();
				});

				__addRoute(route, false);

			});

			return routedFunction.Invoke;

		};

		this.RoutedPrincipal = function (target, func) {

			routedFunction = __constructRoutedFunction(arguments);

			routedFunction.OnInvoked(function (e, route) {

				route.OnDataSet(function (e, route) {
					//__updateRoute(route);
					__updateRouteTitles();
				});

				__addRoute(route, false);

			});

			return routedFunction.Invoke;

		};

		this.Initialize = function (routeMapping) {
			_routeMappingByRoute = routeMapping || {};
			_routeMappingByName = {};

			$.each(_routeMappingByRoute, function (key, value) { _routeMappingByName[value] = key; });

			_routingProvider = new CO.Types.HashRoutingProvider(__onView);

			CO.View.OnMainElementViewApplied(__onMainElementViewApplied);
		};

		this.RouteTitles = ko.observableArray([]);

		CO.Routing = this;
	};
})(jQuery);