function VehicleType(options) {
	var _this = this;
	var _viewModel = options.parent;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

	this.Manufacturers = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.Manufacturers(options.data.Code));
}