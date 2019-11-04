// using System;
// using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore;
// using Microsoft.EntityFrameworkCore.Metadata;
// using AspNetAngular.Model.DbQueryModel;

// namespace AspNetAngular.Model
// {
//     public partial class AuthContext : IdentityDbContext<AppUser>
//     {
//         public AuthContext() {}

//         public AuthContext(DbContextOptions<AuthContext> options) : base (options) {}

//         public virtual DbQuery<Account> Accounts { get; set; }
//     }
// }