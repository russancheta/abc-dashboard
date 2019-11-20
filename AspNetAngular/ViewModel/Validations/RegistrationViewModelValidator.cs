using FluentValidation;

namespace AspNetAngular.ViewModel.Validations
{
    public class RegistrationViewModelValidator : AbstractValidator<RegistrationViewModel>
    {
        public RegistrationViewModelValidator()
        {
            RuleFor(vm => vm.Password).NotEmpty().WithMessage("Password cannot be empty");
            RuleFor(vm => vm.UserName).NotEmpty().WithMessage("Email cannot be empty");
        }
    }
}