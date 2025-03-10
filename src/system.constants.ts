import { SystemConfigSchema } from './interface';

export const SYSTEM_CONFIG_SCHEMA_BASEKEY = 'system';
export const SYSTEM_UNO_SEED_SCHEMA_KEY = 'system.unoSeeds';

export const defaultSystemOptions: SystemConfigSchema = {
  encrptRounds: 10,
  pwdSecurityLevel: 'middle',
  unoSeeds: ['888'],
  defaultPassword: 'xtsai@123',
};

export const ORG_ROOT_NODE_ID = 0;
