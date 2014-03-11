function ResellerBranch(options) {
	var _this = this;
	var _parent = options.parent;

	ko.mapping.fromJS(options.data, Appcar.Data.Mapping, this);
}