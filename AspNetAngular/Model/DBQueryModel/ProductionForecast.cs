using System;

namespace AspNetAngular.Model
{
    public partial class ProductionForecast
    {
        public string ITRNo { get; set ;}
        public DateTime DocDate { get; set; }
        public int DocNum { get; set; }
        public int DaysDue { get; set; }
        public string GoodsIssueNo { get; set; }
        public string GRDocNum { get; set; }
        public string Status { get; set; }
        public string DocRemarks{ get; set; }
        public int DocEntry { get; set; }
    }
}