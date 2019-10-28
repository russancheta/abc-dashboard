using System;

namespace AspNetAngular.Model
{
    public partial class ReportCompletion
    {
        public string DocStatus { get; set; }
        public int DocNum { get; set; }
        public string ITRNo { get; set; }
        public string BranchName { get; set; }
        public DateTime DocDate { get; set; }
        public string Status { get; set; }
        public int DaysDue { get; set; }
        public string InvTransferNo { get; set; }
        public string DocRemarks { get; set; }
    }
}