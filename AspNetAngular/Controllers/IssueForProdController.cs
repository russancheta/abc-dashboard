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
    public class IssueForProd : ControllerBase
    {
        private readonly AtlanticContext _context;
        public IssueForProd(AtlanticContext context)
        {
            _context = context;
        }
        [HttpGet("getIssueForProd")]
        public async Task<ActionResult<IEnumerable<IssueForProduction>>> getIssueForProd(string branch)
        {
            var issueForProdQuery = @"
                select
                    case
                        when A.DocStatus = 'O'
                        then 'Open'
                        else 'Close'
                    end 'DocStatus',
                    a.DocNum,
                    '' 'ITRNo',
                    (select z.Name from [@BOCODE] z where z.Code = A.U_BranchCode) 'BranchName',
                    A.DocDate,
                    '' 'Status',
                    (select datediff(d, z.DocDate, GETDATE()) from OIGE z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
                    '' 'ReportCompletionNo',
                    A.U_Remarks 'DocRemarks'
                from
                    OIGE A
                    --inner join IGE1 B on A.DocEntry = B.DocEntry
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
                    --A.DocStatus = 'O'
                    --A.DocDate between '2019-08-01' and '2019-08-01'
                    D.Name = {0}
                                    ";
            var issueProd = await _context.IssueForProduction.FromSql(issueForProdQuery, branch).ToListAsync();
            return issueProd;
        }

        [HttpGet("getIssueProdDetails")]
        public async Task<ActionResult<IEnumerable<IssueForProdDetails>>> getIssueProdDetails(int docnum)
        {
            var issueProdDetailsQuery = @"
                select
                    b.ItemCode,
                    b.Dscription 'Description',
                    b.Quantity
                from
                    OWTQ a
                    inner join WTQ1 b on a.DocEntry = b.DocEntry
                where
                    a.DocNum = {0}
                                        ";
            var issueProdDetails = await _context.IssueForProdDetails.FromSql(issueProdDetailsQuery, docnum).ToListAsync();
            return issueProdDetails;
        }
    }
}