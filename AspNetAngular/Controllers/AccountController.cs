using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.SqlServer;
using AspNetAngular.Helpers;
using AspNetAngular.Model;
using AspNetAngular.Model.DbQueryModel;
using AspNetAngular.ViewModel;
using Microsoft.Extensions.Configuration;

namespace AspNetAngular.Controllers
{
    //[Authorize(Policy = "ApiUser")]
    [Route("api/[controller]")]
    [ApiController]

    public class AccountController : ControllerBase
    {
        private readonly AuthDbContext _context;
        private readonly UserManager<AppUser> _userManager;
        private readonly IMapper _mapper;
        public IConfiguration Configuration { get; }

        public AccountController(UserManager<AppUser> userManager, IMapper mapper, AuthDbContext context, IConfiguration configuration)
        {
            _userManager = userManager;
            _mapper = mapper;
            _context = context;
            Configuration = configuration;
        }

        // GET api/accounts
        [HttpGet("getAllUsers")]
        public async Task<ActionResult<IEnumerable<Account>>> GetAllUsers()
        {
            var rawQuery = @"
                select
                    a.Id,
                    a.UserName,
                    a.LastName,
                    a.FirstName,
                    a.MiddleName,
                    a.Email,
                    c.Name [RoleName]
                from
                    AspNetUsers a
                    inner join AspNetUserRoles b on a.Id = b.UserId
                    inner join AspNetRoles c on c.Id = b.RoleId
                where 
                    c.Name != 'Super Admin'";
            var users = await _context.Account.FromSql(rawQuery).ToListAsync();
            return users;
        }

        // GET api/accounts/id
        [HttpGet("searchUser{email}")]
        public async Task<ActionResult<IEnumerable<Account>>> searchUser(string email = "")
        {
            var rawQuery = @"
                select
                    a.Id,
                    a.UserName,
                    a.LastName,
                    a.FirstName,
                    a.MiddleName,
                    a.Email,
                    c.Name [RoleName]
                from
                    AspNetUsers a
                    inner join AspNetUserRoles b on a.Id = b.UserId 
                    inner join AspNetRoles c ON c.Id = b.RoleId
                where
                    c.Name != 'Super Admin'";
            var users = await _context.Account
                .FromSql(rawQuery)
                .Where(u => u.UserName.Contains(email))
                .ToListAsync();
            return users;
        }

        // GET api/accounts/id
        [HttpGet("viewUser/{user_id}")]
        public async Task<ActionResult<ResultReponser>> viewUser(string user_id)
        {
            var locations = await _context.UserLocations
                .Where(l => l.IdentityId == user_id)
                .Select(l => new
                {
                    Id = l.Id,
                    Location = l.Location
                }).ToListAsync();
            var roles = await _userManager.GetRolesAsync(await _userManager.FindByIdAsync(user_id));

            var user = await _userManager.Users
                .Where(u => u.Id == user_id)
                .Select(u => new
                {
                    LastName = u.LastName,
                    FirstName = u.FirstName,
                    MiddleName = u.MiddleName,
                    UserName = u.UserName,
                    Features = new
                    {
                        PM = u.PM,
                        PMRemarks = u.PMRemarks,
                        PMPick = u.PMPick,
                        ITRM = u.ITRM,
                        ITRRemarks = u.ITRMRemarks,
                        ITRMPick = u.ITRMPick,
                        ARM = u.ARM,
                        ARMRemarks = u.ARMRemarks,
                        ARMPick = u.ARMPick
                    },
                    Locations = locations,
                    Role = roles.FirstOrDefault()
                }
            ).FirstOrDefaultAsync();
            return new ResultReponser
            {
                Result = "Success",
                Message = "User Info",
                ResponseData = user
            };
        }

        // POST api/accounts
        [HttpPost]
        public async Task<ActionResult<ResultReponser>> Register([FromBody] RegistrationViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var email = await _userManager.FindByEmailAsync(model.UserName);
            if (email == null)
            {
                var userIdentity = _mapper.Map<AppUser>(model);
                var result = await _userManager.CreateAsync(userIdentity, model.Password);
                if (result.Succeeded)
                {
                    await _userManager.AddToRoleAsync(userIdentity, model.Role);
                    int insertLoc = 0;
                    foreach (string s in model.Location)
                    {
                        await _context.UserLocations.AddAsync(new UserLocations { IdentityId = userIdentity.Id, Location = s });
                        insertLoc += await _context.SaveChangesAsync();
                    }
                    if (insertLoc == model.Location.Length)
                    {
                        return new ResultReponser
                        {
                            Result = "success",
                            Message = "Account has successfully created!",
                            ResponseData = ""
                        };
                    }
                    else
                    {
                        return new ResultReponser
                        {
                            Result = "success",
                            Message = "Something problem location",
                            ResponseData = ""
                        };
                    }
                }
                else
                {
                    return new ResultReponser
                    {
                        Result = "badrequest",
                        Message = "Something Problem!",
                        ResponseData = ""
                    };
                }
            }
            else
            {
                return new ResultReponser
                {
                    Result = "failed",
                    Message = "Email Address is Already used!",
                    ResponseData = ""
                };
            }
        }

