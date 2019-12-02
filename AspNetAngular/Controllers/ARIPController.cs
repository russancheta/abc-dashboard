using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AspNetAngular.Model;
using System.Data.SqlClient;

namespace AspNetAngular.Controllers
{
    [Route("api/controll")]
    [ApiController]

    public class ARIPMonit : ControllerBase
    {
        private readonly AtlanticContext _context;
        private readonly AuthDbContext _authDbContext;

        public ARIPMonit(AtlanticContext context, AuthDbContext authDbContext)
        {
            _authDbContext = authDbContext;
            _context = context;
        }

        [HttpGet("getARIP")]
        public async Task<ActionResult<IEnumerable<ARIPMonitoring>>> getARIP(string branch)
        {
            var rawQuery = @"
                select
                    A.DocDate,
                    A.DocNum 'ARNo',
                    case
                        when A.DocTotal = (select sum(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T0.DocNum = T1.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 AND T0.Canceled = 'N')
                        then datediff(d, A.DocDate,(select max(T0.DocDate) from ORCT T0 inner join RCT2 T1 on T0.DocNum = T1.DocNum WHERE T1.DocEntry = A.DocEntry AND T1.InvType = 13 and T0.Canceled = 'N'))
                        else datediff(d, A.DocDate, getdate())
                    end 'DaysDue',
                    A.CardName,
                    isnull((STUFF((SELECT distinct ', ' + cast(z.DocNum as nvarchar(50))
                                    from ORCT z inner join RCT2 z1 on z.DocNum = z1.DocNum where z1.DocEntry = A.DocEntry and z1.InvType = 13 and z.Canceled = 'N'
                                    FOR XML PATH('')),1,2,'')), '') 'IPNo',
                    '' 'Status',
                    A.DocTotal,
                    A.PaidSum,
                    isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0) 'TotalPayment',
                    A.DocEntry,
                    A.U_Remarks 'Remarks'
                from
                    OINV A
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
                    A.CANCELED = 'N'
                    and D.Name = {0}
                order by
                    A.DocDate";
            var queryResult = await _context.ARIPMonitoring.FromSql(rawQuery, branch).ToListAsync();
            return queryResult;
        }

        [HttpGet("getARIPDetails")]
        public async Task<ActionResult<IEnumerable<ARIPDetails>>> getARIPDetails(int docNum)
        {
            var rawQuery = @"
                select
                    a.ItemCode,
                    a.Dscription,
                    a.Quantity,
                    a.Price,
                    a.LineTotal
                from
                    INV1 a
                    inner join OINV b on a.DocEntry = b.DocEntry
                where
                    b.DocNum = {0}";
            var queryResult = await _context.ARIPDetails.FromSql(rawQuery, docNum).ToListAsync();
            return queryResult;
        }
    }
}