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
                    (select datediff(d, z.DocDate, GETDATE()) from OQUT z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
                    cast(A.U_GIDocNum as varchar(50)) 'GoodsIssueNo',
                    A.U_Remarks 'DocRemarks'
                from
                    OQUT A
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
                    A.DocStatus = 'O'
                    --and A.DocDate between '2019-08-01' and '2019-08-08'
                    and D.Name = {0}
                                    ";
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
                                    ";
            var forecastDetails = await _context.ProductionForecastDetails.FromSql(prodForecastDetails, docnum).ToListAsync();
            return forecastDetails;
        }
    }
}