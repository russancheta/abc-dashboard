using System;

namespace AspNetAngular.Model
{
    public partial class ProductionOrder
    {
        public DateTime DocDate { get; set; }
        public string From  { get; set; }
        public string To  { get; set; }
        public int ITRNo { get; set; }
        public int DaysDue { get; set; }
        public string ITNo { get; set; }
        public string Status { get; set; }
        public string DocRemarks { get; set; }
        public string Group { get; set; }
        public int RemarksCount { get; set; }
    }
}