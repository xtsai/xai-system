import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BizException } from '@xtsai/core';
import {
  ErrorCodeEnum,
  isMiddelPassword,
  isSimplePassword,
  isStrongPassword,
} from '@xtsai/xai-utils';
import {
  defaultSystemOptions,
  SYSTEM_CONFIG_SCHEMA_BASEKEY,
} from '../system.constants';
import { SystemConfigSchema } from '../interface';

@Injectable()
export class SystemService {
  protected logger = new Logger(`@xtsai-system: ${SystemService.name}`);

  @Inject(ConfigService)
  protected configService: ConfigService;

  constructor() {}

  /**
   *
   * @returns SystemConfigSchema
   */
  getConfigOptions(): SystemConfigSchema {
    const opts = this.configService.get(
      `${SYSTEM_CONFIG_SCHEMA_BASEKEY}`,
      null,
    );
    const options = { ...defaultSystemOptions };
    if (typeof opts === 'object' && opts !== null) {
      const {
        encrptRounds,
        pwdSecurityLevel,
        unoSeeds = [],
        defaultPassword,
      } = opts as unknown as SystemConfigSchema;

      if (encrptRounds > 1 && encrptRounds < 20) {
        options.encrptRounds = encrptRounds;
      }
      if (unoSeeds?.length) {
        const unos = unoSeeds
          .filter((v) => /[\d]{1,4}/.test(v))
          .map((v) => `000${v}`.slice(-4));

        if (unos.length) {
          options.unoSeeds = [...unos];
        }
      }
      if (defaultPassword?.length) {
        options.defaultPassword = defaultPassword;
      }

      if (pwdSecurityLevel?.length) {
        options.pwdSecurityLevel = pwdSecurityLevel;
      }
    }
    return options;
  }

  public getUnoSeeds() {
    const opts = this.getConfigOptions();
    return opts.unoSeeds;
  }

  /**
   * verify password strength
   * @param passport
   * @returns true or throw BizException
   */
  verifyPasswordStrength(passport: string) {
    const { pwdSecurityLevel } = this.getConfigOptions();
    switch (pwdSecurityLevel) {
      case 'simple':
        if (!isSimplePassword(passport))
          throw BizException.createError(
            ErrorCodeEnum.PASSPORT_UNSAFE,
            `Password is too simple.`,
          );
        break;
      case 'middle':
        if (!isMiddelPassword(passport))
          throw BizException.createError(
            ErrorCodeEnum.PASSPORT_UNSAFE,
            `Password is too simple.`,
          );
        break;
      case 'strong':
        if (!isStrongPassword(passport))
          throw BizException.createError(
            ErrorCodeEnum.PASSPORT_UNSAFE,
            `Password is too simple.`,
          );
        break;
      default:
        if (!isMiddelPassword(passport))
          throw BizException.createError(
            ErrorCodeEnum.PASSPORT_UNSAFE,
            `Password is too simple.`,
          );
        break;
    }

    return true;
  }
}
