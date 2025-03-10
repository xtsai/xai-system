import { Column, Entity, Index } from 'typeorm';

import {
  AccountType,
  IUser,
  PlatformEnum,
  UserStatusEnum,
} from '@tsailab/core-types';
import { Exclude, Transform, Type } from 'class-transformer';
import { BaseORGEntity } from '@xtsai/core';

@Entity({
  name: 'sys_user',
  synchronize: true,
  comment: '系统用户主表',
})
export class SystemUserEntity extends BaseORGEntity implements IUser {
  readonly acctype: AccountType = 'system';
  /**
   * 自动生成唯一
   */
  @Index({ unique: true })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'userno',
    comment: 'userno',
  })
  userno: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'username',
    comment: 'Username',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'phone',
    comment: 'phone number',
  })
  phone: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 128,
    name: 'email',
    comment: 'email address',
  })
  email: string;

  @Exclude()
  @Column({
    type: 'varchar',
    length: 256,
    select: false,
    name: 'password',
    comment: 'password',
  })
  password: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    name: 'nickname',
    comment: 'user nickname',
  })
  nickname: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'avatar',
    comment: 'user avatar image',
  })
  avatar: string;

  /**
   *  FORBIDDEN = 0,GUEST = 1,NORMAL = 9
   */
  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: 'status,0-unavailable,1-new registed,2-available',
  })
  status: UserStatusEnum;

  @Type(() => Boolean)
  @Transform(({ value }) => Boolean(value))
  @Column({
    type: 'tinyint',
    nullable: true,
    default: 0,
    name: 'is_super',
    comment: 'super admin flag',
  })
  isSuper: boolean;

  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'platform',
    comment: 'platform,0-guest,999-system,2-merchant,3-farmer',
  })
  platform: PlatformEnum;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'openid',
    comment: 'Wx Openid',
  })
  openid?: string;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'unionid',
    comment: 'Wechat Unionid',
  })
  unionid?: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'remark',
    comment: 'remark',
  })
  remark: string;
}
