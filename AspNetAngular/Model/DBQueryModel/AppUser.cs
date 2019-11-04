using Microsoft.AspNetCore.Identity;
namespace orders.Model {
    // Add profile data for application users by adding properties to this class
    public class AppUser : IdentityUser {
        // Extended Properties
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public bool SQ { get; set; }
        public bool SQGenerateCEF { get; set; }
        public bool SQShowGLUCPDC { get; set; }
        public bool SQApprove { get; set; }
        public bool SQRemoveFromList { get; set; }
        public bool SQGenerateReport { get; set; }
        public bool SOM { get; set; }
        public bool SOMRemoveFromList { get; set; }
        public bool SOMGenerateReport { get; set; }
        public bool SOA { get; set; }
        public bool SOARemoveFromList { get; set; }
        public bool SOAGenerateReport { get; set; }
        public bool ORF { get; set; }
        public bool ORFLog { get; set; }
        public bool ORFGenerateReport { get; set; }
        public bool Dashboard { get; set; }
    }
}