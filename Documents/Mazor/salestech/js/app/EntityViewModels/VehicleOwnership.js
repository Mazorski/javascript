function VehicleOwnership(options) {
	var _this = this;
	var _viewModel = options.parent;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

}