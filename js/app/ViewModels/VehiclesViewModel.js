function VehiclesViewModel() {
	var _this = this;
	var _emptyTemplate;

	ko.mapping.fromJS({}, Appcar.Data.Mapping, this);

	this.Vehicles = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.All(true), null, true).asCollection().asMainCollection('ID', Number);
	this.Types = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.Types()).asCollection();
	this.Manufacturers = ko.onDemandObservableArray(this, function () { return Appcar.Data.DAL.Vehicle.Manufacturers(_this.TypeCode()); }).asCollection();
	this.Models = ko.onDemandObservableArray(this, function () { return Appcar.Data.DAL.Vehicle.Models(_this.ManufacturerCode(), _this.TypeCode()); }).asCollection();
	this.SubModels = ko.onDemandObservableArray(this, function () { return Appcar.Data.DAL.Vehicle.SubModels(_this.ModelID()); }).asCollection();
	this.SubModelYears = ko.onDemandObservableArray(this, function () { return Appcar.Data.DAL.Vehicle.SubModelYears(_this.SubModelID()); }).asCollection();
	this.Ownerships = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.Ownerships()).asCollection();

	this.Vehicle = ko.observable();
	this.Type = ko.observable();
	this.Manufacturer = ko.observable();
	this.Model = ko.observable();
	this.SubModel = ko.observable();
	this.SubModelYear = ko.observable();
	this.CurrentOwnership = ko.observable();
	this.LastOwnership = ko.observable();

	this.VehicleID = ko.observable().keyFor(this.Vehicle, this.Vehicles);
	this.TypeCode = ko.observable().keyFor(this.Type, this.Types);
	this.ManufacturerCode = ko.observable().toNullOn(this.TypeCode).keyFor(this.Manufacturer, this.Manufacturers);
	this.ModelID = ko.observable().toNullOn(this.TypeCode, this.ManufacturerCode).keyFor(this.Model, this.Models);
	this.SubModelID = ko.observable().toNullOn(this.TypeCode, this.ManufacturerCode, this.ModelID).keyFor(this.SubModel, this.SubModels);
	this.SubModelYearID = ko.observable().toNullOn(this.TypeCode, this.ManufacturerCode, this.ModelID, this.SubModelID).keyFor(this.SubModelYear, this.SubModelYears);
	this.CurrentOwnershipID = ko.observable().keyFor(this.CurrentOwnership, this.Ownerships);
	this.LastOwnershipID = ko.observable().keyFor(this.LastOwnership, this.Ownerships);

	this.Manufacturers.resetOn(this.TypeCode);
	this.Models.resetOn(this.TypeCode, this.ManufacturerCode);
	this.SubModels.resetOn(this.TypeCode, this.ManufacturerCode, this.ModelID);
	this.SubModelYears.resetOn(this.TypeCode, this.ManufacturerCode, this.ModelID, this.SubModelID);

	this.Add = Appcar.Routing.Routed(this, function (context) {
		if (!_emptyTemplate) {
			Appcar.Data.DAL.Vehicle.Empty().done(function (data) {
				_emptyTemplate = data;
				Appcar.View.Load("Vehicle", new VehicleViewModel(_emptyTemplate), context.callback);
			});
		}
		else {
			Appcar.View.Load("Vehicle", new VehicleViewModel(_emptyTemplate), context.callback);
		}
	});

	ko.postbox.subscribe("VehicleAdded", function (vehicle) {
		var array = _this.Vehicles();
		array.unshift(vehicle);
		_this.Vehicles(array);
	});
}