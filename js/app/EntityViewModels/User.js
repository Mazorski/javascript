function User(options) {
	var _this = this;
	var _parent = options.parent;
	var _email = options.data.Email;
	var _name = options.data.Details ? options.data.Details.Name : null;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

	this.Title = _name ? _name : _email;
}