var bindingClasses = {
	Breadcrumbs: function () {
		return {
			foreach: CO.Routing.RouteTitles
		};
	},
	Auth: {
		Context: function () {
			return {
				'with': Appcar.ViewModel.Auth
			};
		},
		FadeConnected: function (context) {
			return {
				fadeVisible: Appcar.ViewModel.Auth.User
			};
		},
		Connected: function (context) {
			return {
				visible: Appcar.ViewModel.Auth.User
			};
		},
		FadeNotConnected: function (context) {
			return {
				fadeVisible: !Appcar.ViewModel.Auth.User()
			};
		},
		NotConnected: function (context) {
			return {
				visible: !Appcar.ViewModel.Auth.User()
			};
		},
		Wrong: function (context) {
			return {
				visible: Appcar.ViewModel.Auth.WrongCredentials
			};
		},
		Error: function (context) {
			return {
				visible: Appcar.ViewModel.Auth.Error
			};
		},
		User: function (context) {
			return {
				'with': Appcar.ViewModel.Auth.User
			};
		},
		Logout: function (context) {
			return {
				click: Appcar.ViewModel.Auth.Logout
			};
		}
	},
	Main: {
		Context: function (context) {
			return {
				'with': context.$root
			};
		},
		Loading: function (context) {
			return {
				visible: context.$root.Loading
			};
		}
	},
	Vehicle: {
		Context: function (context) {
			return {
				'with': this
			};
		},
		List: function (context) {
			return {
				foreach: this.Vehicles
			};
		},
		Item: function (context) {
			return {
				click: function () { context.$parent.Vehicle(this); }
			};
		},
		Types: {
			Options: function (context) {
				return {
					options: this.Types,
					value: this.TypeCode,
					optionsText: function (item) { return item.Title; },
					optionsValue: function (item) { return item.Code; },
					optionsCaption: 'בחר סוג רכב',
				};
			}
		},
		Manufacturers: {
			Options: function (context) {
				return {
					options: this.TypeCode() ? this.Manufacturers : [],
					value: this.ManufacturerCode,
					optionsText: function (item) { return item.Title; },
					optionsValue: function (item) { return item.Code; },
					optionsCaption: !this.TypeCode() ? 'בחר סוג רכב' : 'בחר יצרן'
				};
			}
		},
		Models: {
			Options: function (context) {
				return {
					options: this.ManufacturerCode() ? this.Models : [],
					value: this.ModelID,
					optionsText: function (item) { return item.Title; },
					optionsValue: function (item) { return item.ID; },
					optionsCaption: !this.TypeCode() ? 'בחר סוג רכב' : (!this.ManufacturerCode() ? 'בחר יצרן' : 'בחר דגם')
				};
			}
		},
		SubModels: {
			Options: function (context) {
				return {
					options: this.ModelID() ? this.SubModels : [],
					value: this.SubModelID,
					optionsText: function (item) { return item.Title; },
					optionsValue: function (item) { return item.ID; },
					optionsCaption: !this.TypeCode() ? 'בחר סוג רכב' : (!this.ManufacturerCode() ? 'בחר יצרן' : (!this.ModelID() ? 'בחר דגם' : 'בחר תת-דגם'))
				};
			}
		},
		SubModelYears: {
			Options: function (context) {
				return {
					options: this.SubModelID() ? this.SubModelYears : [],
					value: this.SubModelYearID,
					optionsText: function (item) { return item.Year; },
					optionsValue: function (item) { return item.ID; },
					optionsCaption: !this.TypeCode() ? 'בחר סוג רכב' : (!this.ManufacturerCode() ? 'בחר יצרן' : (!this.ModelID() ? 'בחר דגם' : (!this.SubModelID() ? 'בחר תת-דגם' : 'בחר שנה')))
				};
			}
		},
		SubModelYear: function (context) {
			return {
				'with': this.SubModelYear()
			};
		},
		SubModelYearSpecs: function (context) {
			return {
				'with': !this.SubModelYear() ? null : this.SubModelYear().Specifications
			};
		},
		CurrentOwnerships: {
			Options: function (context) {
				return {
					options: this.Ownerships,
					value: this.CurrentOwnershipID,
					optionsText: function (item) { return item.Title; },
					optionsValue: function (item) { return item.ID; },
					optionsCaption: 'בחר בעלות'
				};
			}
		},
		LastOwnerships: {
			Options: function (context) {
				return {
					options: this.Ownerships,
					value: this.LastOwnershipID,
					optionsText: function (item) { return item.Title; },
					optionsValue: function (item) { return item.ID; },
					optionsCaption: 'בחר בעלות'
				};
			}
		}
	}
}; ko.bindingProvider.instance = new ko.classBindingProvider(bindingClasses, { fallback: true });