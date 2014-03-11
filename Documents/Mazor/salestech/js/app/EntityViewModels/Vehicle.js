function Vehicle(options) {
	var _this = this;
	var _parent = options.parent;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

	this.Type = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.Type(_this.TypeCode()); }, this.Type);
	this.Manufacturer = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.Manufacturer(_this.ManufacturerCode()); }, this.Manufacturer);
	this.Model = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.Model(_this.ModelID()); }, this.Model);
	this.SubModel = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.SubModel(_this.SubModelID()); }, this.SubModel);
	this.SubModelYear = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.SubModelYear(_this.SubModelYearID()); }, this.SubModelYear);
	this.CurrentOwnership = ko.onDemandObservable(this, function () { return !_this.CurrentOwnershipID() ? null : Appcar.Data.DAL.Vehicle.Ownership(_this.CurrentOwnershipID()); }, this.CurrentOwnership);
	this.LastOwnership = ko.onDemandObservable(this, function () { return !_this.LastOwnershipID() ? null : Appcar.Data.DAL.Vehicle.Ownership(_this.LastOwnershipID()); }, this.LastOwnership);

	this.Edit = Appcar.Routing.CollectionRouted(_parent, this, options.data.ID, function (context) {
		Appcar.View.Load("Vehicle", new VehicleViewModel(_this), context.callback);
	});

	this.Info = Appcar.Routing.CollectionRouted(_parent, this, options.data.ID, function (context) {
		Appcar.View.Load("VehicleInfo", new VehicleViewModel(_this), context.callback);
	});

	this.Delete = function () {

	};

	//this.Title = ko.generated(function () {
	//	return (!_this.Manufacturer ? '' : _this.Manufacturer.Title() + ' - ') +
	//		   (!_this.Model ? '' : _this.Model.Title() + ' - ') +
	//		   (!_this.SubModel ? '' : _this.SubModel.Title() + ' - ') +
	//		   (!_this.SubModelYear ? '' : _this.SubModelYear.Year());
	//}, this.Manufacturer, this.Model, this.SubModel, this.SubModelYear);
}