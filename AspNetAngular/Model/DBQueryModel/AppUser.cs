using Microsoft.AspNetCore.Identity;
namespace orders.Model
{
    // Add profile data for application users by adding properties to this class
    public class AppUser : IdentityUser
    {
        // Extended Properties
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public bool PM { get; set; }
        public bool PMRemarks { get; set; }
        public bool PMPick { get; set; }
        public bool ITRM { get; set; }
        public bool ITRMRemarks { get; set; }
        public bool ITRMPick { get; set; }
        public bool Dashboard { get; set; }
    }
}