using System;
using System.Collections.Generic;

namespace AspNetAngular.Model
{
    public partial class UserLocations
    {
        public int Id { get; set; }
        public string IdentityId { get; set; }
        public AppUser Identity { get; set; }  // navigation property
        public string Location { get; set; }
    }
}