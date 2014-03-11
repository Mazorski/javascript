function AuthViewModel() {
	var _this = this;

	ko.mapping.fromJS({}, Appcar.Data.Mapping, this);

	this.Email = ko.observable();
	this.Password = ko.observable();
	this.RememberMe = ko.observable(false);

	this.User = ko.onDemandObservable(this, Appcar.Data.DAL.OnDemand.User.Current()).authPrincipal();

	this.Connecting = ko.observable(false).bindTo(this.User.loading).publishOn("MainLoading", true);
	this.Wrong = ko.observable(false).debouncedToFalse().toFalseOn(this.Connecting);
	this.Error = ko.observable(false).debouncedToFalse().toFalseOn(this.Connecting);
	this.FocusEmail = ko.observable(false);

	var __login = function (email, password, remember, success) {
		_this.Connecting(true);
		Appcar.Data.DAL.User.Login(email, password, remember).done(function (loggedIn) {
			if (loggedIn) {
				_this.User.reload();
				if (success) { success(); }
			}
			else {
				_this.Wrong(true);
			}
		}).fail(function () {
			_this.Error(true);
		}).complete(function () {
			_this.Connecting(false);
		});
	};

	this.FacebookLogin = function () {
		ExternalLogin('Facebook');
	};

	this.GoogleLogin = function () {
		ExternalLogin('Google');
	};

	this.Login = function (form) {
		__login(_this.Email(), _this.Password(), _this.RememberMe(), function () {
			_this.Email(null).Password(null);
		});
	};

	this.Logout = function () {
		_this.Connecting(true);
		Appcar.Data.DAL.User.Logout().done(function () {
			_this.User(null);
		}).complete(function () {
			_this.Connecting(false);
		});
	};

	this.Register = function () {
		_this.Connecting(true);
		Appcar.View.Load('Registration', new RegistrationViewModel(), function () {
			_this.Connecting(false);
		});
	};

	this.Reload = function (callback) {
		_this.User.reload(callback);
	};

	ko.postbox.subscribe("Registered", function (data) {
		__login(data.Email, data.Password, true);
	});
}