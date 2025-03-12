import { Repository } from 'typeorm';
import { CategoryEntity } from '../../entities';
import { InjectRepository } from '@nestjs/typeorm';
import {
  BizException,
  QueryOptionsDto,
  UpdateSortnoModel,
  UpdateStatusModel,
} from '@xtsai/core';
import {
  PageEnum,
  ROOT_TRRE_NODE_PID,
  TreeNodeOptionType,
} from '@tsailab/core-types';
import { ErrorCodeEnum, RandomNoType, RandomUtil } from '@xtsai/xai-utils';
import { CreateCategoryModel, UpdateCategoryModel } from '../../model';
import { Injectable } from '@nestjs/common';
import { FirstCategory } from '.';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  get repository(): Repository<CategoryEntity> {
    return this.categoryRepository;
  }

  getById(id: number) {
    return this.categoryRepository.findOneBy({ id });
  }

  async list(queryDto: QueryOptionsDto) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      keywords,
    } = queryDto;

    let qb = this.categoryRepository.createQueryBuilder('cate');
    if (keywords?.trim()?.length) {
      qb = qb.where('title LIKE :title OR tag LIKE :tag OR group LIKE :group', {
        title: `%${keywords.trim()}%`,
        tag: `%${keywords.trim()}%`,
        group: `${keywords.trim()}%`,
      });
    }

    qb = qb.orderBy('sortno', 'ASC').addOrderBy('title', 'ASC');

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

  async createNew(model: CreateCategoryModel): Promise<CategoryEntity> {
    const {
      title,
      pid = ROOT_TRRE_NODE_PID,
      uuid = 1000,
      icon,
      image,
      group,
      tag,
      path,
      url,
      richcontent,
      remark,
    } = model;

    const { no } = this.createNo();

    const entity: Partial<CategoryEntity> = {
      pid,
      cateno: no,
      title,
      uuid,
      icon,
      image,
      group,
      tag,
      path,
      url,
      richcontent,
      remark,
    };

    const result = await this.categoryRepository.save(
      this.categoryRepository.create(entity),
    );
    return result;
  }

  async updateSome(model: UpdateCategoryModel): Promise<boolean> {
    const { id, ...others } = model;
    const find = await this.getById(id);
    if (!find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `栏目不存在`,
      );

    const { affected } = await this.categoryRepository
      .createQueryBuilder()
      .update(CategoryEntity)
      .set({
        ...others,
      })
      .where({ id })
      .execute();

    return affected > 0;
  }

  async updateSortno(dto: UpdateSortnoModel): Promise<boolean> {
    const { id, sortno } = dto;
    const { affected } = await this.categoryRepository
      .createQueryBuilder()
      .update(CategoryEntity)
      .set({ sortno })
      .where({ id })
      .execute();

    return affected > 0;
  }

  async updateStatus(dto: UpdateStatusModel) {
    const { id, status } = dto;
    const { affected } = await this.categoryRepository
      .createQueryBuilder()
      .update(CategoryEntity)
      .set({ status })
      .where({ id })
      .execute();

    return affected > 0;
  }

  async getCommonTreeNodes(rootPid: number = ROOT_TRRE_NODE_PID) {
    const qb = this.categoryRepository.createQueryBuilder('cate');
    const rootEntities = await qb
      .andWhere('pid = :pid', { pid: rootPid })
      .orderBy('sortno', 'ASC')
      .addOrderBy('title', 'ASC')
      .getMany();

    const treeNodes: TreeNodeOptionType[] = [];
    if (!rootEntities?.length) return treeNodes;

    for (let i = 0; i < rootEntities.length; i++) {
      let rootNode = CategoryEntity.entity2TreeNode(rootEntities[i]);

      rootNode = await this.subTreeNodes(rootNode);
      treeNodes.push(rootNode);
    }

    return treeNodes;
  }

  async subTreeNodes(node: TreeNodeOptionType): Promise<TreeNodeOptionType> {
    const pid = node.id;
    const qb = this.categoryRepository.createQueryBuilder('scate');

    const subEntities = await qb
      .where({ pid })
      .orderBy('sortno', 'ASC')
      .addOrderBy('title', 'ASC')
      .getMany();
    if (!subEntities?.length) {
      node.children = [];
      node.isLeaf = true;
      return node;
    }
    if (!node.children) node.children = [];

    for (let j = 0; j < subEntities.length; j++) {
      const subNode = CategoryEntity.entity2TreeNode(subEntities[j]);
      node.children.push(subNode);

      await this.subTreeNodes(subNode);
    }
    return node;
  }

  async subList(queryDto: QueryOptionsDto, pid: number) {
    const {
      page = PageEnum.PAGE_NUMBER,
      pageSize = PageEnum.PAGE_SIZE,
      keywords,
    } = queryDto;

    let qb = this.categoryRepository.createQueryBuilder('cate').where({ pid });

    if (keywords?.trim()?.length) {
      qb = qb.andWhere(
        'title LIKE :title OR tag LIKE :tag OR group LIKE :group',
        {
          title: `%${keywords.trim()}%`,
          tag: `%${keywords.trim()}%`,
          group: `${keywords.trim()}%`,
        },
      );
    }

    qb = qb.orderBy('sortno', 'ASC').addOrderBy('title', 'ASC');

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

  createNo(): RandomNoType {
    return RandomUtil.randomNo36BaseTime();
  }

  async initCategory(): Promise<string | null> {
    const count = await this.categoryRepository
      .createQueryBuilder()
      .where({ pid: -1 })
      .getCount();

    if (!count) {
      const no = RandomUtil.randomNo36BaseTime().no;
      const result = await this.categoryRepository.save({
        ...FirstCategory,
        cateno: no,
      });
      return `Initialize root category [${result.cateno}] successfully`;
    }
    return null;
  }
}
