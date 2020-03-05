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
                    isnull((STUFF((SELECT distinct ', ' + cast(z.DeposNum as nvarchar(50))
									from ODPS z inner join OCHH z1 on z.DeposId = z1.DpstAbs inner join ORCT z2 on z1.RcptNum = z2.DocNum inner join RCT2 z3 on z2.DocNum = z3.DocNum
									where z3.DocEntry = A.DocEntry and z3.InvType = 13 and z2.Canceled = 'N'
									FOR XML PATH('')),1,2,'')), '') 'DepositNo',
                    case
						when 
							A.DocTotal
							=
                            isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
						then 'Fully Paid'
						when
							isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
							>
							A.DocTotal
						then 'Over'
						when
							isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
							<
							A.DocTotal
							and
							isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
							<>
							0
						then 'Short'
						when
							isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
							=
							0
						then 'Unpaid'
					end as 'ARIPStatus',
                    case
						when
							isnull((SELECT SUM(T0.CheckSum) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocEntry WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
							=
							isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0)
							and
							isnull((SELECT SUM(T0.CheckSum) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocEntry WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
							<>
							0
							or
							isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0)
							<>
							0
						then 'Full Deposit'
						when
							isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0)
							>
							isnull((SELECT SUM(T0.CheckSum) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocEntry WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
						then
							'Over'
						when
							isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0)
							<
							isnull((SELECT SUM(T0.CheckSum) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocEntry WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0)
						then
							'Short'
						when
							isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0)
							=
							0
						then
							'Undeposited'
					end 'CSDepStatus',
                    A.DocTotal,
                    A.PaidSum,
                    isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocEntry WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0) 'TotalPayment',
                    isnull((SELECT SUM(T0.CheckSum) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocEntry WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0) 'CheckSum',
                    isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0) 'TotalDeposit',
                    A.DocEntry,
                    A.U_Remarks 'Remarks',
                    C.GroupName,
                    (select count(z.ARNo) from [PRODMONIT].[dbo].[ARMREMARKS] z where z.ARNo = A.DocNum) 'RemarksCount'
                from
                    OINV A
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
                    inner join OCRD B on A.CardCode = B.CardCode
                    inner join OCRG C on B.GroupCode = C.GroupCode
                where
                    A.CANCELED = 'N'
                    and D.Name = {0}
                    and A.U_SQPicked = 'No'
                order by
                    A.DocDate";
            var queryResult = await _context.ARIPMonitoring.FromSql(rawQuery, branch).ToListAsync();
            return queryResult;
        }

        [HttpGet("getARDetails")]
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

        [HttpGet("getIPDetails")]
        public async Task<ActionResult<IEnumerable<IPDetails>>> getIPDetails(int docNum)
        {
            var rawQuery = @"
                select
                    A.CashAcct,
                    A.CashSum,
                    A.CheckAcct,
                    A.CheckSum,
                    A.TrsfrAcct,
                    A.TrsfrSum
                from
                    ORCT A
                where
                    A.DocNum = {0}";
            var queryResult = await _context.IPDetails.FromSql(rawQuery, docNum).ToListAsync();
            return queryResult;
        }

        [HttpGet("getDepositDetails")]
        public async Task<ActionResult<IEnumerable<DepositDetails>>> getDepositDetails(int docNum)
        {
            var rawQuery = @"
                select
                    A.DeposNum,
                    A.DeposDate,
                    A.BanckAcct,
                    B.CheckDate,
                    B.CheckSum,
                    A.LocTotal
                from
                    ODPS A
                    inner join OCHH B ON A.DeposId = B.DpstAbs
                where
                    A.DeposNum = {0}";
            var queryResult = await _context.DepositDetails.FromSql(rawQuery, docNum).ToListAsync();
            return queryResult;
        }

        [HttpGet("getARIPDepDifference")]
        public async Task<ActionResult<IEnumerable<ARIPDepDifference>>> getARIPDepDifference(int docEntry)
        {
            var rawQuery = @"
                select
                    A.DocDate,
                    A.DocNum,
                    A.DocTotal,
                    A.PaidSum,
                    isnull((SELECT SUM(T1.SumApplied) FROM RCT2 T1 INNER JOIN ORCT T0 ON T1.DocNum = T0.DocNum WHERE T1.DocEntry = A.DocEntry and T1.InvType = 13 and T0.Canceled = 'N'),0) 'TotalPayment',
					isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs INNER JOIN ORCT Z2 ON Z1.RcptNum = Z2.DocEntry INNER JOIN RCT2 Z3 ON Z2.DocEntry = Z3.DocNum
							WHERE Z3.DocEntry = A.DocEntry AND z3.InvType = 13 and Z2.CANCELED = 'N'),0) 'TotalDeposit'
                from
                    OINV A
                    left join [@BOCODE] D on A.U_BranchCode = D.Code
					--left join ORCT B on A.DocEntry = B.DocEntry
					--left join OCHH C on B.DocNum = C.RcptNum
					--left join ODPS E on C.DpstAbs = E.DeposId
                where
                    A.DocEntry = {0}";
            var queryResult = await _context.ARIPDepDifference.FromSql(rawQuery, docEntry).ToListAsync();
            return queryResult;
        }

        [HttpGet("getCSDepDifference")]
        public async Task<ActionResult<IEnumerable<CSDepDifference>>> getCSDepDifference(int docNum)
        {
            var rawQuery = @"
                select
                    A.CheckSum,
					isnull((SELECT SUM(Z1.CheckSum) FROM ODPS Z INNER JOIN OCHH Z1 ON Z.DeposId = Z1.DpstAbs WHERE Z1.RcptNum = A.DocEntry),0) 'TotalDeposit'
                from
                    ORCT A
					inner join RCT2 B on A.DocEntry = B.DocNum
                where
                    A.DocNum = {0}
					and A.CANCELED = 'N'
					and B.InvType = 13";
            var queryResult = await _context.CSDepDifference.FromSql(rawQuery, docNum).ToListAsync();
            return queryResult;
        }

        [HttpPost("insertARMRemarks")]
        public async Task<ActionResult<ResultReponser>> insertARMRemarks(ARMRemarks model)
        {
            _authDbContext.ARMRemarks.Add(model);
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

        [HttpGet("getARMRemarks")]
        public async Task<ActionResult<IEnumerable<ARMRemarks>>> getARMRemarks(int arNo)
        {
            var remarks = await _authDbContext.ARMRemarks.Where(ar => ar.ARNo == arNo).ToListAsync();
            return remarks;
        }

        [HttpPut("updateAR")]
        public async Task<ActionResult<ResultReponser>> pickedAR(int[] arNo)
        {
            var updateQuery = @"update a set a.U_SQPicked = 'Yes' from OINV a where a.DocNum = {0}";
            int updateCount = 0;
            foreach(int docNum in arNo)
            {
                updateCount += await _context.Database.ExecuteSqlCommandAsync(updateQuery, docNum);
            }
            if (updateCount == arNo.Length)
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