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
    [Route("api/controllers")]
    [ApiController]

    public class ProdOrder : ControllerBase
    {
        private readonly AtlanticContext _context;
        private readonly AuthDbContext _authDbContext;

        public ProdOrder(AtlanticContext context, AuthDbContext authDbContext)
        {
            _authDbContext = authDbContext;
            _context = context;
        }

        [HttpGet("getProductionOrder")]
        public async Task<ActionResult<IEnumerable<ProductionOrder>>> getProductionOrder(string branch, string group)
        {
            var prodOrderQuery = @"";
            if (group == "All")
            {
                prodOrderQuery = @"
                select
					A.DocDate,
					UPPER((select z.WhsName from OWHS z where z.WhsCode = A.Filler)) 'From',
					UPPER((select z.WhsName from OWHS z where z.WhsCode = A.ToWhsCode)) 'To',
                    A.DocNum 'ITRNo',
					--(select datediff(d, z.DocDate, GETDATE()) from OWTQ z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
                    case
						when sum(B.Quantity) = sum(C.Quantity) or sum(C.Quantity) = sum(B.Quantity) or sum(C.Quantity) > sum(B.Quantity)
						then datediff(d, A.DocDate, max(C.DocDate))
						when sum(B.Quantity) > sum(C.Quantity) or isnull(sum(C.Quantity),0) = 0
						then datediff(d, A.DocDate, getdate())
					end 'DaysDue',
					isnull((STUFF(( SELECT distinct ', ' + cast(z.DocNum as nvarchar(50))
					FROM OWTR z inner join WTR1 z1 on z.DocEntry = z1.DocEntry 
					WHERE z1.BaseEntry = a.DocEntry FOR XML PATH('')),1,2,'')), '') 'ITNo',
                    case
                        when sum(B.Quantity) = sum(C.Quantity) or sum(C.Quantity) = sum(B.Quantity)
                        then 'Fully Served'
                        when sum(B.Quantity) > sum(C.Quantity)
                        then 'Partially Served'
						when sum(C.Quantity) > sum(B.Quantity)
						then 'Over'
                        when isnull(sum(C.Quantity),0) = 0
                        then 'Unserved'
                    end 'Status',
                    a.U_Remarks 'DocRemarks',
                    '' 'Group'
                from
	                OWTQ A
	                inner join WTQ1 B on A.DocEntry = B.DocEntry
	                left join WTR1 C on B.DocEntry = C.BaseEntry and B.LineNum = C.BaseLine and B.ItemCode = C.ItemCode
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
	                A.DocStatus = 'O'
                    and D.Name = {0}
                    and A.U_SQPicked = 'No'
                group by
                    A.Filler,
					A.DocDate,
					A.ToWhsCode,
					A.DocNum,
					A.DocEntry,
					A.U_Remarks
				order by
					A.DocNum";
            }
            else
            {
                prodOrderQuery = @"SELECT 
                    *
                FROM (
                select
					A.DocDate,
					(select z.WhsName from OWHS z where z.WhsCode = A.Filler) 'From',
					(select z.WhsName from OWHS z where z.WhsCode = A.ToWhsCode) 'To',
                    A.DocNum 'ITRNo',
					(select datediff(d, z.DocDate, GETDATE()) from OWTQ z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
					isnull((STUFF(( SELECT distinct ', ' + cast(z.DocNum as nvarchar(50))
					FROM OWTR z inner join WTR1 z1 on z.DocEntry = z1.DocEntry 
					WHERE z1.BaseEntry = a.DocEntry FOR XML PATH('')),1,2,'')), '') 'ITNo',
                    case
                        when sum(B.Quantity) = sum(C.Quantity) or sum(C.Quantity) > sum(B.Quantity)
                        then 'Fully Served'
                        when sum(B.Quantity) > sum(C.Quantity)
                        then 'Partially Served'
						when sum(C.Quantity) > sum(B.Quantity)
						then 'Over'
                        when isnull(sum(C.Quantity),0) = 0
                        then 'Unserved'
                    end 'Status',
                    a.U_Remarks 'DocRemarks',
					case
						when (select z.WhsName from OWHS z where z.WhsCode = A.Filler) like '%Finished Goods%'
						then 'Finished Goods'
						when (select z.WhsName from OWHS z where z.WhsCode = A.Filler) like '%Raw Materials%'
						then 'Raw Materials'
						when (select z.WhsName from OWHS z where z.WhsCode = A.Filler) like '%Intermediate%'
						then 'Intermediate'
						when (select z.WhsName from OWHS z where z.WhsCode = A.Filler) like '%Packaging & Other Materials%'
						then 'Packaging & Other Materials'
					end 'Group'
                from
	                OWTQ A
	                inner join WTQ1 B on A.DocEntry = B.DocEntry
	                left join WTR1 C on B.DocEntry = C.BaseEntry and B.LineNum = C.BaseLine and B.ItemCode = C.ItemCode
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                    -- left join OWHS E on A.Filler = E.WhsCode
                where
	                A.DocStatus = 'O'
                    and D.Name = {0}
                    and A.U_SQPicked = 'No'
                    -- and E.WhsName like '@group'
                group by
                    A.Filler,
					A.DocDate,
					A.ToWhsCode,
					A.DocNum,
					A.DocEntry,
					A.U_Remarks) x1
                WHERE x1.[Group] = @group
                ORDER BY x1.ITRNo";
            }
            var forProd = await _context.ProductionOrder.FromSql(prodOrderQuery, branch,
            new SqlParameter("group", group)).ToListAsync();
            return forProd;
        }

        [HttpGet("filterITR")]
        public async Task<ActionResult<IEnumerable<FilterITR>>> FilterITR(string branch)
        {
            var rawQuery = @"
                select
					A.DocDate,
					(select z.WhsName from OWHS z where z.WhsCode = A.Filler) 'From',
					(select z.WhsName from OWHS z where z.WhsCode = A.ToWhsCode) 'To',
                    A.DocNum 'ITRNo',
					(select datediff(d, z.DocDate, GETDATE()) from OWTQ z where z.DocEntry = A.DocEntry and z.DocStatus = 'O') 'DaysDue',
					isnull((STUFF(( SELECT distinct ', ' + cast(z.DocNum as nvarchar(50))
					FROM OWTR z inner join WTR1 z1 on z.DocEntry = z1.DocEntry 
					WHERE z1.BaseEntry = a.DocEntry FOR XML PATH('')),1,2,'')), '') 'ITNo',
                    case
                        when sum(B.Quantity) = sum(C.Quantity) or sum(C.Quantity) > sum(B.Quantity)
                        then 'Fully Served'
                        when sum(B.Quantity) > sum(C.Quantity)
                        then 'Partially Served'
						when sum(C.Quantity) > sum(B.Quantity)
						then 'Over'
                        when isnull(sum(C.Quantity),0) = 0
                        then 'Unserved'
                    end 'Status',
                    a.U_Remarks 'DocRemarks'
                from
	                OWTQ A
	                inner join WTQ1 B on A.DocEntry = B.DocEntry
	                left join WTR1 C on B.DocEntry = C.BaseEntry and B.LineNum = C.BaseLine and B.ItemCode = C.ItemCode
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                where
	                A.DocStatus = 'O'
                    and D.Name = {0}
                group by
                    A.Filler,
					A.DocDate,
					A.ToWhsCode,
					A.DocNum,
					A.DocEntry,
					A.U_Remarks
				order by
					A.DocNum";
            var filterITR = await _context.FilterITR.FromSql(rawQuery, branch).ToListAsync();
            return filterITR;
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
                    a.DocNum = {0}";
            var prodDetails = await _context.ProdOrderDetails.FromSql(rawQuery, docnum).ToListAsync();
            return prodDetails;
        }

        [HttpGet("getITDetails")]
        public async Task<ActionResult<IEnumerable<InvTransferDetails>>> GetITDetails(int docnum)
        {
            var rawQuery = @"
                select
                    b.ItemCode,
                    b.Dscription,
                    b.Quantity
                from
                    OWTR a
                    inner join WTR1 b on a.DocEntry = b.DocEntry
                where
                    a.DocNum = {0}";
            var itDetails = await _context.InvTransferDetails.FromSql(rawQuery, docnum).ToListAsync();
            return itDetails;
        }

        [HttpGet("getDifference")]
        public async Task<ActionResult<IEnumerable<ITRITDifference>>> GetDifference(int docnum)
        {
            var rawQuery = @"
                select
                    b.ItemCode,
                    b.Dscription,
                    isnull(b.Quantity,0) 'ITRQuantity',
                    sum(isnull(c.Quantity,0)) 'ITQuantity'
                from
                    OWTQ a
                    inner join WTQ1 b on a.DocEntry = b.DocEntry
                    left join WTR1 c on b.DocEntry = c.BaseEntry and b.LineNum = c.LineNum and b.ObjType = c.BaseType
                where
                    a.DocNum = {0}
                group by
                    b.ItemCode,
                    b.Dscription,
                    b.Quantity
                order by
                    b.ItemCode";
            var itritDifference = await _context.ITRITDifference.FromSql(rawQuery, docnum).ToListAsync();
            return itritDifference;
        }

        [HttpPost("insertITRMRemarks")]
        public async Task<ActionResult<ResultReponser>> insertITRMRemarks(ITRMRemarks model)
        {
            _authDbContext.ITRMRemarks.Add(model);
            var insert = await _authDbContext.SaveChangesAsync();
            if (insert > 0)
            {
                return new ResultReponser
                {
                    Result = "success",
                    Message = "Insert Remarks..",
                    ResponseData = insert
                };
            }
            else
            {
                return new ResultReponser
                {
                    Result = "failed",
                    Message = "Failed to insert remarks.",
                    ResponseData = insert
                };
            }
        }

        [HttpGet("getITRMRemarks")]
        public async Task<ActionResult<IEnumerable<ITRMRemarks>>> getITRMRemarks(int itrNo)
        {
            var remarks = await _authDbContext.ITRMRemarks.Where(itr => itr.ITRNo == itrNo).ToListAsync();
            return remarks;
        }

        [HttpPut("updateITR")]
        public async Task<ActionResult<ResultReponser>> pickedITR(int[] itrNo)
        {
            var updateQuery = @"update a set a.U_SQPicked = 'Y' from OWTQ a where a.DocNum = {0}";
            int updateCount = 0;
            foreach(int docNum in itrNo)
            {
                updateCount += await _context.Database.ExecuteSqlCommandAsync(updateQuery, docNum);
            }
            if (updateCount == itrNo.Length)
            {
                return new ResultReponser
                {
                    Result = "Success",
                    Message = "All documents were updated",
                    ResponseData = ""
                };
            }
            else
            {
                return new ResultReponser
                {
                    Result = "Success",
                    Message = "Not all documents were updated",
                    ResponseData = ""
                };
            }
        }
    }
}