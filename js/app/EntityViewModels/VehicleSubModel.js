function VehicleSubModel(options) {
	var _this = this;
	var _model = options.parent;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

	this.Model = _model;
	this.Years = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.SubModelYears(options.data.ID));
}