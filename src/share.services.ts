import { Provider } from '@nestjs/common';
import {
  // audit
  CustomLogService,
  SysUserLogService,
  // common
  DictService,
  SysRegionService,
  SysRoleService,
  //CMS
  CategoryService,
  // main
  CustomUserService,
  OrganizationService,
  SysUserService,
  SystemService,
} from './services';

export const sharedServices: Provider[] = [
  // audit
  CustomLogService,
  SysUserLogService,
  // common
  DictService,
  SysRegionService,
  SysRoleService,
  //CMS
  CategoryService,
  // main
  CustomUserService,
  OrganizationService,
  SysUserService,
  SystemService,
];
