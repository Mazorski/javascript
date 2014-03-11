(function () {
	var objToArray = function (obj) {
		var properties = [];
		for (var key in obj) {
			if (obj.hasOwnProperty(key) && key[0] != '_') {
				properties.push({ key: key, value: obj[key] });
			}
		}
		return properties;
	};

	ko.generated = function (generate) {
		var observable = ko.observable(generate());
		var trigger = function () {
			observable(generate());
		};

		for (var i = 1; i < arguments.length; i++) {
			arguments[i].subscribe(trigger);
		}

		return observable;
	};

	var originalCheckedInit = ko.bindingHandlers.checked.init;

	ko.bindingHandlers.checked.init = function (element, valueAccessor, allBindingsAccessor, viewModel) {
		var $element = $(element);
		var bindingAcc = allBindingsAccessor();

		originalCheckedInit(element, valueAccessor, allBindingsAccessor, viewModel);

		if ($element.parents('form').data('bootstrapSwitch')) {
			var switchElement = $element.parent().parent();

			switchElement.bootstrapSwitch('setState', ko.utils.unwrapObservable(valueAccessor()));
			// Event handler that makes the view model update as soon as the state of the switch button changes
			switchElement.on('switch-change', function (e, data) {
				valueAccessor()(data.value);
			});
			// In my project I have a disable binding for all controlls since the application can be in a view only
			// mode and thus I included code for a possible disable binding in the binding handler as well.
			if (bindingAcc.disabled)
				switchElement.switch('toggleActivation');
		}
	};

	ko.bindingHandlers.tipster = {
		init: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			var $element = $(element);
			var options = ko.unwrap(valueAccessor());
			var position = options.position;
			var flags = options.flags;

			if (!options.flags && options.flag) { flags = [{ flag: options.flag, content: options.content }]; }

			$element.tooltipster({
				trigger: 'custom',
				position: position || 'left'
			});

			for (var i = 0; i < flags.length; i++) {
				(function () {
					var flag = flags[i].flag;
					var content = flags[i].content;

					flag.subscribe(function (value) {
						$element.tooltipster('update', content).tooltipster(value ? 'show' : 'hide');
					});
				})();
			}

		}
	};

	ko.bindingHandlers.submit = {
		'init': function (element, valueAccessor, allBindingsAccessor, viewModel) {
			if (typeof valueAccessor() != "function")
				throw new Error("The value for a submit binding must be a function");
			ko.utils.registerEventHandler(element, "submit", function (event) {
				if (typeof event.result == 'undefined') {
					var $form = $(element);
					var validator = $form.data('validator');
					if (validator) {
						if (!$form.valid()) {
							event.preventDefault();
							$form.triggerHandler("invalid-form", [validator]);
							validator.showErrors();
							return;
						}
					}
				}
				else if (!event.result) { return; }
				var handlerReturnValue;
				var value = valueAccessor();
				try { handlerReturnValue = value.call(viewModel, element); }
				finally {
					if (handlerReturnValue !== true) { // Normally we want to prevent default action. Developer can override this be explicitly returning true.
						if (event.preventDefault)
							event.preventDefault();
						else
							event.returnValue = false;
					}
				}
			});
		}
	};

	ko.bindingHandlers.foreachprop = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			var properties = objToArray(value);

			ko.applyBindingsToNode(element, { foreach: properties });

			return { controlsDescendantBindings: true };
		}
	};

	ko.bindingHandlers.chosen = {
		update: function (element, valueAccessor, allBindingsAccessor, viewModel) {
			$(element).trigger("liszt:updated");
		}
	};

	ko.bindingHandlers.track = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (typeof value == "object" && value.category && value.action) {
				$(element).on(value.event || 'click', function () {
					if (typeof GlobalTracker == 'object') {
						GlobalTracker._trackEvent(value.category, value.action, value.label, value.value);
					}
				});
			}
		}
	};

	ko.bindingHandlers.size = {
		update: function (element, valueAccessor) {
			var originalSize = ko.utils.unwrapObservable(valueAccessor());

			if (typeof originalSize == 'object') {
				var $element = $(element);
				var $parent = $element.parent();
				var ratio = originalSize.width / originalSize.height;
				var parentSize = { width: $parent.width(), height: $parent.height() };
				var finalSize = { width: null, height: null };

				if (originalSize.width > originalSize.height) {
					finalSize.width = Math.min(originalSize.width, parentSize.width);
					finalSize.height = parentSize.width / ratio;

					if (finalSize.height > parentSize.height) {
						finalSize.height = Math.min(originalSize.height, parentSize.height);
						finalSize.width = ratio * parentSize.height;
					}
				}
				else {
					finalSize.height = Math.min(originalSize.height, parentSize.height);
					finalSize.width = ratio * parentSize.height;

					if (finalSize.width > parentSize.width) {
						finalSize.width = Math.min(originalSize.width, parentSize.width);
						finalSize.height = parentSize.width / ratio;
					}
				}

				$element.css(finalSize);
			}
		}
	};

	ko.bindingHandlers.sizeCenter = {
		update: function (element, valueAccessor) {
			ko.bindingHandlers.size.update(element, valueAccessor);
			var $element = $(element);
			var elementSize = { width: $element.width(), height: $element.height() };
			var $parent = $element.parent();
			var parentSize = { width: $parent.width(), height: $parent.height() };

			$element.css({ left: (parentSize.width - elementSize.width) / 2, top: (parentSize.height - elementSize.height) / 2 });
		}
	};

	ko.bindingHandlers.fadeVisible = {
		init: function (element, valueAccessor) {
			var value = valueAccessor();
			$(element).toggle(ko.utils.unwrapObservable(value));
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor();
			ko.utils.unwrapObservable(value) ? $(element).stop(true, true).fadeIn(250) : $(element).stop(true, true).fadeOut(250);
		}
	};

	ko.bindingHandlers.slowFadeVisible = {
		init: function (element, valueAccessor) {
			var value = valueAccessor();
			$(element).toggle(ko.utils.unwrapObservable(value));
		},
		update: function (element, valueAccessor) {
			var value = valueAccessor();
			ko.utils.unwrapObservable(value) ? $(element).stop(true, true).fadeIn(1000) : $(element).stop(true, true).fadeOut(1000);
		}
	};

	ko.bindingHandlers.invertSlidePanel = function () {
		var _lastValues = {};

		return {
			init: function (element, valueAccessor) {
				var value = ko.utils.unwrapObservable(valueAccessor());
				$(element).css({ top: value ? -$(element).height() : 0 });
				_lastValues[element] = value;
				$(window).resize(function () {
					$(element).stop().css({ top: _lastValues[element] ? -$(element).height() : 0 });
				});
			},
			update: function (element, valueAccessor) {
				var value = ko.utils.unwrapObservable(valueAccessor());
				_lastValues[element] = value;
				$(element).animate({ top: value ? -$(element).height() : 0 }, 1000, 'easeInOutCubic');
			}
		};
	}();

	ko.bindingHandlers.slidePanel = function () {
		var _lastValues = {};

		return {
			init: function (element, valueAccessor) {
				var value = ko.utils.unwrapObservable(valueAccessor());
				$(element).css({ top: value ? 0 : $(window).height() });
				_lastValues[element] = value;
				$(window).resize(function () {
					$(element).stop().css({ top: _lastValues[element] ? 0 : $(window).height() });
				});
			},
			update: function (element, valueAccessor) {
				var value = ko.utils.unwrapObservable(valueAccessor());
				_lastValues[element] = value;
				$(element).animate({ top: value ? 0 : $(window).height() }, 1000, 'easeInOutCubic');
			}
		};
	}();

	ko.bindingHandlers.imagePreload = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			var $element = $(element);
			$element.data('imagePreloadValue', value);
			$element.find('img').imagesLoaded(function () {
				$element.removeClass('loading');
			})
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			var oldValue = $(element).data('imagePreloadValue');

			if (value != oldValue) { $(element).addClass('loading'); }
		}
	};

	ko.bindingHandlers.sliderValue = {
		init: function (element, valueAccessor, allBindingsAccessor) {
			ko.utils.registerEventHandler(element, "slidechange", function (event, ui) {
				var observable = valueAccessor();
				observable(ui.value);
			});
			ko.utils.registerEventHandler(element, "slide", function (event, ui) {
				var observable = valueAccessor();
				observable(ui.value);
			});
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("value", value);
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("value", value);
		}
	};

	ko.bindingHandlers.sliderMin = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("option", "min", value);
			$(element).slider("value", $(element).slider("value"));
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("option", "min", value);
			$(element).slider("value", $(element).slider("value"));
		}
	};

	ko.bindingHandlers.sliderMax = {
		init: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("option", "max", value);
			$(element).slider("value", $(element).slider("value"));
		},
		update: function (element, valueAccessor) {
			var value = ko.utils.unwrapObservable(valueAccessor());
			if (isNaN(value)) value = 0;
			$(element).slider("option", "max", value);
			$(element).slider("value", $(element).slider("value"));
		}
	};

	ko.submit = function (target, post, include, connectingObservable, errorObservable, success, done) {
		return function () {
			var data = ko.mapping.toJS(target, include);
			var postData = {};

			$.each(data, function (property, value) {
				if (typeof value != 'object') { postData[property] = value; }
			});

			connectingObservable(true);
			post(postData).done(function (result) {
				if (done) { done(result); }
				else {
					if (result === true) {
						success(data);
					}
					else if (result === false) {
						errorObservable(true);
					}
					else {
						success(result);
					}
				}
			}).fail(function () {
				errorObservable(true);
			}).complete(function () {
				connectingObservable(false);
			});
		};
	};

	ko.toAjaxJS = function (obj, include) {
		var result;

		if (typeof obj == 'object') {
			result = {};
			$.each(obj, function (key, value) {
				if ((include == null || $.inArray(key, include) != -1) && (ko.isObservable(value) || typeof value == 'object')) { result[key] = value; }
			});
		}
		else { result = obj; }

		return ko.toJS(result);
	};

	ko.subscribable.fn.bindTo = function () {
		var _this = this;

		for (var i = 0; i < arguments.length; i++) {
			arguments[i].subscribe(function (value) {
				_this(value);
			});
		}

		return this;
	};

	ko.subscribable.fn.toNullOn = function () {
		var _this = this;

		var toNull = function (value) {
			_this(null);
		};

		for (var i = 0; i < arguments.length; i++) {
			arguments[i].subscribe(toNull);
		}

		return this;
	};

	ko.subscribable.fn.debounced = function (delay, at_begin) {
		delay = delay || 500;
		at_begin = at_begin || false;

		var _this = this;
		var _debounced = $.debounce(delay, at_begin, function (value) { return _this(value); });

		return ko.computed({
			write: function (value) {
				_debounced(value);
			},
			read: function () { return _this(); }
		});
	};

	ko.subscribable.fn.throttled = function (delay) {
		delay = delay || 500;
		at_begin = at_begin || false;

		var _this = this;
		var _throttled = $.throttle(delay, function (value) { return _this(value); });

		return ko.computed({
			write: function (value) {
				_throttled(value);
			},
			read: function () { return _this(); }
		});
	};

	ko.subscribable.fn.onChange = function (callback) {
		this.subscribe(callback);
		return this;
	};

	ko.observable.fn.debouncedToFalse = function (delay) {
		delay = delay || 5000;

		var _this = this;

		var debouncedToFalse = $.debounce(delay, false, function () { _this(false); });

		this.subscribe(function (value) {
			if (value) { debouncedToFalse(); }
		});

		return this;
	};

	ko.observable.fn.toFalseOn = function () {
		var _this = this;

		var toFalse = function (value) {
			if (value) {
				_this(false);
			}
		};

		for (var i = 0; i < arguments.length; i++) {
			arguments[i].subscribe(toFalse);
		}

		return this;
	};

	ko.bindingHandlers.validate = {
		update: function (element, valueAccessor, a, b, c) {
			if (ko.unwrap(valueAccessor())) { $(element).valid(); }
		}
	};
})();