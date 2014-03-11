window.Appcar = window.Appcar || {};

var dataMapping = {
	ID: { create: function (options) { return ko.observable(options.data).asKey(); } },
	Code: { create: function (options) { return ko.observable(options.data).asKey(); } },
	BeginDateTime: { create: function (options) { return options.data ? moment(options.data).format('l') : null; } },
	EndDateTime: { create: function (options) { return options.data ? moment(options.data).format('l') : null; } },
	Vehicle: { create: function (options) { return options.data ? new Vehicle(options) : null; } },
	Vehicles: { create: function (options) { return options.data ? new Vehicle(options) : null; } },
	Type: { create: function (options) { return options.data ? new VehicleType(options) : null; } },
	Types: { create: function (options) { return options.data ? new VehicleType(options) : null; } },
	Manufacturer: { create: function (options) { return options.data ? new VehicleManufacturer(options) : null; } },
	Manufacturers: { create: function (options) { return options.data ? new VehicleManufacturer(options) : null; } },
	Model: { create: function (options) { return options.data ? new VehicleModel(options) : null; } },
	Models: { create: function (options) { return options.data ? new VehicleModel(options) : null; } },
	SubModel: { create: function (options) { return options.data ? new VehicleSubModel(options) : null; } },
	SubModels: { create: function (options) { return options.data ? new VehicleSubModel(options) : null; } },
	SubModelYear: { create: function (options) { return options.data ? new VehicleSubModelYear(options) : null; } },
	SubModelYears: { create: function (options) { return options.data ? new VehicleSubModelYear(options) : null; } },
	CurrentOwnership: { create: function (options) { return options.data ? new VehicleOwnership(options) : null; } },
	LastOwnership: { create: function (options) { return options.data ? new VehicleOwnership(options) : null; } },
	Ownerships: { create: function (options) { return options.data ? new VehicleOwnership(options) : null; } },
	Years: { create: function (options) { return options.data ? new VehicleSubModelYear(options) : null; } },
	Specifications: function (options) { return options.data ? new VehicleSubModelYearSpecifications(options) : null; },
	User: { create: function (options) { return options.data ? eval('new ' + (options.data.__type || 'User') + '(options)') : null; } }
};

var dal = {
	Vehicle: {
		All: function (includeData) { return Appcar.API.Vehicle.All(includeData); },
		Get: function (id, includeData) { return Appcar.API.Vehicle.Get(id, includeData); },
		Empty: function () { return Appcar.API.Vehicle.Empty(); },
		Add: function (viewModel) { return Appcar.API.Vehicle.Add(viewModel); },
		Update: function (viewModel) { return Appcar.API.Vehicle.Update(viewModel); },
		Type: function (id) { return Appcar.API.Vehicle.Type(id); },
		Types: function () { return Appcar.API.Vehicle.Types(); },
		Manufacturer: function (id) { return Appcar.API.Vehicle.Manufacturer(id); },
		Manufacturers: function (type) { return Appcar.API.Vehicle.Manufacturers(type); },
		Model: function (id) { return Appcar.API.Vehicle.Model(id); },
		Models: function (manufacturer, type) { return Appcar.API.Vehicle.Models(manufacturer, type); },
		SubModel: function (id) { return Appcar.API.Vehicle.SubModel(id); },
		SubModels: function (model) { return Appcar.API.Vehicle.SubModels(model); },
		SubModelYear: function (id) { return Appcar.API.Vehicle.SubModelYear(id); },
		SubModelYears: function (submodel) { return Appcar.API.Vehicle.SubModelYears(submodel); },
		SubModelYearSpecifications: function (id) { return Appcar.API.Vehicle.SubModelYearSpecifications(id); },
		Ownership: function (id) { return Appcar.API.Vehicle.Ownership(id); },
		Ownerships: function () { return Appcar.API.Vehicle.Ownerships(); }
	},
	User: {
		Current: function () { return Appcar.API.User.Current(); },
		Login: function (email, password) { return Appcar.API.User.Login(email, password); },
		Logout: function () { return Appcar.API.User.Logout(); },
		Register: function (viewModel) { return Appcar.API.User.Register(viewModel); }
	}
};

Appcar.API = $.proxies;

Appcar.Data = new CO.Types.DataEngine(dal, dataMapping);

Appcar.UI = new CO.Types.UIEngine();

Appcar.View = new CO.Types.ViewEngine(function (viewName) { return Appcar.API.View.Get(viewName); });

Appcar.Routing = new CO.Types.RoutingEngine();

Appcar.ViewModel = new CO.Types.ViewModelEngine();