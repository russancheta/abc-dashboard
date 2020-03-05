using System;

namespace AspNetAngular.Model
{
    public partial class SQGRDifference
    {
        public string ItemCode { get; set; }
        public string Dscription { get; set; }
        public decimal SQQuantity { get; set; }
        public decimal GRQuantity { get; set; }
        public decimal Variance { get; set; }
    }
}