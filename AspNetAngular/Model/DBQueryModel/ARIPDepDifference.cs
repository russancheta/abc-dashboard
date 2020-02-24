using System;

namespace AspNetAngular.Model
{
    public partial class ARIPDepDifference
    {
        public DateTime DocDate { get; set; }
        public int DocNum { get; set; }
        public decimal DocTotal { get; set; }
        public decimal PaidSum { get; set; }
        public decimal TotalPayment { get; set; }
        public decimal TotalDeposit { get; set; }
    }
}