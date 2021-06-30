import { FeatureList } from "../config/feature-list";

export interface MenuModel {
  text: string;
  path: string;
  base?: string;
  children?: MenuModel[];
  feature?: keyof typeof FeatureList;
}

export const Menu: MenuModel[] = [
  // {
  //   text: 'Задачи',
  //   path: 'agreements/backoffice',
  //   feature: 'backofficeAgreements',
  // },
  {
    text: 'Процедуры',
    path: '/procedures',
    feature: 'proceduresList',
  },
  {
    text: 'Согласования',
    path: 'agreements/customer',
    feature: 'customerAgreements',
  },
  {
    text: 'Заявки',
    path: 'requests/customer',
    feature: 'customerRequest',
  },
  // {
  //   text: 'Заявки',
  //   path: 'requests/backoffice',
  //   feature: 'backofficeRequest',
  // },
  {
    text: 'Заявки',
    path: 'requests/approver',
    feature: 'approverRequest',
  },
  {
    text: 'Позиции',
    path: 'positions',
    feature: 'positionsList',
  },
  {
    text: 'Каталог',
    path: 'catalog',
    feature: 'catalog',
  },
  {
    text: 'Контрагенты',
    path: 'contragents',
    feature: 'contragents',
  },
  {
    text: 'Сотрудники',
    path: 'employees',
    feature: 'employees',
  },
  {
    text: 'Торговый портал',
    path: 'kim',
    feature: 'kim',
  }
];
