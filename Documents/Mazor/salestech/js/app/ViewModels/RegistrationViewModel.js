function RegistrationViewModel(data) {
	data = data || {};
	var _this = this;
	var $this = $(this);

	ko.mapping.fromJS(data, Appcar.Data.Mapping, this);

	this.Email = ko.observable(data ? data.Email : null).asRouteArgument(String);
	this.Phone = ko.observable(data ? data.Phone : null).asRouteArgument(String);
	this.Password = ko.observable();
	this.ConfirmPassword = ko.observable();

	this.DisableEmail = ko.observable(data.Email);
	this.DisablePhone = ko.observable(data.Phone);

	this.Connecting = ko.observable(false).publishOn("MainLoading", true);
	this.Error = ko.observable(false).debouncedToFalse().toFalseOn(this.Connecting);

	this.Submit = ko.submit(this, Appcar.Data.DAL.User.Register, ['Email', 'Password', 'ConfirmPassword', 'Phone', 'Details', 'Token'], this.Connecting, this.Error, function (data) {
		$this.trigger('complete');
		if (data === null) {
			Appcar.UI.DialogByMapping('ConfirmRegistration');
		}
		else {
			ko.postbox.publish("Registered", data);
		}
	});
};