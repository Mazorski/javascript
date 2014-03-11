(function ($) {
	$.extend($.validator.messages, {
		required: "שדה זה נחוץ",
		remote: "עלייך לתקן שדה זה",
		email: "כתובת דואר אלקטרוני לא תקינה",
		url: "כתובת לא תקינה",
		date: "תאריך לא תקין",
		dateISO: "תאריך לא תקין",
		number: "עלייך להכניס מספר",
		digits: "חייב להכיל אך ורק ספרות",
		creditcard: "מספר כרטיס אשראי לא תקין",
		equalTo: "עלייך להכניס את אותו הערך שוב",
		maxlength: $.validator.format("חייב להיות פחות מ-{0} תווים"),
		minlength: $.validator.format("חייב להיות לפחות {0} תווים."),
		rangelength: $.validator.format("חייב להיות בין {0} ל-{1} תווים."),
		range: $.validator.format("חייב להיות בין {0} ל-{1}."),
		max: $.validator.format("חייב להיות קטן או שווה ל-{0}."),
		min: $.validator.format("חייב להיות גדול או שווה ל-{0}."),
		regex: "ערך לא תקין"
	});
})(jQuery);