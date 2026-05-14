// Author: Salaams
using HMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace HMS.Infrastructure.Persistence.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // TPH — all user types share the Users table with a Discriminator column
        builder.ToTable("Users");
        builder.HasKey(u => u.Id);

        builder.HasDiscriminator<string>("UserType")
               .HasValue<GuestUser>("Guest")
               .HasValue<StaffUser>("Staff");

        builder.Property(u => u.Email).IsRequired().HasMaxLength(200);
        builder.Property(u => u.PasswordHash).IsRequired().HasMaxLength(500);
        builder.Property(u => u.Role).IsRequired().HasConversion<string>();

        builder.HasIndex(u => u.Email).IsUnique();
    }
}
