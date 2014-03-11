function MainViewModel() {
	var _this = this;
	ko.mapping.fromJS({}, Appcar.Data.Mapping, this);

	this.Auth = new AuthViewModel();
	this.Loading = ko.observable().subscribeTo("MainLoading");
}