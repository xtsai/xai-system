import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ErrorCodeEnum, isEmail } from '@xtsai/xai-utils';
import { isMobilePhone } from 'class-validator';
import { Repository } from 'typeorm';
import { CustomUserEntity } from '../entities/account';
import { BizException } from '@xtsai/core';

@Injectable()
export class CustomUserService {
  protected logger = new Logger(CustomUserService.name);

  constructor(
    @InjectRepository(CustomUserEntity)
    private readonly userRepository: Repository<CustomUserEntity>,
  ) {}

  public getById(id: number): Promise<CustomUserEntity | null> {
    return this.userRepository.findOneBy({ id });
  }

  public get respository(): Repository<CustomUserEntity> {
    return this.userRepository;
  }

  public getByUsername(username: string): Promise<CustomUserEntity | null> {
    return this.userRepository
      .createQueryBuilder()
      .withDeleted()
      .where({ username: username })
      .getOne();
  }

  public getByUserno(no: string): Promise<CustomUserEntity | null> {
    return this.userRepository
      .createQueryBuilder()
      .withDeleted()
      .where({ userno: no })
      .getOne();
  }

  public getByOpenid(openid: string) {
    return this.userRepository
      .createQueryBuilder()
      .withDeleted()
      .where({ openid: openid })
      .getOne();
  }

  public getByPhone(phone: string) {
    return this.userRepository
      .createQueryBuilder()
      .withDeleted()
      .where({ phone: phone })
      .getOne();
  }

  public getByEmail(email: string) {
    return this.userRepository
      .createQueryBuilder()
      .withDeleted()
      .where({ email: email })
      .getOne();
  }

  public async insertNew(
    model: Partial<
      Omit<
        CustomUserEntity,
        'id' | 'password' | 'createdAt' | 'updatedAt' | 'deletedAt'
      >
    >,
    enPassword: string,
  ): Promise<CustomUserEntity | never> {
    if (!enPassword?.trim()?.length) {
      throw BizException.IllegalParamterError(`password required.`);
    }
    const { userno, openid, phone } = model;

    if (!userno?.length) {
      throw BizException.IllegalParamterError(`userno required.`);
    }

    if (openid?.length) {
      const wxUser = await this.getByOpenid(openid);
      if (wxUser) {
        throw BizException.createError(
          ErrorCodeEnum.DATA_RECORD_CONFLICT,
          `User wechat openid: ${openid} has exists in DB.`,
        );
      }
    }

    if (phone?.length) {
      const mobUser = await this.getByPhone(phone);
      if (mobUser) {
        throw BizException.createError(
          ErrorCodeEnum.DATA_RECORD_CONFLICT,
          `User phone: ${phone} has exists in DB.`,
        );
      }
    }

    const created = await this.userRepository.save(
      this.userRepository.create({ ...model, password: enPassword }),
    );

    return created;
  }

  public async findUserAccount(
    account: string,
  ): Promise<CustomUserEntity | null> {
    if (isEmail(account)) {
      return await this.getByEmail(account);
    }
    if (isMobilePhone(account, 'zh-CN')) {
      return await this.getByPhone(account);
    }

    const user = await this.userRepository
      .createQueryBuilder('u')
      .withDeleted()
      .andWhere('u.username = :username OR u.userno = :userno', {
        username: account,
        userno: account,
      })
      .getOne();

    return user;
  }
}
