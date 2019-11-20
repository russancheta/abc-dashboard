using System;

namespace AspNetAngular.ViewModel
{
    public class AccountViewModel
    {
        public string UserName { get; set; }
        public string Password { get; set; }
        public string LastName { get; set; }
        public string FirstName { get; set; }
        public string MiddleName { get; set; }
        public bool PM { get; set; }
        public bool PMRemarks { get; set; }
        public bool PMPick { get; set; }
        public bool ITRM { get; set; }
        public bool ITRMRemarks { get; set; }
        public bool ITRMPick { get; set; }
        public string Role { get; set; }
        public string[] LocationAdd { get; set; }
        public string[] LocationDelete { get; set; }
    }
}