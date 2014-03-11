(function($) {
	"use strict";

	if (!$) { throw "jQuery is required"; }

	function getQueryString(params) {
		var queryString = "";
		for(var prop in params) {
			if (params.hasOwnProperty(prop)) {
				var val = getArgValue(params[prop]);
				if (val === null) continue;

				if (queryString.length) {
					queryString += "&";
				} else {
					queryString += "?";
				}
				queryString = queryString + prop + "=" +val;
			}
		}
		return queryString;
	}

	function getArgValue(val) {
		if (val === undefined || val === null) return null;
		return val;
	}

	function invoke(url, type, urlParams, body) {
		url += getQueryString(urlParams);

		var ajaxOptions = $.extend({}, this.defaultOptions, {
			url: url,
			type: type
		});

		if (body) {
			ajaxOptions.data = body;
		}

		if (this.antiForgeryToken) {
			var token = $.isFunction(this.antiForgeryToken) ? this.antiForgeryToken() : this.antiForgeryToken;
			if (token) {
				ajaxOptions.headers = ajaxOptions.headers || {};
				ajaxOptions.headers["X-RequestVerificationToken"] = token
			}
		}
	
		return $.ajax(ajaxOptions);
	};

	function defaultAntiForgeryTokenAccessor() {
		return $("input[name=__RequestVerificationToken]").val();
	};

	$.proxies = {
		Reseller: {
			defaultOptions: {},
			antiForgeryToken: defaultAntiForgeryTokenAccessor, 
		},
		Vehicle: {
			defaultOptions: {},
			antiForgeryToken: defaultAntiForgeryTokenAccessor, 
			Types: function() { return invoke.call(this, "/API/Vehicle/Types", "Get", {}); },
			Type: function(code) { return invoke.call(this, "/API/Vehicle/Type", "Get", { code: code }); },
			Manufacturers: function(type) { return invoke.call(this, "/API/Vehicle/Manufacturers", "Get", { type: type }); },
			Manufacturer: function(code) { return invoke.call(this, "/API/Vehicle/Manufacturer", "Get", { code: code }); },
			Models: function(manufacturer,type) { return invoke.call(this, "/API/Vehicle/Models", "Get", { manufacturer: manufacturer, type: type }); },
			Model: function(id) { return invoke.call(this, "/API/Vehicle/Model", "Get", { id: id }); },
			SubModels: function(model) { return invoke.call(this, "/API/Vehicle/SubModels", "Get", { model: model }); },
			SubModel: function(id) { return invoke.call(this, "/API/Vehicle/SubModel", "Get", { id: id }); },
			SubModelYears: function(subModel) { return invoke.call(this, "/API/Vehicle/SubModelYears", "Get", { subModel: subModel }); },
			SubModelYear: function(id) { return invoke.call(this, "/API/Vehicle/SubModelYear", "Get", { id: id }); },
			SubModelYearSpecifications: function(id) { return invoke.call(this, "/API/Vehicle/SubModelYearSpecifications", "Get", { id: id }); },
			Ownership: function(id) { return invoke.call(this, "/API/Vehicle/Ownership", "Get", { id: id }); },
			Ownerships: function() { return invoke.call(this, "/API/Vehicle/Ownerships", "Get", {}); },
			All: function(includeData) { return invoke.call(this, "/API/Vehicle/All", "Get", { includeData: includeData }); },
			Get: function(id,includeData) { return invoke.call(this, "/API/Vehicle/Get", "Get", { id: id, includeData: includeData }); },
			Empty: function() { return invoke.call(this, "/API/Vehicle/Empty", "Get", {}); },
			Add: function(viewModel) { return invoke.call(this, "/API/Vehicle/Add", "Post", {}, viewModel); },
			Update: function(viewModel) { return invoke.call(this, "/API/Vehicle/Update", "Post", {}, viewModel); },
			VehicleExists: function(licenseID,id) { return invoke.call(this, "/API/Vehicle/VehicleExists", "Get", { licenseID: licenseID, id: id }); },
		},
		Shop: {
			defaultOptions: {},
			antiForgeryToken: defaultAntiForgeryTokenAccessor, 
		},
		Package: {
			defaultOptions: {},
			antiForgeryToken: defaultAntiForgeryTokenAccessor, 
		},
		User: {
			defaultOptions: {},
			antiForgeryToken: defaultAntiForgeryTokenAccessor, 
			Current: function() { return invoke.call(this, "/API/User/Current", "Get", {}); },
			Login: function(email,password,remember) { return invoke.call(this, "/API/User/Login", "Post", { email: email, password: password, remember: remember }); },
			Logout: function() { return invoke.call(this, "/API/User/Logout", "Get", {}); },
			ConfirmRegistration: function(email,token,returnUrl) { return invoke.call(this, "/API/User/ConfirmRegistration", "Get", { email: email, token: token, returnUrl: returnUrl }); },
			ExternalLogin: function(provider) { return invoke.call(this, "/API/User/ExternalLogin", "Get", { provider: provider }); },
			ExternalLoginCallback: function() { return invoke.call(this, "/API/User/ExternalLoginCallback", "Get", {}); },
			Register: function(viewModel) { return invoke.call(this, "/API/User/Register", "Post", {}, viewModel); },
			EmailExists: function(email) { return invoke.call(this, "/API/User/EmailExists", "Get", { email: email }); },
			PhoneExists: function(phone) { return invoke.call(this, "/API/User/PhoneExists", "Get", { phone: phone }); },
		},
		View: {
			defaultOptions: {},
			antiForgeryToken: defaultAntiForgeryTokenAccessor, 
			Get: function(name) { return invoke.call(this, "/API/View", "Get", { name: name }); },
		}
	}
}(jQuery));