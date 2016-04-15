using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PujanSketchPad.Web.ViewModels.Vehicles
{
    public class BaseVehicleViewModel
    {
        public int Id { get; set; }
        public string CR { get; set; }
        public DateTime YearFromId { get; set; }
        public int MakeId { get; set; }
        public string MakeName { get; set; }
        public int ModelId { get; set; }
        public string ModelName { get; set; }
        public int SeriesId { get; set; }
        public string SeriesName { get; set; }
    }
}
