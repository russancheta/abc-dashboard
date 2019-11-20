using System;
using FluentValidation;
using AspNetAngular.ViewModel.Validations;


namespace AspNetAngular.ViewModel
{
    public class ChangePassViewModel
    {
        public string Id { get; set; }
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}