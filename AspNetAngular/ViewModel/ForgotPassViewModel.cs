using System;
using FluentValidation;
using AspNetAngular.ViewModel.Validations;


namespace orders.ViewModels
{
    public class ForgotPassViewModel
    {
        public string UserName { get; set; }
        public string LastName { get; set; }
        public string Birthday { get; set; }
        public int SecretQuestion { get; set; }
        public string SecretAnswer { get; set; }
    }
}