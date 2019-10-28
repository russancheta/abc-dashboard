using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AspNetAngular.Model;

namespace AspNetAngular.Controllers
{
    [Route("api/controllers")]
    [ApiController]

    public class JobOrderMonitoring : ControllerBase
    {
        private readonly AtlanticContext _context;
        public JobOrderMonitoring(AtlanticContext context)
        {
            _context = context;
        }

        [HttpGet("getJobOrder")]
        public async Task<ActionResult<IEnumerable<JobOrder>>> getJobOrder(string cardName)
        {
            var jobOrderQuery = @"
                select
                    case
                        when A.DocStatus = 'O'
                        then 'Open'
                        else 'Close'
                    end 'DocStatus',
                    A.DocNum,
                    '' 'ITRNo',
                    A.CardName,
                    A.DocDate,
                    '' 'Status',
                    (select datediff(d, z.DocDate, GETDATE()) from OPOR z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
                    '' 'ProdForecastNo',
                    A.U_Remarks 'DocRemarks'
                from
                    OPOR A
                    --inner join IGE1 B on A.DocEntry = B.DocEntry
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
                    A.DocStatus = 'O'
                    --and A.DocDate between '2019-08-01' and '2019-08-08'
                    and D.Name = {0}
                                ";
            var jobOrder = await _context.JobOrder.FromSql(jobOrderQuery, cardName).ToListAsync();
            return jobOrder;
        }

        [HttpGet("getJobOrderDetails")]
        public async Task<ActionResult<IEnumerable<JobOrderDetails>>> getJobOrderDetails(int docnum)
        {
            var jobOrderDetails = @"
                select
                    b.ItemCode,
                    b.Dscription 'Description',
                    b.Quantity,
                    b.PriceAfVAT,
                    b.LineTotal
                from
                    OPOR a
                    inner join POR1 b on a.DocEntry = b.DocEntry
                where
                    a.DocNum = {0}
                                    ";
            var orderDetails = await _context.JobOrderDetails.FromSql(jobOrderDetails, docnum).ToListAsync();
            return orderDetails;
        }

    }
}