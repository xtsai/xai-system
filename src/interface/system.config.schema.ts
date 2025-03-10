export interface SystemConfigSchema {
  encrptRounds: number;
  pwdSecurityLevel: 'simple' | 'middle' | 'strong';
  unoSeeds: string[];
  defaultPassword: string;
}
