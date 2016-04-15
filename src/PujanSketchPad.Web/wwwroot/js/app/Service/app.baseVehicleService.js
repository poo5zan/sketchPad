(function(sketchPadApp){

	sketchPadApp.baseVehicleService = ng.core.Class({
		constructor: function () { },
		getBaseVehicle: function () {
			var baseVehicles = [];
			var bv = new sketchPadApp.baseVehicleModel();
			bv.Id = 1;
			bv.CR = 'N';
			bv.YearFromId = '2014';
			bv.MakeId = 2;
			bv.MakeName = 'my make';
			bv.ModelId = 2;
			bv.ModelName = 'P model';
			bv.SeriesId = 12;
			bv.SeriesName = 'p series';
			baseVehicles.push(bv);

			var bv1 = new sketchPadApp.baseVehicleModel();
			bv1.Id = 2;
			bv1.CR = 'N';
			bv1.YearFromId = '2015';
			bv1.MakeId = 3;
			bv1.MakeName = 'my make 3';
			bv1.ModelId = 3;
			bv1.ModelName = 'P model 3';
			bv1.SeriesId = 12;
			bv1.SeriesName = 'p series';
			baseVehicles.push(bv1);

			var bv2 = new sketchPadApp.baseVehicleModel();
			bv2.Id = 3;
			bv2.CR = 'N';
			bv2.YearFromId = '2014';
			bv2.MakeId = 4;
			bv2.MakeName = 'my make 4';
			bv2.ModelId = 3;
			bv2.ModelName = 'P model 3';
			bv2.SeriesId = 12;
			bv2.SeriesName = 'p series';
			baseVehicles.push(bv2);

			return baseVehicles;
		}
	});

})(window.sketchPadApp || (window.sketchPadApp = {}));