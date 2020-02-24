using Microsoft.AspNetCore.Identity;

namespace AspNetAngular.Model
{
    public class AppUser : IdentityUser
    {
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public bool PM { get; set; }
        public bool PMRemarks { get; set; }
        public bool PMPick { get; set; }
        public bool ITRM { get; set; }
        public bool ITRMRemarks { get; set; }
        public bool ITRMPick { get; set; }
        public bool ARM { get; set; }
        public bool ARMRemarks { get; set; }
        public bool ARMPick { get; set; }
    }
}