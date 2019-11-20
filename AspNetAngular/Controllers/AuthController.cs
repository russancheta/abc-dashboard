using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using AspNetAngular.Model;
using AspNetAngular.Auth;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;
using AspNetAngular.Helpers;
using System.Security.Claims;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using System;
using Microsoft.AspNetCore.Authorization;

namespace AspNetAngular.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : Controller
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly IJwtFactory _jwtFactory;
        private readonly JsonSerializerSettings _serializerSettings;
        private readonly JwtIssuerOptions _jwtOptions;
        private readonly AuthDbContext _context;

        public AuthController(UserManager<AppUser> userManager, IJwtFactory jwtFactory, IOptions<JwtIssuerOptions> jwtOptions, AuthDbContext context)
        {
            _userManager = userManager;
            _jwtFactory = jwtFactory;
            _jwtOptions = jwtOptions.Value;

            _serializerSettings = new JsonSerializerSettings
            {
                Formatting = Formatting.Indented
            };
            _context = context;
        }

        // POST api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<ResultReponser>> Login([FromBody]CredentialsViewModel credentials)
        {
            var identity = await GetClaimsIdentity(credentials.UserName, credentials.Password);
            if (identity != null)
            {
                // Serialize and return the response
                var user = await _userManager.FindByIdAsync(identity.Claims.Single(c => c.Type == "id").Value);
                var roles = await _userManager.GetRolesAsync(user);
                if (roles.FirstOrDefault() == "Super Admin")
                {
                    var auth_data = new
                    {
                        id = identity.Claims.Single(c => c.Type == "id").Value,
                        auth_token = await _jwtFactory.GenerateEncodedToken(credentials.UserName, identity),
                        expires_in = (int)_jwtOptions.ValidFor.TotalSeconds,
                        role = roles.FirstOrDefault(),
                        FullName = "Super Admin"
                    };
                    return new ResultReponser
                    {
                        Result = "success",
                        Message = "Authenticated",
                        ResponseData = auth_data
                    };
                }
                else
                {
                    var auth_data = new
                    {
                        id = identity.Claims.Single(c => c.Type == "id").Value,
                        auth_token = await _jwtFactory.GenerateEncodedToken(credentials.UserName, identity),
                        expires_in = (int)_jwtOptions.ValidFor.TotalSeconds,
                        role = roles.FirstOrDefault(),
                        // FullName = user.LastName + ", " + user.FirstName + " " + user.MiddleName[0] + ".",
                        FullName = user.FirstName,
                        user = user
                    };
                    return new ResultReponser
                    {
                        Result = "success",
                        Message = "Authenticated",
                        ResponseData = auth_data
                    };
                }
            }
            else
            {
                return new ResultReponser
                {
                    Result = "failed",
                    Message = "Incorrect username or Password",
                    ResponseData = ""
                };
            }
        }

        private async Task<ClaimsIdentity> GetClaimsIdentity(string userName, string password)
        {
            if (string.IsNullOrEmpty(userName) || string.IsNullOrEmpty(password))
                return await Task.FromResult<ClaimsIdentity>(null);

            // get the user to verifty
            var userToVerify = await _userManager.FindByNameAsync(userName);

            if (userToVerify == null) return await Task.FromResult<ClaimsIdentity>(null);

            // check the credentials
            if (await _userManager.CheckPasswordAsync(userToVerify, password))
            {
                return await Task.FromResult(_jwtFactory.GenerateClaimsIdentity(userName, userToVerify.Id));
            }

            // Credentials are invalid, or account doesn't exist
            return await Task.FromResult<ClaimsIdentity>(null);
        }
    }
}