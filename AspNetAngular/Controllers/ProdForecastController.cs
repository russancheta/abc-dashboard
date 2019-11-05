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

    public class ProdForecast : ControllerBase
    {
        private readonly AtlanticContext _context;

        public ProdForecast(AtlanticContext context)
        {
            _context = context;
        }

        [HttpGet("getProductionForecast")]
        public async Task<ActionResult<IEnumerable<ProductionForecast>>> getProductionForecast(string branch)
        {
            var prodForecastQuery = @"
                select
					replace(a.Comments, 'ITR No. ', '') 'ITRNo',
                    A.DocDate,
                    A.DocNum,
					(select datediff(d, z.DocDate, GETDATE()) from OQUT z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
					cast(A.U_GIDocNum as varchar(50)) 'GoodsIssueNo',
					isnull((STUFF(( SELECT distinct ', ' + cast(z.DocNum as nvarchar(50))
					FROM OIGN z WHERE z.U_FCDocNum = a.DocNum FOR XML PATH('')),1,2,'')), '') 'GRDocNum',
					case
						when sum(B.Quantity) = sum(E.Quantity) or sum(E.Quantity) = sum(B.Quantity)
						then 'Fully Served'
						when sum(B.Quantity) > sum(E.Quantity)
						then 'Partially Served'
						when sum(E.Quantity) > sum(B.Quantity)
						then 'Over'
						when isnull(sum(E.Quantity),0) = 0
						then 'Unserved'
					end 'Status',
                    A.U_Remarks 'DocRemarks',
                    A.DocEntry
                from
                    OQUT A
					inner join QUT1 B on A.DocEntry = B.DocEntry
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
					left join OIGN C on A.DocEntry = C.U_FCDocEntry
					left join IGN1 E on C.DocEntry = E.DocEntry
                where
                    A.DocStatus = 'O'
                    and D.Name = {0}
                    and A.Comments like 'ITR N%'
				group by
					A.Comments,
					A.DocDate,
					A.DocNum,
					A.DocEntry,
					A.U_GIDocNum,
					A.U_Remarks,
                    A.DocEntry
                order by
                    A.DocNum";
            var prodForecast = await _context.ProductionForecast.FromSql(prodForecastQuery, branch).ToListAsync();
            return prodForecast;
        }

        [HttpGet("getProductionForecastDetails")]
        public async Task<ActionResult<IEnumerable<ProductionForecastDetails>>> getProductionForecastDetails(int docnum)
        {
            var prodForecastDetails = @"
                select
                    b.ItemCode,
                    b.Dscription 'Description',
                    b.Quantity,
                    b.PriceAfVAT,
                    b.LineTotal
                from
                    OQUT a
                    inner join QUT1 b on a.DocEntry = b.DocEntry
                where
                    a.DocNum = {0}
                order by
                    b.ItemCode";
            var forecastDetails = await _context.ProductionForecastDetails.FromSql(prodForecastDetails, docnum).ToListAsync();
            return forecastDetails;
        }

        [HttpGet("sqgrDifference")]
        public async Task<ActionResult<IEnumerable<SQGRDifference>>> getSQGRDifference(int docentry)
        {
            var sqgrDifference = @"
                SELECT 
                    T1.ItemCode, 
                    T1.Dscription, 
                    sum(T1.Quantity) 'Quantity'
                FROM 
                    OIGN T0 
                    INNER JOIN IGN1 T1 ON T0.DocEntry = T1.DocEntry 
                WHERE 
                    T0.U_FCDocEntry = {0}
                GROUP 
                    BY T1.ItemCode, 
                    T1.Dscription
                ORDER BY
                    T1.ItemCode";
            var sqgrResult = await _context.SQGRDifference.FromSql(sqgrDifference, docentry).ToListAsync();
            return sqgrResult;
        }
    }
}