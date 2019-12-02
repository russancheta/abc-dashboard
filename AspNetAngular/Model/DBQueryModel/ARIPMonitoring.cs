using System;

namespace AspNetAngular.Model
{
    public partial class ARIPMonitoring
    {
        public DateTime DocDate { get; set; }
        public int ARNo { get; set; }
        public int DaysDue { get; set; }
        public string CardName { get; set; }
        public string IPNo { get; set; }
        public string Status { get; set; }
        public decimal DocTotal { get; set; }
        public decimal PaidSum { get; set; }
        public decimal TotalPayment { get; set; }
        public int DocEntry { get; set; }
        public string Remarks { get; set; }
    }
}