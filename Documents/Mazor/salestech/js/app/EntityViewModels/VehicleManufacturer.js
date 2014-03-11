function VehicleManufacturer(options) {
	var _this = this;
	var _type = getOfType(VehicleType, options.parent);

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

	this.Type = _type;
	this.Models = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.Models(options.data.Code, _type && _type.Code()));
}