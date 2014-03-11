function VehicleModel(options) {
	var _this = this;
	var _manufacturer = getOfType(VehicleManufacturer, options.parent);

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping/*.Extend({ ignore: ['FullTitle'] })*/, this);

	this.Manufacturer = ko.onDemandObservable(this, Appcar.Data.DAL.OnDemand.Vehicle.Manufacturer(options.data.ManufacturerCode), this.Manufacturer);
	this.Type = ko.onDemandObservable(this, Appcar.Data.DAL.OnDemand.Vehicle.Type(options.data.TypeCode), this.Type);
	this.SubModels = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.SubModels(options.data.ID));

	//this.FullTitle = ko.generated(function () {
	//	return (!_this.Manufacturer ? null : _this.Manufacturer.Title() + ' - ') + _this.Title();
	//}, this.Manufacturer);
}