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
    public class BranchList : ControllerBase
    {
        private readonly AtlanticContext _context;
        public BranchList(AtlanticContext context)
        {
            _context = context;
        }
        [HttpGet("getBranchList")]
        public async Task<ActionResult<IEnumerable<Branches>>> getBranchList()
        {
            var branchListQuery = @"
                select
	                a.Code,
	                a.Name
                from
	                [@BOCODE] a
                order by
                    a.Name";
            var branchList = await _context.Branches.FromSql(branchListQuery).ToListAsync();
            return branchList;
        }

        [HttpGet("getLocationList")]
        public async Task<ActionResult<IEnumerable<Locations>>> getLocationList()
        {
            var branchListQuery = @"
                select
	                a.Name [Location]
                from
	                [@BOCODE] a
                order by
                    a.Name";
            var branchList = await _context.Locations.FromSql(branchListQuery).ToListAsync();
            return branchList;
        }

        [HttpGet("getCustomerGroup")]
        public async Task<ActionResult<IEnumerable<CustomerGroup>>> getCustomerGroup()
        {
            var bpGroup = @"
                select
                    A.Groupname
                from
                    OCRG A
                where
                    A.GroupType = 'C'";
            var groupCode = await _context.CustomerGroup.FromSql(bpGroup).ToListAsync();
            return groupCode;
        }
    }
}