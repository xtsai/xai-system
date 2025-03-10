import { Injectable } from '@nestjs/common';
import { SysDictEntity, SysDictItemEntity } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  BizException,
  QueryOptionsDto,
  UpdateSortnoModel,
  UpdateStatusModel,
} from '@xtsai/core';
import { PageEnum, SelectorOptionsType, StatusEnum } from '@tsailab/core-types';
import {
  DictItemDefaultActivedModel,
  QueryDictItemModel,
  SysDictBaseModel,
  SysDictItemBaseModel,
  SysDictItemModel,
  SysDictModel,
} from '../../model';
import { ErrorCodeEnum } from '@xtsai/xai-utils';

@Injectable()
export class DictService {
  constructor(
    @InjectRepository(SysDictEntity)
    private readonly dictRepository: Repository<SysDictEntity>,
    @InjectRepository(SysDictItemEntity)
    private readonly dictItemRepository: Repository<SysDictItemEntity>,
  ) {}

  async queryDictList(dto: QueryOptionsDto) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      keywords,
    } = dto;

    const qb = this.dictRepository.createQueryBuilder('dict');
    if (keywords?.length) {
      qb.andWhere('name LIKE :name OR code LIKE :code', {
        name: `%${keywords}%`,
        code: `${keywords}%`,
      });
    }

    const [data, total] = await qb
      .orderBy('sortno', 'ASC')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .printSql()
      .getManyAndCount();

    return {
      page,
      pageSize,
      total,
      list: data ?? [],
    };
  }

  async queryDictItems(dto: QueryDictItemModel) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      dictId,
      keywords,
    } = dto;

    const qb = this.dictItemRepository
      .createQueryBuilder('dict_item')
      .where('dict_item.dict_id = :dictId', { dictId });
    if (keywords?.length) {
      qb.andWhere('label LIKE :label OR value LIKE :code', {
        label: `%${keywords}%`,
        code: `${keywords}%`,
      });
    }

    const [data, total] = await qb
      .orderBy('sortno', 'ASC')
      .offset((page - 1) * pageSize)
      .limit(pageSize)
      .printSql()
      .getManyAndCount();

    return {
      page,
      pageSize,
      total,
      list: data ?? [],
    };
  }

  getDictById(id: number) {
    return this.dictRepository.findOneBy({ id });
  }

  getDictItemById(id: number) {
    return this.dictItemRepository.findOneBy({ id });
  }

  async createDict(dto: SysDictBaseModel) {
    const { code } = dto;
    const find = await this.dictRepository
      .createQueryBuilder('dict')
      .where({ code })
      .getOne();

    if (find) {
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `字典编码 ${code} 已存在！`,
      );
    }

    const max = await this.getDictMaxSortno();

    return await this.dictRepository.save(
      this.dictRepository.create({ ...dto, sortno: max + 1 }),
    );
  }

  async createDictItem(dto: SysDictItemBaseModel) {
    const { dictId, label, value, icon, remark, extra } = dto;

    const findDict = await this.dictRepository
      .createQueryBuilder('dict')
      .where({
        id: dictId,
      })
      .getOne();

    if (!findDict) {
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `字典不存在`,
      );
    }

    const findItem = await this.dictItemRepository
      .createQueryBuilder('item')
      .where({
        dictId: dictId,
        value: value,
      })
      .getOne();

    if (findItem) {
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `字典项${label}-${value}已存在`,
      );
    }

    const max = await this.getDictItemMaxSortno(dictId);

    const saved = await this.dictItemRepository.save(
      this.dictItemRepository.create({
        dictId: dictId,
        label,
        value,
        icon,
        remark,
        extra: extra ? JSON.stringify(extra, null, 2) : undefined,
        status: StatusEnum.NORMAL,
        sortno: max ? parseInt(max) + 1 : 0,
      }),
    );

    return saved;
  }

  async getDictMaxSortno(): Promise<number> {
    const result = await this.dictRepository
      .createQueryBuilder('dict')
      .select('MAX(dict.sortno)', 'maxSortno')
      .getRawOne();

    return result?.maxSortno ? Number(result.maxSortno) : -1;
  }

  /**
   *
   * @param dictId number
   * @returns number or -1
   */
  async getDictItemMaxSortno(dictId: number) {
    const result = await this.dictItemRepository
      .createQueryBuilder('it')
      .select('MAX(it.sortno)', 'maxSortno')
      .where('it.dictId = :dictId', { dictId })
      .getRawOne();

    return result?.maxSortno ?? -1;
  }

  async updateDictSortno(dto: UpdateSortnoModel) {
    const { id, sortno } = dto;
    const find = await this.getDictById(id);

    if (!find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `数据字典不存在`,
      );

    const { affected } = await this.dictRepository
      .createQueryBuilder('dict')
      .update(SysDictEntity)
      .set({
        sortno: sortno,
      })
      .where({ id: id })
      .execute();

    return affected;
  }

  async updateDictItemSortno(dto: UpdateSortnoModel) {
    const { id, sortno } = dto;
    const find = await this.getDictItemById(id);

    if (!find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `数据字典项不存在`,
      );

    const { affected } = await this.dictItemRepository
      .createQueryBuilder('dict')
      .update(SysDictItemEntity)
      .set({
        sortno: sortno,
      })
      .where({ id: id })
      .execute();

    return affected > 0;
  }

  async setDictItemDefaultActived(dto: DictItemDefaultActivedModel) {
    const { id, dictId } = dto;
    const find = await this.getDictItemById(id);
    if (!find) {
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `数据字典项不存在`,
      );
    }

    await this.dictItemRepository
      .createQueryBuilder('item')
      .update(SysDictItemEntity)
      .set({ defaultActived: false })
      .where({ dict: dictId })
      .execute();

    const { affected } = await this.dictItemRepository
      .createQueryBuilder('item')
      .update(SysDictItemEntity)
      .set({ defaultActived: true })
      .where({ id })
      .execute();

    return affected > 0;
  }

  async setDictItemStatus(dto: UpdateStatusModel) {
    const { id, status } = dto;
    const find = await this.getDictItemById(id);
    if (!find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `字典项不存在`,
      );

    const { affected } = await this.dictItemRepository
      .createQueryBuilder('it')
      .update(SysDictItemEntity)
      .set({ status: status })
      .where({ id })
      .execute();

    return affected > 0;
  }

  async updateDictSome(dict: SysDictModel) {
    const { id, code } = dict;
    const find = await this.getDictById(dict.id);
    if (!find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `数据字典 ${dict.id} 没有找到`,
      );

    const findRepeatCode = await this.dictRepository
      .createQueryBuilder('dict')
      .where('dict.code = :code AND dict.id != :id', { id, code })
      .getOne();

    if (findRepeatCode)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `字典编码${dict.code}已存在`,
      );

    const result = await this.dictRepository.save({ ...find, ...dict });
    return result;
  }

  async updateSomeDictItem(some: SysDictItemModel) {
    const { id, value, dictId, extra } = some;
    const findItem = await this.getDictItemById(id);
    if (!findItem)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `数据不存在`,
      );

    const findConflict = await this.dictItemRepository
      .createQueryBuilder('it')
      .where({ value, dictId })
      .andWhere('it.id != :id', { id })
      .getOne();

    if (findConflict)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `字典项值 ${value} 重复`,
      );

    let extraJson;
    if (extra) {
      try {
        extraJson = JSON.stringify(extra);
      } catch (_e) {
        // ingore JSON parse fail
      }
    }
    const saved = extraJson?.length
      ? { ...findItem, ...some, extra: extraJson, id }
      : { ...findItem, ...some, extra: findItem.extra, id };

    await this.dictItemRepository.save(saved);
    return saved;
  }

  /**
   *
   * @param dictCode
   * @returns
   */
  async getDictSelectionOptions(dictCode: string) {
    const dict = await this.dictRepository
      .createQueryBuilder('dict')
      .where({ code: dictCode ?? 'none' })
      .withDeleted()
      .getOne();

    if (!dict) return [];

    const list = await this.dictItemRepository
      .createQueryBuilder('dictItem')
      .where({ dictId: dict.id })
      .orderBy('sortno', 'ASC')
      .getMany();
    if (!list?.length) return [];

    return list.map((entity: SysDictItemEntity) => {
      const { id, label, value, icon, sortno, defaultActived, extra, status } =
        entity;

      let extraObj: any = {
        dictCode: dictCode,
        id,
        sortno,
      };
      if (extra?.length) {
        try {
          const exObj = JSON.parse(extra);
          if (Object.keys(exObj).length) {
            extraObj = {
              ...exObj,
              ...extraObj,
            };
          }
        } catch (_) {
          // ingore JSON parse fail
        }
      }
      const option: SelectorOptionsType<string> = {
        label,
        value,
        disabled: status === StatusEnum.FORBIDDEN,
        actived: Boolean(defaultActived),
        icon,
        extra: extraObj,
      };

      return option;
    });
  }
}
