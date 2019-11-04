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

    public class ProdOrder : ControllerBase
    {
        private readonly AtlanticContext _context;

        public ProdOrder(AtlanticContext context)
        {
            _context = context;
        }

        [HttpGet("getProductionOrder")]
        public async Task<ActionResult<IEnumerable<ProductionOrder>>> getProductionOrder(string branch)
        {
            var prodOrderQuery = @"
                select
                    case
                        when A.DocStatus = 'O'
                        then 'Open'
                        else 'Close'
                    end 'DocStatus',
                    A.DocNum,
                    D.Name 'BranchName',
                    A.DocDate,
                    case
                        when sum(B.Quantity) = sum(C.Quantity) or sum(C.Quantity) > sum(B.Quantity)
                        then 'Fully Served'
                        when sum(B.Quantity) > sum(C.Quantity)
                        then 'Partial'
                        when isnull(sum(C.Quantity),0) = 0
                        then 'Unserved'
                    end 'Status',
                    (select datediff(d, z.DocDate, GETDATE()) from OWTQ z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
                    '' 'ProdForecastNo',
                    a.U_Remarks 'DocRemarks'
                from
	                OWTQ A
	                inner join WTQ1 B on A.DocEntry = B.DocEntry
	                left join WTR1 C on B.DocEntry = C.BaseEntry and B.LineNum = C.BaseLine and B.ItemCode = C.ItemCode
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
	                A.DocStatus = 'O'
                    --and A.DocDate between '2019-07-01' and '2019-07-1'
                    and D.Name = {0}
                group by
                    A.DocStatus,
                    A.DocNum,
                    A.U_BranchCode,
                    A.DocDate,
                    A.DocEntry,
                    A.U_Remarks,
                    D.Name
                            ";
            var forProd = await _context.ProductionOrder.FromSql(prodOrderQuery, branch).ToListAsync();
            return forProd;
        }
        
        [HttpGet("getProdDetails")]
        public async Task<ActionResult<IEnumerable<ProdOrderDetails>>> GetProdOrderDetails(int docnum)
        {
            var rawQuery = @"
                select
                    b.ItemCode,
                    b.Dscription 'Description',
                    b.Quantity,
                    isnull(c.Quantity,0) 'ITQuantity'
                from
                    OWTQ a
                    inner join WTQ1 b on a.DocEntry = b.DocEntry
                    left join WTR1 c on b.DocEntry = c.BaseEntry and b.LineNum = c.BaseLine and b.ObjType = c.BaseType
                where
                    a.DocNum = {0}
                            ";
            var prodDetails = await _context.ProdOrderDetails.FromSql(rawQuery, docnum).ToListAsync();
            return prodDetails;
        }
    }
}