﻿using System;
using System.Collections.Generic;

namespace AspNetAngular.Model
{
    public partial class PMRemarks
    {
        public int Id { get; set; }
        public DateTime LogDate { get; set; }
        public string LogName { get; set; }
        public string Remarks { get; set; }
        public int SQNo { get; set; }
    }
}