        // Delete api/accounts/id
        [HttpDelete("delete/{id}")]
        public async Task<ActionResult<ResultReponser>> DeleteAccount(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            var result = await _userManager.DeleteAsync(user);
            if (result.Succeeded)
            {
                return new ResultReponser
                {
                    Result = "Success",
                    Message = "Account has been removed",
                    ResponseData = ""
                };
            }
            else
            {
                return new ResultReponser
                {
                    Result = "Failed",
                    Message = "Something Problem",
                    ResponseData = ""
                };
            }
        }

        // PUT: api/Account/5
        [HttpPut("update/{user_id}")]
        public async Task<ActionResult<ResultReponser>> PutAccount(string user_id, [FromBody] AccountViewModel model)
        {
            var rawUpdateUser = @"
                UPDATE AspNetUsers 
                SET LastName = {1},
                FirstName = {2}, 
                MiddleName = {3},
                PM = {4},
                PMRemarks = {5},
                PMPick = {6},
                ITRM = {7},
                ITRRemarks = {8},
                ITRMPick = {9}
                WHERE Id = {0}";
            var updateUser = await _context.Database.ExecuteSqlCommandAsync(
                rawUpdateUser,
                user_id,
                model.LastName,
                model.FirstName,
                model.MiddleName,
                model.PM,
                model.PMRemarks,
                model.PMPick,
                model.ITRM,
                model.ITRMRemarks,
                model.ITRMPick);
            var rawUpdateRole = @"
                UPDATE AspNetUserRoles
                SET RoleId = (SELECT Id FROM AspNetRoles Where Name = {0})
                WHERE UserId = {1}";
            var updateRole = await _context.Database.ExecuteSqlCommandAsync(rawUpdateRole, model.Role, user_id);

            if (updateUser > 0 && updateRole > 0)
            {
                var rawQueryDelete = @"DELETE FROM UserLocations WHERE IdentityID = {0} and Location = {1}";

                foreach (string location in model.LocationDelete)
                {
                    await _context.Database.ExecuteSqlCommandAsync(rawQueryDelete, user_id, location);
                }

                foreach (string location in model.LocationAdd)
                {
                    var checkLoc = await _context.UserLocations
                        .Where(ul => ul.Location == location)
                        .Where(ul => ul.IdentityId == user_id)
                        .FirstOrDefaultAsync();
                    if (checkLoc == null)
                    {
                        await _context.UserLocations.AddAsync(new UserLocations { IdentityId = user_id, Location = location });
                        await _context.SaveChangesAsync();
                    }
                }
            }

            return new ResultReponser
            {
                Result = "Update",
                Message = "",
                ResponseData = ""
            };
        }

        [HttpPost("changepassword")]
        public async Task<ActionResult<ResultReponser>> ChangePassword([FromBody] ChangePassViewModel model)
        {
            var user = await _userManager.FindByIdAsync(model.Id);
            var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);
            if (result.Succeeded)
            {
                return new ResultReponser
                {
                    Result = "Success",
                    Message = "Successfully!",
                    ResponseData = ""
                };
            }
            else
            {
                return new ResultReponser
                {
                    Result = "Failed",
                    Message = "Invalid Password!",
                    ResponseData = ""
                };
            }
        }

        [HttpPost("resetPassword")]
        public async Task<ActionResult<ResultReponser>> ResetPassword([FromBody] ResetPasswordViewModel model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            await _userManager.RemovePasswordAsync(user);
            var result = await _userManager.AddPasswordAsync(user, Configuration.GetSection("AccountConfig")["DefaultPassword"]);
            if (result.Succeeded)
            {
                return new ResultReponser
                {
                    Result = "success",
                    Message = "Your password is successfully reset.",
                    ResponseData = ""
                };
            }
            else
            {
                return new ResultReponser
                {
                    Result = "failed",
                    Message = "Something problem",
                    ResponseData = ""
                };
            }
        }
    }
}