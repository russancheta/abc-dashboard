using System;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;
using AspNetAngular.Model.DbQueryModel;

namespace AspNetAngular.Model
{
    public partial class AuthDbContext : IdentityDbContext<AppUser>
    {
        public AuthDbContext()
        {
        }

        public AuthDbContext(DbContextOptions<AuthDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<PMRemarks> PMRemarks { get; set; }
        public virtual DbSet<ITRMRemarks> ITRMRemarks { get; set; }
        public virtual DbQuery<Account> Account { get; set; }
        public virtual DbSet<UserLocations> UserLocations { get; set; }

        // protected override void OnModelCreating(ModelBuilder modelBuilder)
        // {
        //     modelBuilder.HasAnnotation("ProductVersion", "2.2.6-servicing-10079");

        //     modelBuilder.Entity<PMRemarks>(entity =>
        //     {
        //         entity.ToTable("PMREMARKS");

        //         entity.Property(e => e.Id).HasColumnName("id");

        //         entity.Property(e => e.LogDate).HasColumnType("date");

        //         entity.Property(e => e.LogName)
        //             .IsRequired()
        //             .HasMaxLength(50);

        //         entity.Property(e => e.Remarks).IsRequired();

        //         entity.Property(e => e.SQNo).HasColumnName("SQNo");
        //     });
        // }
    }
}
