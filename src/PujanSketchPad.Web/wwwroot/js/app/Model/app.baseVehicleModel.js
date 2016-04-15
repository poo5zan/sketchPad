
(function (sketchPadApp) {
    var baseVehicleModel = function () {
        var self = this;
        self.Id = 0;
        self.CR = '';
        self.YearFromId = '';
        self.MakeId = 0;
        self.MakeName = '';
        self.ModelId = 0;
        self.ModelName = '';
        self.SeriesId = 0;
        self.SeriesName = '';
    }

    sketchPadApp.baseVehicleModel = baseVehicleModel;
    
})(window.sketchPadApp || (window.sketchPadApp = {}));