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
    }
}