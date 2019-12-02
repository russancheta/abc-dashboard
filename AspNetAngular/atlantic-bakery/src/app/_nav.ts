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
    name: 'Prod. Monitoring',
    url: '/for-production',
    icon: 'fa fa-paste'
  },
  {
    name: 'ITR/IT Monitoring',
    url: '/production-order',
    icon: 'fa fa-copy'
  },
  {
    name: 'AR/IP Monitoring',
    url: '/ar-ip',
    icon: 'fa fa-check-square-o'
  }
];
