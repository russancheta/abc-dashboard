using System;

namespace AspNetAngular.Model
{
    public partial class IPDetails
    {
        public string CashAcct { get; set; }
        public decimal CashSum { get; set; }
        public string CheckAcct { get; set; }
        public decimal CheckSum { get; set; }
        public string TrsfrAcct { get; set; }
        public decimal TrsfrSum { get; set; }
    }
}