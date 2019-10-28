interface NavAttributes {
  [propName: string]: any;
}
interface NavWrapper {
  attributes: NavAttributes;
  element: string;
}
interface NavBadge {
  text: string;
  variant: string;
}
interface NavLabel {
  class?: string;
  variant: string;
}

export interface NavData {
  name?: string;
  url?: string;
  icon?: string;
  badge?: NavBadge;
  title?: boolean;
  children?: NavData[];
  variant?: string;
  attributes?: NavAttributes;
  divider?: boolean;
  class?: string;
  label?: NavLabel;
  wrapper?: NavWrapper;
}

export const navItems: NavData[] = [
  // {
  //   name: 'Dashboard',
  //   url: '/dashboard',
  //   icon: 'icon-speedometer',
  //   badge: {
  //     variant: 'info',
  //     text: 'NEW'
  //   }
  // },
  {
    title: true,
    name: 'Main'
  },
  {
    name: 'Production Order (ITR)',
    url: '/production-order',
    icon: 'fa fa-copy'
  },
  {
    name: 'Issue For Production (GI)',
    url: '/goods-issue',
    icon: 'fa fa-file'
  },
  {
    name: 'Report Completion (GR)',
    url: '/goods-receipt',
    icon: 'fa fa-check'
  },
  {
    name: 'Production Forecast (SQ)',
    url: '/for-production',
    icon: 'fa fa-paste' 
  },
  {
    name: 'Job Order Monitoring (PO)',
    url: '/joborder-monitoring',
    icon: 'fa fa-desktop'
  }
];
