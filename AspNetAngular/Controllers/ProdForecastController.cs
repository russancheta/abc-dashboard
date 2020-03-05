using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AspNetAngular.Model;
using System.Data.SqlClient;
using Microsoft.AspNetCore.Authorization;

namespace AspNetAngular.Controllers
{
    [Authorize (Policy = "ApiUser")]
    [Route("api/controllers")]
    [ApiController]

    public class ProdForecast : ControllerBase
    {
        private readonly AtlanticContext _context;
        private readonly AuthDbContext _authDbContext;

        public ProdForecast(AtlanticContext context, AuthDbContext authDbContext)
        {
            _authDbContext = authDbContext;
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
                    case
						when sum(B.Quantity) = sum(E.Quantity) or sum(E.Quantity) = sum(B.Quantity) or sum(E.Quantity) > sum(B.Quantity)
						then datediff(d, A.DocDate, max(C.DocDate))
						when sum(B.Quantity) > sum(E.Quantity) or isnull(sum(E.Quantity),0) = 0
						then DATEDIFF(d, A.DocDate, getdate())
					end 'DaysDue',
					cast(A.U_GIDocNum as varchar(50)) 'GoodsIssueNo',
					isnull((STUFF(( SELECT distinct ', ' + cast(z.DocNum as nvarchar(50))
					FROM OIGN z WHERE z.U_FCDocNum = a.DocNum FOR XML PATH('')),1,2,'')), '') 'GRDocNum',
					case
						when (select sum(isnull(z.Quantity,0)) from qut1 z where z.DocEntry = a.DocEntry) = sum(E.Quantity) or sum(E.Quantity) = (select sum(isnull(z.Quantity,0)) from qut1 z where z.DocEntry = a.DocEntry)
						then 'Fully Served'
						when sum(E.Quantity) < (select sum(isnull(z.Quantity,0)) from qut1 z where z.DocEntry = a.DocEntry)
						then 'Partially Served'
						when sum(E.Quantity) > (select sum(isnull(z.Quantity,0)) from qut1 z where z.DocEntry = a.DocEntry)
						then 'Over'
						when isnull(sum(E.Quantity),0) = 0
						then 'Unserved'
					end 'Status',
                    A.U_Remarks 'DocRemarks',
                    A.DocEntry,
                    (select count(z.SQNo) from [PRODMONIT].[dbo].[PMREMARKS] z where z.SQNo = A.DocNum) 'RemarksCount'
                from
                    OQUT A
					inner join QUT1 B on A.DocEntry = B.DocEntry
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
					left join OIGN C on A.DocEntry = C.U_FCDocEntry
					left join IGN1 E on C.DocEntry = E.DocEntry and E.ItemCode = B.ItemCode
                where
                    A.CANCELED = 'N'
                    and D.Name = {0}
                    and A.U_SQPicked = 'No'
                    --and A.Comments like 'ITR N%'
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
                    b.Quantity
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

        [HttpGet("getITCompareSQ")]
        public async Task<ActionResult<IEnumerable<ProductionForecastDetails>>> getITCompareSQ(string itrNo)
        {
            string rawQuery = @"
                DECLARE @SQL VARCHAR(MAX)
                DECLARE @ITRNO nvarchar(254)
                SET @ITRNO = @itr
                SET @SQL = 'SELECT 
                b.ItemCode,
                b.Dscription [Description],
                sum(b.quantity) [Quantity]
                FROM OWTQ a INNER JOIN
                WTQ1 b on b.DocEntry = a.DocEntry
                WHERE a.DocNum IN ('+@ITRNO+')
                GROUP By b.ItemCode,b.Dscription'
                EXEC (@SQL)";
            var details = await _context.ProductionForecastDetails.FromSql(rawQuery, new SqlParameter("itr", itrNo)).ToListAsync();
            return details;
        }

        [HttpGet("sqgrDifference")]
        public async Task<ActionResult<IEnumerable<SQGRDifference>>> getSQGRDifference(int docentry)
        {
            var sqgrDifference = @"
				SELECT
					T1.ItemCode,
                    T1.Dscription,
					isnull(T1.Quantity,0) 'SQQuantity',
					isnull(T2.Quantity,0) 'GRQuantity',
                    isnull(isnull(T2.Quantity,0) - isnull(T1.Quantity,0),0) 'Variance'
                FROM 
                    OQUT T0
					inner join QUT1 T1 ON T0.DocEntry = T1.DocEntry
					full outer join (select
										z.U_FCDocEntry,
										z1.ItemCode,
										z1.Quantity
									from
										OIGN z
										inner join IGN1 z1 on z.DocEntry = z1.DocEntry) T2 on T0.DocEntry = T2.U_FCDocEntry and T1.ItemCode = T2.ItemCode
                WHERE 
                    T0.DocEntry = {0}";
            var sqgrResult = await _context.SQGRDifference.FromSql(sqgrDifference, docentry).ToListAsync();
            return sqgrResult;
        }

        [HttpGet("getITRNos")]
        public async Task<ActionResult<IEnumerable<ITRNos>>> getITRNos(int docnum)
        {
            var rawQuery = @"
                select
                    replace(a.Comments, 'ITR No. ', '') 'ITRNo'
                from
                    OQUT A
                where
					A.DocNum = {0}";
            var itrNos = await _context.ITRNos.FromSql(rawQuery, docnum).ToListAsync();
            return itrNos;
        }

        [HttpPost("insertPMRemarks")]
        public async Task<ActionResult<ResultReponser>> insertPMRemarks(PMRemarks model)
        {
            _authDbContext.PMRemarks.Add(model);
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

        [HttpPut("updateSQRemarks")]
        public async Task<ActionResult<ResultReponser>> updateSQRemarks(string remarks, int sqNo)
        {
            var rawQuery = @"UPDATE A SET A.U_UpdateRemarks = {0} FROM ORDR A WHERE A.DocNum = {1}";
            var update = await _context.Database.ExecuteSqlCommandAsync(rawQuery, remarks, sqNo);
            if (update > 0)
            {
                return new ResultReponser
                {
                    Result = "success",
                    Message = "Successfully updated remarks",
                    ResponseData = ""
                };
            }
            else
            {
                return new ResultReponser
                {
                    Result = "failed",
                    Message = "failed to update remarks",
                    ResponseData = ""
                };
            }
        }

        [HttpGet("getPMRemarks")]
        public async Task<ActionResult<IEnumerable<PMRemarks>>> getPMRemarks(int sqNo)
        {
            var remarks = await _authDbContext.PMRemarks.Where(sq => sq.SQNo == sqNo).ToListAsync();
            return remarks;
        }

        [HttpPut("updateSQ")]
        public async Task<ActionResult<ResultReponser>> pickedSQ(int[] sqNo)
        {
            var updateQuery = @"update a set a.U_SQPicked = 'Yes' from OQUT a where a.DocNum = {0}";
            int updateCount = 0;
            foreach (int docNum in sqNo)
            {
                updateCount += await _context.Database.ExecuteSqlCommandAsync(updateQuery, docNum);
            }
            if (updateCount == sqNo.Length)
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