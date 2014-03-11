window.CO = window.CO || {};

(function ($) {
	CO.Types.ViewMapping = function ViewMapping(initialMapping) {
		var _byElement = {};
		var _byView = {};
		var _elementViewModelMapping = {};

		var __isSelector = function (syntax) {
			return syntax[0] == '.' || syntax[0] == '#';
		};

		var __addToDictionary = function (key, value, dictionary) {
			var existing = dictionary[key];
			if (existing) {
				existing.push(value);
			}
			else {
				dictionary[key] = [value];
			}
		};

		var __addByElement = function (viewName, element) {
			__addToDictionary(CO.ElementGuid(element), viewName, _byElement);
		};

		var __addByName = function (viewName, element) {
			__addToDictionary(viewName, element, _byView);
		};

		var __addElement = function (element, mappings, addedDictionary) {
			if (typeof mappings == 'undefined') { return; }
			if (typeof mappings == 'string') { mappings = mappings.split(' '); }
			else if (!$.isArray(mappings)) { return; }

			var elementViewModelMapping = _elementViewModelMapping[CO.ElementGuid(element)] = {};

			for (var i = 0; i < mappings.length; i++) {
				var splitMapping = mappings[i].split('.');
				var viewName = splitMapping[0];
				var viewModelMapping = splitMapping.slice(1).join('.');

				if (viewModelMapping) { elementViewModelMapping[viewName] = viewModelMapping; }

				__addByElement(viewName, element);
				__addByName(viewName, element);
				if (addedDictionary) { __addToDictionary(viewName, element, addedDictionary); }
			}
		};

		var __mapInitial = function (initialMapping) {
			if (typeof initialMapping == 'object') {
				$.each(initialMapping, function (key, value) {
					if (__isSelector(key)) {
						$(key).each(function () {
							__addElement(this, value);
						});
					}
					else if ($.isArray(value) == 'Array') {
						for (var i = 0; i < value.length; i++) {
							$(value[i]).each(function () {
								__addElement(this, key);
							});
						}
					}
				});
			}
		}

		this.Parse = function (element) {
			var addedDictionary = {};

			element = element ? $(element) : $('body');
			element.find('[data-view]').each(function () {
				var $this = $(this);
				var viewAttribute = $this.attr('data-view');

				if (viewAttribute) {
					__addElement(this, viewAttribute, addedDictionary);
				}
			});

			return addedDictionary;
		};

		this.GetAllElementViews = function () {
			return $.extend({}, _byElement);
		};

		this.GetAllViewElements = function () {
			return $.extend({}, _byView);
		};

		this.GetElementView = function (element) {
			return _byElement[CO.ElementGuid(element)];
		};

		this.GetViewElements = function (viewName) {
			return _byView[viewName];
		};

		this.GetElementViewModelMapping = function (element, viewName) {
			var mapping = _elementViewModelMapping[CO.ElementGuid(element)];
			if (!mapping) { return null; }
			else { return mapping[viewName]; }
		};

		__mapInitial(initialMapping);
	}

	//CO.Types.ViewModelFactory = function ViewModelFactory() {

	//	var _globalViewModels = [];

	//	var __createByViewName = function (viewName) {
	//		try {
	//			if (viewName.indexOf('-') != -1) {
	//				eval('var viewModel = new ' + viewName.split('-')[1] + 'ViewModel();');
	//			}
	//			else {
	//				eval('var viewModel = new ' + viewName + 'ViewModel();');
	//			}
	//			return viewModel;
	//		} catch (e) {
	//			return null;
	//		}
	//	}

	//	var __createBySyntax = function (viewName, syntax) {
	//		if (syntax == 'create') {
	//			return __createByViewName(viewName);
	//		}
	//		else if (syntax.indexOf('global') == 0) {
	//			var viewModelKey = viewName + "." + syntax;

	//			if (!_globalViewModels[viewModelKey]) { _globalViewModels[viewModelKey] = __createByViewName(viewName); }

	//			return _globalViewModels[viewModelKey];
	//		}
	//		else if (syntax.indexOf('bind.') == 0) {
	//			return syntax;
	//		}
	//		else {
	//			return null;
	//		}
	//	};

	//	this.Create = function (viewName, mapping) {

	//		if (!mapping) { return null; }

	//		return __createByString(viewName, mapping);
	//	};

	//	this.GetGlobalViewModel =

	//};

	//CO.Types.View = function View(element, html, name, model, isInitial) {
	//	var _this = this;
	//	var $this = $(this);

	//	this.HTML = html;
	//	this.Name = viewName;
	//	this.Model = model;
	//	this.ModelType = model ? CO.TypeName(model) : null;
	//	this.IsInitial = isInitial;

	//	this.OnRemoved = function (handler) { $this.bind('removed', handler); };

	//	CO.ElementRemoved(html, function () {
	//		$this.trigger('removed', _this);
	//	});
	//};

	CO.Types.ViewEngine = function ViewEngine(viewRequest) {
		var _this = this;
		var $this = $(this);
		var _mainElement;
		var _namespace = "";
		var _viewRequest = viewRequest;
		var _cache = {};
		var _viewModels = {};
		var _mappedViews = {};
		var _unmappedViews = [];
		var _requests = {};
		var _initialMapping;
		var _initialViews = {};
		var _mapping = new CO.Types.ViewMapping();
		var _displayUnmappedView;
		var _destroyUnmappedView;
		var _renderViewError;
		var _fakeDelay;
		var _viewAnimation;
		var _viewLoaded;

		var __createViewModelByViewName = function (viewName) {
			try {
				eval('var viewModel = new ' + (viewName.indexOf('-') != -1 ? viewName.split('-')[1] : viewName) + 'ViewModel();');
				return viewModel;
			} catch (e) {
				console.log('CO.ViewEngine - Failed creating view model for view ' + viewName);
				return null;
			}
		}

		var __getViewModelByString = function (str, viewName) {
			if (str == 'create') {
				return __createViewModelByViewName(viewName);
			}
			else if (str.indexOf('global') == 0) {
				var viewModelKey = viewName + "." + str;
				if (!_viewModels[viewModelKey]) { _viewModels[viewModelKey] = __createViewModelByViewName(viewName); }
				return _viewModels[viewModelKey];
			}
			else if (str.indexOf('bind.') == 0) {
				return str;
			}
			else {
				return null;
			}
		};

		var __getViewModel = function (viewName, viewModel, element) {
			if (viewModel == 'bymapping') {
				if (!element) { return null; }
				var mapping = _mapping.GetElementViewModelMapping(element, viewName);
				if (!mapping) {
					return null;
				}
				return __getViewModelByString(mapping, viewName);
			}
			else if (typeof viewModel == 'string') {
				return __getViewModelByString(viewModel, viewName);
			}
			else { return viewModel; }
		};

		var __viewRemoved = function (view, viewModel, element) {

			if (element) {
				var guid = CO.ElementGuid(element);
				if (_mappedViews[guid]) { delete _mappedViews[guid]; }
			}

			var index = $.inArray(view, _unmappedViews);

			if (index != -1) { _unmappedViews.splice(index, 1); }

		};

		var __applyView = function (view, viewName, viewModel, element, callbackData, byRoute) {
			var $view = $(view).clone();
			var view = $view.get();
			var titleElement = $view.filter('title');
			var title = "";

			if (titleElement.length >= 1) {
				title = titleElement.html();
				view.splice($.inArray(titleElement[0], view), 1);
			}

			if (CO.TypeName(view[0]).toLowerCase() == 'text') { view.splice(0, 1); }

			if (view.length > 1) {
				$view = $('<div/>').html(view);
				view = $view[0];
			}
			else {
				view = view[0];
				$view = $(view);
			}

			CO.ElementRemoved(view, function () {
				__viewRemoved(view, viewModel, element);
			});

			CO.UI.InitializeUI(view);

			if (typeof viewModel == 'string') {
				if (viewModel.indexOf('bind.') == 0) {
					var path = viewModel.split('bind.')[1];

					$view.attr('data-bind', 'with: ' + path);

					viewModel = ko.dataFor(element);
				}
				else {
					viewModel = null;
				}
			}

			callbackData.viewModel = viewModel;
			callbackData.viewName = viewName.replace(_namespace, '');
			callbackData.view = view;
			callbackData.isInitialView = !element ? false : _initialViews[CO.ElementGuid(element)] == viewName.replace(_namespace, '');
			callbackData.title = title;

			if (_viewAnimation) { $view.css(_viewAnimation[0]); }

			if (element) {
				$(element).html(view);

				if (!byRoute && element === _mainElement) {
					$this.trigger('mainElementViewApplied', callbackData);
				}
			}
			else {
				$view.find('.close-view').click(function () { _destroyUnmappedView(view); });

				if (viewModel) {
					$(viewModel).bind('complete', function () { _destroyUnmappedView(view); });
				}

				_displayUnmappedView(view, viewName, title);

				_unmappedViews.push(view);
			}

			var $forms = $view.filter('form').add($view.find('form'));
			if ($forms.length > 0) {
				$forms.each(function () {
					var form = this;
					var $form = $(form);

					$form.find('button:not(.submit):not(.reset)').click(function (e) { e.preventDefault(); });
					$form.find('button.reset').click(function (e) {
						e.preventDefault();
						e.stopPropagation();
						form.reset();
					});

					CO.UI.InitializeForm(form);

					if (viewModel) {
						$form.find('[name]').each(function () {
							var $this = $(this);
							var existingDataBind = $this.attr('data-bind');
							var type = $this.attr('type');
							var bindWhat = type == 'checkbox' || type == 'radio' ? 'checked' : 'value';
							$this.attr('data-bind', (existingDataBind ? existingDataBind + ', ' : '') + bindWhat + ': ' + $this.attr('name') + ', validate: ' + $this.attr('name'));
						});
					}
				});
			}

			viewModel = viewModel || ko.dataFor(element);

			if (viewModel) { ko.applyBindings(viewModel, view); }

			if (_viewAnimation) { $view.animate(_viewAnimation[1], _viewAnimation[2]); }

			if (_viewLoaded) { _viewLoaded(view); }
		};

		var __applyViewFromCache = function (viewName, viewModel, element, callbackData, byRoute) {
			var viewFromCache = _cache[viewName];
			if (viewFromCache) {
				__applyView(viewFromCache, viewName, viewModel, element, callbackData, byRoute);
				return true;
			}
			return false;
		};

		var __actualLoadView = function (viewName, viewModel, element, reload, callback, byRoute) {
			viewModel = __getViewModel(viewName, viewModel, element);

			viewName = _namespace + viewName;

			var callbackData = {};

			if (!reload && __applyViewFromCache(viewName, viewModel, element, callbackData, byRoute)) {
				if (callback) { callback(callbackData); }
			}
			else {
				__requestView(viewName, function (view) {
					_cache[viewName] = view;
					__applyView(view, viewName, viewModel, element, callbackData, byRoute);
					if (callback) { callback(callbackData); }
				}, function () {
					var view = _renderViewError ? _renderViewError(viewName) : $('<div/>').html('Failed loading view ' + viewName);
					_cache[viewName] = view;
					__applyView(view, viewName, null, element, callbackData, byRoute);
					if (callback) { callback(callbackData); }
				}, element ? CO.ElementGuid(element) : null);
			}
		};

		var __loadView = function (viewName, viewModel, elements, reload, callback, byRoute) {
			if (elements) {
				elements = $.isArray(elements) ? elements : [elements];

				$(elements).addClass(CO.UI.LoaderClass);

				__actualLoadView(viewName, viewModel, elements[0], reload, function (callbackData) {
					$(elements[0]).removeClass(CO.UI.LoaderClass);

					var rest = elements.slice(1);

					if (rest.length == 0) {
						if (callback) { callback(callbackData); }
					}
					else {
						for (var i = 0; i < rest.length; i++) {
							var element = rest[i];
							__actualLoadView(viewName, viewModel, element, false, function (data) {
								$(element).removeClass(CO.UI.LoaderClass);
								var index = i;
								if (index == rest.length - 1) {
									if (callback) { callback(callbackData); }
								}
							});
						}
					}
				}, byRoute);
			}
			else {
				__actualLoadView(viewName, viewModel, null, reload, function (callbackData) {
					if (callback) { callback(callbackData); }
				});
			}
		};

		var __requestView = function (viewName, done, fail, token) {
			ko.postbox.publish('MainLoading', true);

			var request = _viewRequest(viewName).done(function (data) {
				if (!token || _requests[token] === request) {
					delete _requests[token];

					var view = $(data);

					if (_fakeDelay) {
						setTimeout(function () { done(view); }, _fakeDelay);
					}
					else {
						done(view);
					}
				}
			}).fail(function () {
				if (_requests[token] === request) { delete _requests[token]; }
				if (fail) { fail(); }
			}).complete(function () {
				ko.postbox.publish('MainLoading', false);
			});

			if (token) { _requests[token] = request; }
		};

		var __parse = function (element) {
			var added = _mapping.Parse(element);

			if (element) {
				$.each(added, function (viewName, elements) {
					__loadView(viewName, 'bymapping', elements);
				});
			}
		};

		var __load = function (viewNameOrElement, viewModel, reload, callback, byRoute, asUnmapped) {
			if (typeof viewNameOrElement == 'string' && !asUnmapped) {
				var elements = _mapping.GetViewElements(viewNameOrElement);

				if (byRoute) {

					var mainElementIndex = $.inArray(_mainElement, elements);

					if (mainElementIndex == -1) { return; }

					elements = [elements[mainElementIndex]];

				}

				__loadView(viewNameOrElement, viewModel, elements, reload, callback, byRoute);
			}
			else if (typeof viewNameOrElement == 'string' && asUnmapped) {
				__loadView(viewNameOrElement, viewModel, null, reload, callback);
			}
			else {
				var viewName = _mapping.GetElementView(viewNameOrElement);

				__loadView(viewName, viewModel, [$(viewNameOrElement)[0]], reload, callback)
			}
		};

		this.Reload = function (viewNameOrElement, viewModel, callback) {
			__load(viewNameOrElement, viewModel, true, callback);
		};

		this.Load = function (viewNameOrElement, viewModel, callback) {
			__load(viewNameOrElement, viewModel, false, callback);
		};

		this.LoadAsUnmapped = function (viewName, viewModel, callback) {
			__load(viewName, viewModel, false, callback, false, true);
		};

		this.LoadByRoute = function (viewName, callback) {
			__load(viewName, 'bymapping', false, callback, true);
		};

		this.LoadMainElementInitialView = function () {
			var viewName = _initialViews[CO.ElementGuid(_mainElement)];

			if (viewName) {
				__loadView(viewName, 'bymapping', [_mainElement]);
			}
		};

		this.DestroyUnmappedViews = function () {
			//$.each(_initialViews, function (guid, initialView) {
			//	var currentView = _mappedViews[guid];
			//	var element = CO.ElementByGuid(guid);

			//	if (!initialView) {
			//		if (element) { $(element).html(''); }
			//	}
			//	else if (initialView != currentView) {
			//		if (element) { __loadView(initialView, 'bymapping', element, null, null, true); }
			//	}
			//});

			var unmappedViews = _unmappedViews;
			_unmappedViews = [];
			for (var i = 0; i < unmappedViews; i++) {
				_destroyUnmappedView(unmappedViews[i]);
			}
		};

		this.GetGlobalViewModel = function (viewName, namespace) {
			return _viewModels[viewName + ".global" + (namespace ? "." + namespace : "")];
		};

		this.OnMainElementViewApplied = function (handler) { $this.bind('mainElementViewApplied', handler); };

		this.Initialize = function (mainElement, options) {
			if (!mainElement) { throw new Error("CO.ViewEngine Initialize - You must provide a main element selector (mainElement)"); }

			_mainElement = mainElement;

			if (options.namespace) { _namespace = options.namespace + '-'; }
			if (options.displayUnmappedView) { _displayUnmappedView = options.displayUnmappedView; }
			if (options.destroyUnmappedView) { _destroyUnmappedView = options.destroyUnmappedView; }
			if (options.renderViewError) { _renderViewError = options.renderViewError; }
			if (options.mapping) { _initialMapping = options.mapping; }
			if (options.initializeForm) { _initializeForm = options.initializeForm; }
			if (options.formValidationOptions) { _formValidationOptions = options.formValidationOptions; }
			if (options.fakeDelay) { _fakeDelay = options.fakeDelay; }
			if (options.viewAnimation) { _viewAnimation = options.viewAnimation; }
			if (options.viewLoaded) { _viewLoaded = options.viewLoaded; }

			if (!_displayUnmappedView) { throw new Error("CO.ViewEngine Initialize - You must provide a callback to display unmapped views (options.displayUnmappedView)"); }
			if (!_destroyUnmappedView) { throw new Error("CO.ViewEngine Initialize - You must provide a callback to destroy unmapped views (options.destroyUnmappedView)"); }

			$(function () {
				if (_mainElement) { _mainElement = $(_mainElement)[0]; }

				if (!_mainElement) { throw new Error("CO.ViewEngine - Main element does not exist"); }

				_mapping = new CO.Types.ViewMapping(_initialMapping);
				__parse();

				_initialViews = {};
				$.each(_mapping.GetAllElementViews(), function (key, value) {
					_initialViews[key] = value[0];
				});

				var mainElementGuid = CO.ElementGuid(_mainElement);
				var routingExists = CO.Routing ? CO.Routing.RoutingExists() : false;
				$.each(_initialViews, function (guid, value) {
					if (!mainElementGuid || !routingExists || guid != mainElementGuid) { __loadView(value, 'bymapping', CO.ElementByGuid(guid)); }
				});
			});
		};

		CO.View = this;
	}
})(jQuery);