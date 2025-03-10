import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { SysRoleEntity } from '../../entities';
import { Equal, Like, Not, Repository } from 'typeorm';
import { PageEnum, SetStatusData } from '@tsailab/core-types';
import { BizException, QueryOptionsDto } from '@xtsai/core';
import { ErrorCodeEnum, mapToObj } from '@xtsai/xai-utils';
import { CreateRoleModel } from '../../model';

@Injectable()
export class SysRoleService {
  constructor(
    @InjectRepository(SysRoleEntity)
    private readonly roleRepository: Repository<SysRoleEntity>,
  ) {}

  get repository(): Repository<SysRoleEntity> {
    return this.roleRepository;
  }

  getById(id: number): Promise<SysRoleEntity | null> {
    return this.repository.findOneBy({ id });
  }

  async queryList(params: QueryOptionsDto) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      keywords,
    } = params;

    const qb = this.roleRepository.createQueryBuilder('role');

    const map = new Map<string, any>();
    if (keywords?.length) {
      map.set('name', Like(`%${keywords}%`));
    }

    const [data, total] = await qb
      .andWhere(mapToObj(map))
      .withDeleted()
      .orderBy('name', 'ASC')
      .offset((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    return {
      page,
      pageSize,
      total,
      list: data ?? [],
    };
  }

  async setRoleStatus(data: SetStatusData) {
    const { id, status } = data;
    const find = await this.getById(id);
    if (!find)
      throw BizException.createError(ErrorCodeEnum.DATA_RECORD_REMOVED);
    const { affected } = await this.repository
      .createQueryBuilder('role')
      .update(SysRoleEntity)
      .set({
        status,
      })
      .where({ id })
      .execute();

    return affected > 0;
  }

  async setRoleGroup(
    id: number,
    group: string = '',
  ): Promise<SysRoleEntity | never> {
    const find = await this.getById(id);
    if (!find) {
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `角色已删除`,
      );
    }
    const { affected } = await this.repository
      .createQueryBuilder('role')
      .update(SysRoleEntity)
      .set({ group })
      .where({ id })
      .execute();

    return affected > 0 ? ({ ...find, group } as SysRoleEntity) : find;
  }

  async setDefault(id: number) {
    const find = await this.getById(id);
    if (!find)
      throw BizException.createError(ErrorCodeEnum.DATA_RECORD_REMOVED);
    const qb = this.repository.createQueryBuilder('role');
    const { affected: canceled } = await qb
      .update(SysRoleEntity)
      .set({ isDefault: false })
      .where('id != :id AND group = :group', { id, group: find.group })
      .execute();

    const { affected } = await qb
      .update(SysRoleEntity)
      .set({ isDefault: true })
      .where({ id })
      .execute();

    return affected > 0 || canceled > 0;
  }

  async addRole(model: CreateRoleModel): Promise<SysRoleEntity | never> {
    const { name } = model;
    if (!name?.length)
      throw BizException.IllegalParamterError(`Role name required.`);
    const qb = this.roleRepository.createQueryBuilder('role');

    const find = await qb.where('role.name = :name', { name }).getOne();
    if (find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `Role [${name}] has been exists in DB.`,
      );

    const role = await this.repository.save(
      this.repository.create({ ...model }),
    );
    return role;
  }

  async updateRole(
    role: Partial<SysRoleEntity> & { id: number },
  ): Promise<SysRoleEntity | never> {
    const { id, name, ...others } = role;
    const find = await this.getById(id);
    const qb = this.repository.createQueryBuilder('role');

    if (!find)
      throw BizException.createError(ErrorCodeEnum.DATA_RECORD_REMOVED);

    if (name?.length && name !== find.name) {
      const conflicted = await qb
        .where({
          name: Equal(name),
        })
        .andWhere({ id: Not(id) })
        .getOne();

      if (conflicted)
        throw BizException.createError(
          ErrorCodeEnum.DATA_RECORD_CONFLICT,
          `Role [${name}] has been exists in DB.`,
        );
    }

    await qb
      .update(SysRoleEntity)
      .set({
        ...others,
        name: name ?? find.name,
      })
      .where({ id })
      .execute();

    return { ...find, ...others, name: name ?? find.name } as SysRoleEntity;
  }
}
