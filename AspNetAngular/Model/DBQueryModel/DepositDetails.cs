using System;

namespace AspNetAngular.Model
{
    public partial class DepositDetails
    {
        public int DeposNum { get; set; }
        public DateTime DeposDate { get; set; }
        public string BanckAcct { get; set; }
        public DateTime CheckDate { get; set; }
        public decimal CheckSum { get; set; }
        public decimal LocTotal { get; set; }
    }
}