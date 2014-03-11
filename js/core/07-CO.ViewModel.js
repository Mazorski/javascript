window.CO = window.CO || {};

(function ($) {
	CO.Types.ViewModelEngine = function ViewModelEngine(options) {
		var _this = this;

		this.Main = new MainViewModel();
		this.Auth = this.Main.Auth;

		this.Initialize = function () {
			$(function () {
				ko.applyBindings(_this.Main);
			});
		};

		CO.ViewModel = this;
	}
})(jQuery);