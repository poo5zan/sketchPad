(function (sketchPadApp) {
    sketchPadApp.baseVehicleComponent = ng.core
        .Component({            
            selector: 'baseVehicles',
            templateUrl: '/html/templates/baseVehicle.html',
            providers: [sketchPadApp.baseVehicleService]
        })
        .Class({
            constructor: [sketchPadApp.baseVehicleService, function (baseVehicleService) {
                debugger;
                this.baseVehicleModel = new sketchPadApp.baseVehicleModel;
               // this.baseVehicles = [];
                this.baseVehicles = baseVehicleService.getBaseVehicle();
                
            }],
            addBaseVehicle: function (baseVehicle) {
                debugger;

                this.baseVehicles.push(baseVehicle);
                               
                this.baseVehicleModel = new sketchPadApp.baseVehicleModel;
            },
            removeBaseVehicle: function (index) {
                debugger;
                this.baseVehicles.splice(index, 1);
            }
        })
})(window.sketchPadApp || (window.sketchPadApp = {}));