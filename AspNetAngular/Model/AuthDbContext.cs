using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata;

namespace AspNetAngular.Model
{
    public partial class AuthDbContext : DbContext
    {
        public AuthDbContext()
        {
        }

        public AuthDbContext(DbContextOptions<AuthDbContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Pmremarks> Pmremarks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasAnnotation("ProductVersion", "2.2.6-servicing-10079");

            modelBuilder.Entity<Pmremarks>(entity =>
            {
                entity.ToTable("PMREMARKS");

                entity.Property(e => e.Id).HasColumnName("id");

                entity.Property(e => e.LogDate).HasColumnType("date");

                entity.Property(e => e.LogName)
                    .IsRequired()
                    .HasMaxLength(50);

                entity.Property(e => e.Remarks).IsRequired();

                entity.Property(e => e.Sqno).HasColumnName("SQNo");
            });
        }
    }
}
