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

    public class RepCompletion : ControllerBase
    {
        private readonly AtlanticContext _context;
        public RepCompletion(AtlanticContext context)
        {
            _context = context;
        }

        [HttpGet("getReportCompletion")]
        public async Task<ActionResult<IEnumerable<ReportCompletion>>> getReportCompletion(string branch) 
        {
            var reportCompletionQuery = @"
                select
                    case
                        when A.DocStatus = 'O'
                        then 'Open'
                        else 'Close'
                    end 'DocStatus',
                    a.DocNum,
                    '' 'ITRNo',
                    A.U_BranchCode 'BranchName',
                    A.DocDate,
                    '' 'Status',
                    (select datediff(d, z.DocDate, GETDATE()) from OIGN z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
                    '' 'InvTransferNo',
                    A.U_Remarks 'DocRemarks'
                from
                    OIGN A
                    --inner join IGE1 B on A.DocEntry = B.DocEntry
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
                    --A.DocStatus = 'O'
                    --A.DocDate between '2019-08-01' and '2019-08-01'
                    D.Name = {0}
                                        ";
            var reportCompletion = await _context.ReportCompletion.FromSql(reportCompletionQuery, branch).ToListAsync();
            return reportCompletion;
        }

        [HttpGet("getRepCompletionDetails")]
        public async Task<ActionResult<IEnumerable<RepCompletionDetails>>> GetRepCompletionDetails(int docnum)
        {
            var rawQuery = @"
                select
                    b.ItemCode,
                    b.Dscription 'Description',
                    b.Quantity
                from
                    OIGN a
                    inner join IGN1 b on a.DocEntry = b.DocEntry
                where
                    a.DocNum = {0}
                            ";
            var repCompDetails = await _context.RepCompletionDetails.FromSql(rawQuery, docnum).ToListAsync();
            return repCompDetails;
        }
    }
}