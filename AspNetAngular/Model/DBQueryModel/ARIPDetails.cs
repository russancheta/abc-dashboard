using System;

namespace AspNetAngular.Model
{
    public partial class ARIPDetails
    {
        public string ItemCode { get; set; }
        public string Dscription { get; set; }
        public decimal Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal LineTotal { get; set; }
    }
}