using System;

namespace AspNetAngular.Model
{
    public partial class ProductionForecastDetails
    {
        public string ItemCode { get; set; }
        public string Description { get; set; }
        public decimal Quantity { get; set; }
        // public decimal PriceAfVAT { get; set; }
        // public decimal LineTotal { get; set; }
    }
}