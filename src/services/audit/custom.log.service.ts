import { Injectable, Logger } from '@nestjs/common';

import { IsNull, Like, Not, Repository } from 'typeorm';
import { CustomUserLogEntity } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { AuditLogCache, QueryLogParams } from '@xtsai/core';
import { PageEnum } from '@tsailab/core-types';
import { mapToObj } from '@xtsai/xai-utils';

@Injectable()
export class CustomLogService {
  protected readonly logger = new Logger(
    `xtsai-system:${CustomLogService.name}`,
  );
  constructor(
    @InjectRepository(CustomUserLogEntity)
    private readonly lotoUserRepository: Repository<CustomUserLogEntity>,
  ) {}

  get userRepository(): Repository<CustomUserLogEntity> {
    return this.lotoUserRepository;
  }

  async pageList(queryDto: QueryLogParams) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      keywords,
      isErrored,
      username,
    } = queryDto;

    let qb = this.lotoUserRepository.createQueryBuilder('log');
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
      list: data ?? [],
    };
  }

  getById(id: number) {
    return this.lotoUserRepository.findOneBy({ id });
  }

  create(
    dto: Partial<
      Omit<CustomUserLogEntity, 'id' | 'deletedAt' | 'errorJson' | 'detailJson'>
    >,
  ) {
    return this.lotoUserRepository.save(this.lotoUserRepository.create(dto));
  }

  async createLogByCache(cache: AuditLogCache) {
    const entity = CustomLogService.cacheToEntity(cache);
    return await this.create(entity);
  }

  softDelete(id: number) {
    this.lotoUserRepository.softDelete(id);
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
      Omit<CustomUserLogEntity, 'id' | 'deletedAt' | 'errorJson' | 'detailJson'>
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
