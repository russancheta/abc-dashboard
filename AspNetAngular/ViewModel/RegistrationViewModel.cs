using System;
using FluentValidation;
using AspNetAngular.ViewModel.Validations;

namespace AspNetAngular.ViewModel
{
    public class RegistrationViewModel
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
        public string[] Location { get; set; }
        public string Role { get; set; }
    }
}