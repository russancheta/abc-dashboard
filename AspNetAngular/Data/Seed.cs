using System;
using System.Threading.Tasks;
using AspNetAngular.Model;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace AspNetAngular.Data
{
    public static class Seed
    {
        public static async Task CreateRoles(IServiceProvider serviceProvider, IConfiguration configuration)
        {
            // adding custom roles
            var RoleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var UserManager = serviceProvider.GetRequiredService<UserManager<AppUser>>();

            string[] roleNames = {
                "Super Admin",
                "Admin",
                "Super User",
                "Employee",
                "Accounting",
                "Logistics",
                "Sales",
                "Supervisor Accounting",
                "Supervisor Logistics",
                "Supervisor Sales"
            };
            IdentityResult roleResult;

            foreach (var roleName in roleNames)
            {
                // creating the roles and seeding them to the database
                var roleExist = await RoleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    roleResult = await RoleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // creating a super user who could maintain the web app
            var powerUser = new AppUser
            {
                UserName = configuration.GetSection("UserSettings")["UserEmail"],
                Email = configuration.GetSection("UserSettings")["UserEmail"]
            };

            string UserPassword = configuration.GetSection("UserSettings")["UserPassword"];
            var _user = await UserManager.FindByEmailAsync(configuration.GetSection("UserSettings")["UserEmail"]);

            if (powerUser != null)
            {
                var user = await UserManager.FindByNameAsync(powerUser.UserName);
                if (user == null)
                {
                    var createPowerUser = await UserManager.CreateAsync(powerUser, UserPassword);
                    if (createPowerUser.Succeeded)
                    {
                        // here we assign the new user the "Admin" role
                        await UserManager.AddToRoleAsync(powerUser, "Super Admin");
                    }
                }
            }
        }
    }
}