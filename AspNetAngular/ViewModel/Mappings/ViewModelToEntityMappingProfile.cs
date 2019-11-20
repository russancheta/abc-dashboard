using AutoMapper;
using AspNetAngular.Model;

namespace AspNetAngular.ViewModel.Mappings 
{
    public class ViewModelToEntityMappingProfile : Profile
    {
        public ViewModelToEntityMappingProfile()
        {
              CreateMap<RegistrationViewModel,AppUser>().ForMember(au => au.UserName, map => map.MapFrom(vm => vm.UserName));
        }
    }
}