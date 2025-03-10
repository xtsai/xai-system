import { CategoryEntity } from '../../entities';

export * from './category.service';

export const FirstCategory: Partial<CategoryEntity> = {
  id: 0,
  pid: -1,
  title: '智能客户根栏目',
  uuid: 1000,
  icon: '',
  image: '',
  group: 'category_root',
  tag: 'root',
  path: '',
  url: '',
  remark: 'auto initialize',
};
