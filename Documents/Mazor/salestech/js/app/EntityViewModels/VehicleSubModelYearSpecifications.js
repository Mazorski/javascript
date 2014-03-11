function VehicleSubModelYearSpecifications(options) {
	var _this = this;
	var _parent = options.parent;

	options.data.DOTCodes = options.data.DOTCodes == null ? null : eval(options.data.DOTCodes);
	options.data.Accessories = options.data.Accessories == null ? null : eval(options.data.Accessories);

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);
}