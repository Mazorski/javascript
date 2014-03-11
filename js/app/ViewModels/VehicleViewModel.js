function VehicleViewModel(vehicle) {
	var _this = this;
	var $this = $(this);
	var _vehicle = vehicle || new Vehicle();
	var _data = ko.mapping.toJS(_vehicle);

	ko.mapping.fromJS(_data, Appcar.Data.Mapping, this);

	this.Connecting = ko.observable(false);
	this.Error = ko.observable(false).debouncedToFalse();

	this.Types = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.Types()).asCollection();
	this.Manufacturers = ko.onDemandObservableArray(this, function () { return !_this.TypeCode() ? null : Appcar.Data.DAL.Vehicle.Manufacturers(_this.TypeCode()); }).asCollection();
	this.Models = ko.onDemandObservableArray(this, function () { return !_this.ManufacturerCode() || !_this.TypeCode() ? null : Appcar.Data.DAL.Vehicle.Models(_this.ManufacturerCode(), _this.TypeCode()); }).asCollection();
	this.SubModels = ko.onDemandObservableArray(this, function () { return !_this.ModelID() ? null : Appcar.Data.DAL.Vehicle.SubModels(_this.ModelID()); }).asCollection();
	this.SubModelYears = ko.onDemandObservableArray(this, function () { return !_this.SubModelID() ? null : Appcar.Data.DAL.Vehicle.SubModelYears(_this.SubModelID()); }).asCollection();
	this.Ownerships = ko.onDemandObservableArray(this, Appcar.Data.DAL.OnDemand.Vehicle.Ownerships()).asCollection();

	this.Type = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.Type(_this.TypeCode()); }, this.Type);
	this.Manufacturer = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.Manufacturer(_this.ManufacturerCode()); }, this.Manufacturer);
	this.Model = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.Model(_this.ModelID()); }, this.Model);
	this.SubModel = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.SubModel(_this.SubModelID()); }, this.SubModel);
	this.SubModelYear = ko.onDemandObservable(this, function () { return Appcar.Data.DAL.Vehicle.SubModelYear(_this.SubModelYearID()); }, this.SubModelYear);
	this.CurrentOwnership = ko.onDemandObservable(this, function () { return !_this.CurrentOwnershipID() ? null : Appcar.Data.DAL.Vehicle.Ownership(_this.CurrentOwnershipID()); }, this.CurrentOwnership);
	this.LastOwnership = ko.onDemandObservable(this, function () { return !_this.LastOwnershipID() ? null : Appcar.Data.DAL.Vehicle.Ownership(_this.LastOwnershipID()); }, this.LastOwnership);

	this.TypeCode = ko.observable(_data.TypeCode).keyFor(this.Type, this.Types);
	this.ManufacturerCode = ko.observable(_data.ManufacturerCode).keyFor(this.Manufacturer, this.Manufacturers);
	this.ModelID = ko.observable(_data.ModelID).keyFor(this.Model, this.Models);
	this.SubModelID = ko.observable(_data.SubModelID).keyFor(this.SubModel, this.SubModels);
	this.SubModelYearID = ko.observable(_data.SubModelYearID).keyFor(this.SubModelYear, this.SubModelYears);
	this.CurrentOwnershipID = ko.observable(_data.CurrentOwnershipID).keyFor(this.CurrentOwnership, this.Ownerships);
	this.LastOwnershipID = ko.observable(_data.LastOwnershipID).keyFor(this.LastOwnership, this.Ownerships);

	this.Manufacturers.resetOn(this.TypeCode);
	this.Models.resetOn(this.TypeCode, this.ManufacturerCode);
	this.SubModels.resetOn(this.TypeCode, this.ManufacturerCode, this.ModelID);
	this.SubModelYears.resetOn(this.TypeCode, this.ManufacturerCode, this.ModelID, this.SubModelID);

	this.Connecting = ko.observable(false);

	this.Submit = ko.submit(this, function (data) { return _this.ID() == 0 ? Appcar.Data.DAL.Vehicle.Add(data) : Appcar.Data.DAL.Vehicle.Update(data); }, null, this.Connecting, this.Error, function (data) {
		if (_this.ID() == 0) {
			if (typeof data == 'number') {
				_this.ID(data);
				Appcar.Data.Copy(_this, _vehicle);
				ko.postbox.publish("VehicleAdded", _vehicle);
				$this.trigger('complete');
			}
			else { _this.Error(true); }
		}
		else {
			Appcar.Data.Copy(_this, _vehicle);
			$this.trigger('complete');
		}
	});

	//this.Title = ko.generated(function () {
	//	return (!_this.Manufacturer ? '' : _this.Manufacturer.Title() + ' - ') +
	//		   (!_this.Model ? '' : _this.Model.Title() + ' - ') +
	//		   (!_this.SubModel ? '' : _this.SubModel.Title() + ' - ') +
	//		   (!_this.SubModelYear ? '' : _this.SubModelYear.Year());
	//}, this.Manufacturer, this.Model, this.SubModel, this.SubModelYear);
}