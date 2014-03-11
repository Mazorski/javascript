window.CO = window.CO || {};

(function ($) {
	CO.Types.UIEngine = function UIEngine(options) {
		var _this = this;
		var _initializeUI;
		var _initializeForm;
		var _formValidationOptions;
		var _dialogMapping = {};
		var _displayDialog = function () { };
		var _displayConfirmDialog = function () { };

		var __initializeForm = function (form) {
			var $form = $(form);

			$.validator.unobtrusive.parse($form);

			if (_formValidationOptions) {
				var validate = $form.validate();
				var settings = validate.settings;

				$.extend(settings, _formValidationOptions)
			}

			if (_initializeForm) { _initializeForm(form, $form.find('input,textarea,select').get()); }
		};

		this.InitializeUI = function (node) {
			node = node ? $(node) : $('body');

			if (_initializeUI) { _initializeUI(node[0]); }

			node.find('textarea[maxlength]').each(function () {
				var $this = $(this);
				var leftMargin = parseInt($this.css('margin-left') || $this.css('margin'));
				var bottomMargin = parseInt($this.css('margin-bottom') || $this.css('bottom'));
				var leftSpacing = 1;
				var bottomSpacing = -2;
				var count = $('<div><span>' + $this.val().length + '</span>/' + $this.attr('maxlength') + '</div>').addClass('chr-count').css({ position: 'absolute', bottom: (bottomMargin ? bottomMargin + bottomSpacing : bottomSpacing + 2) + 'px', left: (leftMargin ? leftMargin + leftSpacing : leftSpacing + 2) + 'px' });
				var container = $('<div/>').css({ overflow: 'auto', position: 'relative', left: '0px', top: '0px' }).append(count).insertBefore($this);

				$this.css({ paddingBottom: 17 });

				container.prepend($this);

				$this.keyup(function () { count.children('span').html($this.val().length); });
			});

			node.find('.digits-only').change(function () { $(this).val($(this).val().replace(/\D/g, '')); }).keydown(function (e) {
				var key = e.charCode || e.keyCode || 0;
				// allow backspace, tab, delete, arrows, numbers and keypad numbers ONLY
				// home, end, period, and numpad decimal
				return (
					key == 8 ||
					key == 9 ||
					key == 46 ||
					key == 110 ||
					key == 190 ||
					(key >= 35 && key <= 40) ||
					(key >= 48 && key <= 57) ||
					(key >= 96 && key <= 105));
			});
		};

		this.InitializeForm = __initializeForm;

		this.InitializeForms = function (node) {
			var $node = $(node);
			var $forms = $node.filter('form').add($node.find('form'));

			if ($forms.length > 0) {
				$.validator.unobtrusive.parse($forms);

				$forms.each(function () {
					__initializeForm(this);
				});
			}
		}

		this.Dialog = function (content, title, buttons) {
			if (_displayDialog) { _displayDialog(content, title, buttons); }
		};

		this.ConfirmDialog = function (content, title, yesCallback, noCallback) {
			if (_displayConfirmDialog) { _displayConfirmDialog(content, title, yesCallback, noCallback); }
		};

		this.DialogByMapping = function (id) {
			var mapping = _dialogMapping[id];
			if (mapping) {
				if (typeof mapping == 'string') {
					_this.Dialog(mapping, mapping);
				}
				else {
					_this.Dialog(mapping.content, mapping.title);
				}
			}
		};

		this.ConfirmDialogByMapping = function (id, yesCallback, noCallback) {
			var mapping = _dialogMapping[id];
			if (mapping) {
				if (typeof mapping == 'string') {
					_this.ConfirmDialog(mapping, mapping, yesCallback, noCallback);
				}
				else {
					_this.ConfirmDialog(mapping.content, mapping.title, yesCallback, noCallback);
				}
			}
		};

		this.Initialize = function (options) {

			_this.LoaderClass = options.loaderClass || 'loading';
			_this.SmallLoaderClass = options.smallLoaderClass || 'loading small';

			if (options.initializeUI) { _initializeUI = options.initializeUI; }
			if (options.initializeForm) { _initializeForm = options.initializeForm; }
			if (options.formValidationOptions) { _formValidationOptions = options.formValidationOptions; }
			if (options.displayDialog) { _displayDialog = options.displayDialog; }
			if (options.displayConfirmDialog) { _displayConfirmDialog = options.displayConfirmDialog; }
			if (options.dialogMapping) { _dialogMapping = options.dialogMapping; }

			$(function () { _this.InitializeUI(); });
		};

		CO.UI = this;
	}
})(jQuery);