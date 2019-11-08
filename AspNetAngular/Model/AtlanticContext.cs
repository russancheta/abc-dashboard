using Microsoft.EntityFrameworkCore;

namespace AspNetAngular.Model
{
    public partial class AtlanticContext : DbContext
    {
        public AtlanticContext()
        {

        }

        public AtlanticContext(DbContextOptions<AtlanticContext> options)
            :base(options)
            {
                
            }

        public virtual DbQuery<ProductionOrder> ProductionOrder { get; set; }
        public virtual DbQuery<ProdOrderDetails> ProdOrderDetails { get; set; }
        public virtual DbQuery<InvTransferDetails> InvTransferDetails { get; set; }
        public virtual DbQuery<ITRITDifference> ITRITDifference { get; set; }
        public virtual DbQuery<IssueForProduction> IssueForProduction { get; set; }
        public virtual DbQuery<IssueForProdDetails> IssueForProdDetails { get; set; }
        public virtual DbQuery<ReportCompletion> ReportCompletion { get; set; }
        public virtual DbQuery<RepCompletionDetails> RepCompletionDetails { get; set; }
        public virtual DbQuery<ProductionForecast> ProductionForecast { get; set; }
        public virtual DbQuery<ProductionForecastDetails> ProductionForecastDetails { get; set; }
        public virtual DbQuery<SQGRDifference> SQGRDifference { get; set; }
        public virtual DbQuery<JobOrder> JobOrder { get; set; }
        public virtual DbQuery<JobOrderDetails> JobOrderDetails { get; set; }
        public virtual DbQuery<ITRNos> ITRNos { get; set; }
        public virtual DbQuery<Branches> Branches { get; set;}
    }
}