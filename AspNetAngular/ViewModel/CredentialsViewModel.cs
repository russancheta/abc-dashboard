using FluentValidation.AspNetCore;
using AspNetAngular.ViewModel.Validations;

public class CredentialsViewModel
{
    public string UserName { get; set; }
    public string Password { get; set; }
}