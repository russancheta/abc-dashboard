// using System;
// using System.Collections.Generic;
// using System.Linq;
// using System.Threading.Tasks;
// using AutoMapper;
// using Microsoft.AspNetCore.Authorization;
// using Microsoft.AspNetCore.Http;
// using Microsoft.AspNetCore.Identity;
// using Microsoft.AspNetCore.Mvc;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore.SqlServer;
// using AspNetAngular.Helpers;
// using AspNetAngular.Model;
// using AspNetAngular.Model.DbQueryModel;
// using AspNetAngular.ViewModel;
// using Microsoft.Extensions.Configuration;

// namespace AspNetAngular.Controllers
// {
//     [Authorize(Policy = "ApiUser")]
//     [Route("api/[controller]")]
//     [ApiController]
//     public class AccountController : ControllerBase
//     {
//         private readonly AuthContext _context;
//         private readonly UserManager<AppUser> _userManager;
//         private readonly IMapper _mapper;
//         public IConfiguration Configuration { get; }

//         public AccountController(UserManager<AppUser> userManager, IMapper mapper, AuthContext context, IConfiguration configuration)
//         {
//             _userManager = userManager;
//             _mapper = mapper;
//             _context = context;
//             Configuration = configuration;
//         }

//         // GET api/accounts
//         [HttpGet]
//         public async Task<ActionResult<IEnumerable<Account>>> getAllUsers()
//         {
//             var rawQuery = @"
//                 SELECT 
//                     a.Id,
//                     a.UserName,
//                     a.LastName,
//                     a.FirstName,
//                     a.MiddleName,
//                     a.Email,
//                     c.Name [RoleName]
//                 FROM 
//                     AspNetUsers a inner join 
//                     AspNetUserRoles b ON a.Id=b.UserId inner join
//                     AspNetRoles c ON c.Id=b.RoleId
//                 WHERE 
//                     c.Name != 'Super Admin'";
//             var users = await _context.Accounts.FromSql(rawQuery).ToListAsync;
//             return users;
//         }

//         // GET api/accounts/id
//         [HttpGet("searchUser{email}")]
//         public async Task<ActionResult<IEnumerable<Account>>> searchUser(string email = "")
//         {
//             var rawQuery = @"
//                 SELECT 
//                     a.Id,
//                     a.UserName,
//                     a.LastName,
//                     a.FirstName,
//                     a.MiddleName,
//                     a.Email,
//                     c.Name [RoleName]
//                 FROM 
//                     AspNetUsers a inner join 
//                     AspNetUserRoles b ON a.Id=b.UserId inner join
//                     AspNetRoles c ON c.Id=b.RoleId
//                 WHERE 
//                     c.Name != 'Super Admin'";
//             var users = await _context.Accounts.FromSql(rawQuery).Where(u => u.UserName.Contains(email)).ToListAsync();
//             return users;
//         }

        
//     }
// }