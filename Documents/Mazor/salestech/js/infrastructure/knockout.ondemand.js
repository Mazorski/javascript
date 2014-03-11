(function ($) {
	var _authPrincipal;
	var _authDependants = [];

	function OnDemandObservable(type, target, get, initialValue, authDependent) {
		var $this = $(this);
		var _type = type;
		var _target = target;
		var _get = get;
		var _authDependent = authDependent;
		var _property;
		var _innerObservable;
		var _observable;
		var _loadedObservable;
		var _loadingObservable;
		var _keyProperty;

		var __wrapProperty = function (property) {
			eval('var func = function (data) { return { ' + property + ': data } }');
			return func;
		};

		var __initProperty = function () {
			if (!_property) {
				$.each(_target, function (key, value) {
					if (value === _observable) { _property = key; return false; }
				});
			}
		};

		var __initKeyProperty = function (entity) {
			$.each(entity, function (property, value) {
				if (ko.isObservable(value) && value.key) { _keyProperty = property; return false; }
			});
		};

		var __generateDictionary = function () {
			if (_type == 'observableArray' && _observable.generateDictionary) {

				var data = _observable();

				if (data != null && $.isArray(data) && data.length > 0) {

					if (!_keyProperty) { __initKeyProperty(data[0]); }

					if (_keyProperty) {
						_observable.dictionary = data.toDictionary(_keyProperty);
						$this.trigger('dictionaryGenerated');
						return;
					}

				}

				_observable.dictionary = {};
			}
		};

		var __setEmpty = function (innerCallback) {
			ko.mapping.fromJS(__wrapProperty(_property)(null), _target);
			__generateDictionary();
			if (typeof innerCallback == 'function') { innerCallback(); }
			return;
		};

		var __loadData = function (innerCallback) {
			__initProperty();

			if (_authDependent && !_authPrincipal) {
				__setEmpty(innerCallback);
				return;
			}

			try {
				get().done(function (data) {
					ko.mapping.fromJS(__wrapProperty(_property)(data), _target);
					__generateDictionary();
					if (typeof innerCallback == 'function') { innerCallback(); }
				});
			} catch (e) {
				__setEmpty(innerCallback);
			}
		};

		var __load = function (callback) {
			if (!_loadedObservable()) {
				_loadingObservable(true);
				__loadData(function () {
					_loadingObservable(false);
					if (typeof callback == 'function') { callback(); }
				});
			}
		};

		var __reload = function (callback) {
			_loadedObservable(false);
			__load(callback);
		};

		var __read = function () {
			__load();
			return _innerObservable();
		};

		var __write = function (value) {
			_loadedObservable(true);
			_innerObservable(value);
		};

		var __init = function (initialValue) {

			var unwrappedInitialValue = ko.unwrap(initialValue);
			_innerObservable = ko[_type](unwrappedInitialValue);

			_observable = ko.computed({
				read: __read,
				write: __write,
				deferEvaluation: true  //do not evaluate immediately when created
			});

			//Is the data being loaded?
			_observable.loading = _loadingObservable = ko.observable(false).publishOn("MainLoading", true);

			//Was the data loaded?
			_observable.loaded = _loadedObservable = ko.observable(typeof unwrappedInitialValue != 'undefined');

			_observable.load = __load;

			_observable.reload = __reload;

			_observable.reset = function () {
				_observable(null);
				_loadedObservable(false);
			};

			_observable.resetOn = function () {
				for (var i = 0; i < arguments.length; i++) {
					arguments[i].subscribe(function (value) {
						_observable.reset();
					});
				}

				return _observable;
			};

			_observable.onDictionaryGenerated = function (handler) {
				$this.on('dictionaryGenerated', handler);
				return handler;
			};

			_observable.offDictionaryGenerated = function (handler) {
				$this.off('dictionaryGenerated', handler);
			};

			_observable.asCollection = function () {
				_observable.generateDictionary = true;
				_observable.dictionary = {};

				return _observable;
			};

			_observable.isOnDemand = true;

			if (_authDependent) {
				_authDependants.push(_observable);
			}
		}

		__init(initialValue);

		this.Observable = _observable;
	}

	var onDemandObservable = function (type) {
		return function (target, get, initialValue, authDependent) {

			var create = new OnDemandObservable(type, target, get, initialValue, authDependent);

			return create.Observable;
		};
	};

	ko.subscribable.fn.authPrincipal = function () {
		this.subscribe(function (value) {
			_authPrincipal = value;
			for (var i = 0; i < _authDependants.length; i++) {
				//if (!value) { _authDependants[i](null); }
				_authDependants[i].loaded(false);
			}
		});

		return this;
	};

	ko.subscribable.fn.asKey = function () {
		this.key = true;
		return this;
	};

	ko.subscribable.fn.keyFor = function (property, collection) {
		var _this = this;
		var key = this();

		this.subscribe(function (value) {
			if (value) {
				property(collection.dictionary[value]);
			}
			else {
				property.reset();
			}
		});

		if (key) {
			var handler = collection.onDictionaryGenerated(function (value) {
				_this(key);
				collection.offDictionaryGenerated(handler);
			});
		}

		return this;
	};

	ko.onDemandObservable = onDemandObservable('observable');
	ko.onDemandObservableArray = onDemandObservable('observableArray');
})(jQuery);