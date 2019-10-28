using System;

namespace AspNetAngular.Model
{
    public partial class ProductionForecast
    {
        public string DocStatus { get; set; }
        public int DocNum { get; set; }
        public string ITRNo { get; set ;}
        public string CardName { get; set; }
        public DateTime DocDate { get; set; }
        public string Status { get; set; }
        public int DaysDue { get; set; }
        public string GoodsIssueNo { get; set; }
        public string DocRemarks{ get; set; }
    }
}