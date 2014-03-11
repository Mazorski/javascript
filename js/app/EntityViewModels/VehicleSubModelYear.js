function VehicleSubModelYear(options) {
	var _this = this;
	var _subModel = options.parent;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);

	this.SubModel = _subModel;
	this.Specifications = ko.onDemandObservable(this, Appcar.Data.DAL.OnDemand.Vehicle.SubModelYearSpecifications(options.data.ID), this.Specifications);
}