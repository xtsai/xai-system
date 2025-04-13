import { Injectable, Logger } from '@nestjs/common';
import { SysAccountLogEntity } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { AuditLogCache, QueryLogParams } from '@xtsai/core';
import { PageEnum } from '@tsailab/core-types';
import { mapToObj } from '@xtsai/xai-utils';

@Injectable()
export class SysUserLogService {
  protected logger = new Logger(`xtsai-system:${SysUserLogService.name}`);

  constructor(
    @InjectRepository(SysAccountLogEntity)
    private readonly sysUserRepository: Repository<SysAccountLogEntity>,
  ) {}

  get userRepository(): Repository<SysAccountLogEntity> {
    return this.sysUserRepository;
  }

  async pageList(queryDto: QueryLogParams) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      keywords,
      isErrored,
      username,
    } = queryDto;

    let qb = this.sysUserRepository.createQueryBuilder('log');
    const map = new Map<string, any>();
    if (username?.trim()?.length) {
      map.set('username', Like(`%${username.trim()}%`));
      qb = qb.where(mapToObj(map));
    }

    if (isErrored) {
      qb = qb.andWhere({ error: Not(IsNull()) });
    }

    if (keywords?.trim().length) {
      qb = qb.andWhere(
        'log.biztype LIKE :biztype OR log.clentId LIKE :clientId OR log.detail LIKE :detail',
        {
          biztype: `${keywords.trim()}%`,
          clentId: `%${keywords.trim()}%`,
          detail: `%${keywords.trim()}%`,
        },
      );
    }

    qb = qb.addOrderBy('log.created_at', 'DESC');

    const [data, total] = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      page,
      pageSize,
      total,
      list: data?.length
        ? data.map((entity) => SysAccountLogEntity.parseJson(entity))
        : [],
    };
  }

  getById(id: number) {
    return this.sysUserRepository.findOneBy({ id });
  }

  create(
    dto: Partial<
      Omit<SysAccountLogEntity, 'id' | 'deletedAt' | 'errorJson' | 'detailJson'>
    >,
  ) {
    return this.sysUserRepository.save(this.sysUserRepository.create(dto));
  }

  async createLogByCache(cache: AuditLogCache) {
    const entity = SysUserLogService.cacheToEntity(cache);
    return await this.create(entity);
  }

  softDelete(id: number) {
    return this.sysUserRepository.softDelete(id);
  }

  static cacheToEntity(cache: AuditLogCache) {
    const {
      biztype,
      bizDetail,
      username = 'unknow',
      uid = -1,
      clientId = '',
      ip,
      detailJson,
      locked = false,
      errorJson,
    } = cache;

    const entity: Partial<
      Omit<SysAccountLogEntity, 'id' | 'deletedAt' | 'errorJson' | 'detailJson'>
    > = {
      biztype,
      uid,
      username,
      bizDetail: bizDetail ?? biztype,
      clientId,
      locked,
      ip,
    };

    if (detailJson) {
      entity.detail = JSON.stringify(detailJson);
    }
    if (errorJson) {
      entity.error = JSON.stringify(errorJson);
    }
    return entity;
  }
}
