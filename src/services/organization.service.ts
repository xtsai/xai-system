import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { OrganizationEntity } from '../entities';
import { Repository } from 'typeorm';
import { BizException } from '@xtsai/core';
import { ErrorCodeEnum } from '@xtsai/xai-utils';
import {
  ROOT_TRRE_NODE_PID,
  SetSortnoData,
  SetStatusData,
  StatusEnum,
  TreeNodeOptionType,
} from '@tsailab/core-types';
import {
  AddOrganizationModel,
  OrganizationTreeNode,
  UpdateOrganizationModel,
} from '../model';
import { ORG_ROOT_NODE_ID } from '../system.constants';

@Injectable()
export class OrganizationService {
  private readonly ROOT_CODE_LENGTH = 3;
  private readonly CODE_LENGTH = 2;
  private readonly CODE_PREFIX = '8';
  private readonly MAX_CODE_LENGTH = 13;
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly orgRepository: Repository<OrganizationEntity>,
  ) {}

  get repository(): Repository<OrganizationEntity> {
    return this.orgRepository;
  }

  async moveUpRecord(id: number): Promise<boolean | never> {
    const entity = await this.orgRepository.findOneBy({
      id,
    });

    if (!entity)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `组织${id}不存在`,
      );

    const currSortno = entity.sortno;

    const list = await this.orgRepository
      .createQueryBuilder('org')
      .select()
      .where('level = :level', { level: entity.level })
      .orderBy('sortno', 'ASC')
      .addOrderBy('id', 'ASC')
      .getMany();

    if (list.length < 2) {
      return true;
    }

    const index = list.findIndex((e) => e.id === id);
    if (index < 1) {
      return true;
    }

    const previous = list[index - 1];

    // swap sortno
    if (previous.sortno === entity.sortno) {
      entity.sortno = currSortno - 1 >= 0 ? currSortno - 1 : 0;
    } else {
      entity.sortno = previous.sortno;
      previous.sortno = currSortno;
    }

    await this.orgRepository
      .createQueryBuilder()
      .update(entity)
      .set({ sortno: entity.sortno })
      .where('id = :id', { id: id })
      .execute();

    await this.orgRepository
      .createQueryBuilder()
      .update(previous)
      .set({ sortno: currSortno })
      .where('id = :id', { id: previous.id })
      .execute();

    return true;
  }

  async moveDownRecord(id: number): Promise<boolean | never> {
    const entity = await this.orgRepository.findOneBy({
      id,
    });

    if (!entity)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `组织${id}不存在`,
      );

    const nextNo = entity.sortno + 1;

    const list = await this.orgRepository
      .createQueryBuilder('org')
      .select()
      .where('level = :level', { level: entity.level })
      .orderBy('sortno', 'ASC')
      .addOrderBy('id', 'ASC')
      .getMany();

    if (list.length < 2) {
      return true;
    }

    const index = list.findIndex((e) => e.id === id);
    if (index === list.length - 1) {
      return true;
    }

    const next = list[index + 1];
    if (next.sortno === entity.sortno) {
      entity.sortno = nextNo;
    } else {
      entity.sortno = next.sortno;
      next.sortno = entity.sortno;
    }

    await this.orgRepository
      .createQueryBuilder()
      .update(entity)
      .set({ sortno: entity.sortno })
      .where('id = :id', { id: id })
      .execute();

    await this.orgRepository
      .createQueryBuilder()
      .update(next)
      .set({ sortno: next.sortno })
      .where('id = :id', { id: next.id })
      .execute();

    return true;
  }

  async updateSortno(dto: SetSortnoData): Promise<boolean | never> {
    const { id, sortno } = dto;
    const entity = await this.orgRepository.findOneBy({
      id,
    });

    if (!entity)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `组织${id}不存在`,
      );

    if (entity.sortno === sortno) {
      return true;
    }

    await this.orgRepository
      .createQueryBuilder()
      .update(entity)
      .set({ sortno: sortno })
      .where('id = :id', { id })
      .execute();
    return true;
  }

  getById(id: number): Promise<OrganizationEntity | never> {
    return this.orgRepository.findOneBy({ id });
  }

  async updateOrganization(
    dto: UpdateOrganizationModel,
  ): Promise<Partial<OrganizationEntity> | never> {
    const { id } = dto;
    const entity = await this.orgRepository.findOneBy({
      id,
    });

    if (!entity)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `组织${id}不存在`,
      );

    return await this.orgRepository.save({ ...entity, ...dto });
  }

  async getOrganizationTreeNodes(rootNodeId = ORG_ROOT_NODE_ID) {
    const all = await this.orgRepository
      .createQueryBuilder()
      .orderBy('level', 'ASC')
      .addOrderBy('sortno', 'ASC')
      .getMany();
    if (!all?.length) return [];

    const nodes = all.filter((it) => it.pid === rootNodeId);
    const rootNode = all.find((it) => it.id === rootNodeId);

    if (!rootNode && !nodes?.length) {
      return [];
    } else if (rootNode && !nodes?.length) {
      const rootTreeNode =
        OrganizationService.convertEntityToTreeNode(rootNode);
      return [rootTreeNode];
    }

    const treeNodes: OrganizationTreeNode[] = [];

    nodes.forEach((it) => {
      const treeNode = OrganizationService.convertEntityToTreeNode(it);
      const node = this.findChildren(treeNode, all);

      treeNodes.push(node);
    });

    if (rootNode) {
      const rootTreeNode =
        OrganizationService.convertEntityToTreeNode(rootNode);
      rootTreeNode.children = treeNodes;

      return [rootTreeNode];
    }

    return treeNodes;
  }

  /**
   *
   * @param rootPid
   * @returns tree nodes
   */
  async getCommonTreeNodes(
    rootPid: number = ORG_ROOT_NODE_ID,
  ): Promise<TreeNodeOptionType[]> {
    const qb = this.orgRepository.createQueryBuilder('org');
    const rootEntities = await qb
      .andWhere('pid = :pid', { pid: rootPid })
      .orderBy('sortno', 'ASC')
      .addOrderBy('name', 'ASC')
      .getMany();
    const treeNodes: TreeNodeOptionType[] = [];
    if (!rootEntities?.length) return treeNodes;

    for (let i = 0; i < rootEntities.length; i++) {
      let rootNode = OrganizationService.convertEntityToTreeNodeOption(
        rootEntities[i],
      );
      rootNode = await this.subTreeNodes(rootNode);
      treeNodes.push(rootNode);
    }

    return treeNodes;
  }

  async subTreeNodes(node: TreeNodeOptionType): Promise<TreeNodeOptionType> {
    const pid = node.id;
    const qb = this.orgRepository.createQueryBuilder('org');

    const subEntities = await qb
      .where({ pid })
      .orderBy('sortno', 'ASC')
      .addOrderBy('name', 'ASC')
      .getMany();

    if (!subEntities?.length) {
      node.isLeaf = true;
      node.children = [];
      return node;
    }
    if (!node.children) node.children = [];
    for (let i = 0; i < subEntities.length; i++) {
      const entity = subEntities[i];
      const treeNode =
        OrganizationService.convertEntityToTreeNodeOption(entity);
      node.children.push(treeNode);
      await this.subTreeNodes(treeNode);
    }

    return node;
  }

  async addOrganization(
    dto: AddOrganizationModel,
  ): Promise<OrganizationEntity | never> {
    const someEntity = await this.checkRepeat(dto);
    const parent = await this.orgRepository.findOneBy({
      id: dto.pid ?? ORG_ROOT_NODE_ID,
    });
    const level = await this.getNextLevel(parent);
    const code = await this.getNextLevelCodeByPid(dto.pid);
    const orgno = await this.autoGenerateOrgno(parent ?? null);

    if (parent && parent.level && parent.level > 5) {
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `组织层级不能超过6级`,
      );
    }

    const entity = await this.orgRepository.save(
      this.orgRepository.create({
        ...dto,
        ...someEntity,
        level,
        orgno,
        code,
      }),
    );

    return entity;
  }

  /**
   *
   * @param pid
   * @returns
   */
  async getLevelTreeNodesByPid(pid = 0) {
    const all = await this.orgRepository
      .createQueryBuilder()
      .where({ pid: pid, status: StatusEnum.NORMAL })
      .orderBy('level', 'ASC')
      .addOrderBy('sortno', 'ASC')
      .getMany();
    if (!all?.length) return [];

    const treeNodes: OrganizationTreeNode[] = all.map((entity) =>
      OrganizationService.convertEntityToTreeNode(entity),
    );

    return treeNodes;
  }

  private async getNextLevel(
    parent: OrganizationEntity | null,
  ): Promise<number> {
    if (!parent) return Promise.resolve(1);
    const { level = 0 } = parent;
    return level.valueOf() + 1;
  }

  /**
   *
   * @param pid number or null
   * @returns next level code
   */
  private async getNextLevelCodeByPid(
    pid: number = ROOT_TRRE_NODE_PID,
  ): Promise<string> {
    const qb = this.orgRepository.createQueryBuilder('org');
    const { maxCode } = await qb
      .select('MAX(org.code)', 'maxCode')
      .where('pid = :pid', { pid })
      .getRawOne();
    if (!maxCode?.length) {
      return '1'.padStart(
        pid === ROOT_TRRE_NODE_PID ? this.ROOT_CODE_LENGTH : this.CODE_LENGTH,
        '0',
      );
    }

    const nextCode = `${parseInt(maxCode as string) + 1}`;

    return nextCode.padStart(
      pid === ROOT_TRRE_NODE_PID ? this.ROOT_CODE_LENGTH : this.CODE_LENGTH,
      '0',
    );
  }

  async getNextOrgnoByPid(pid: number): Promise<string> {
    const parent = await this.orgRepository.findOneBy({ id: pid });
    return await this.autoGenerateOrgno(parent);
  }

  async autoGenerateOrgno(parent: OrganizationEntity | null): Promise<string> {
    const nextCode = await this.getNextLevelCodeByPid(parent?.id);
    const rootOrgno = `${this.CODE_PREFIX}${nextCode}`;
    if (!parent)
      return `${rootOrgno.padEnd(this.MAX_CODE_LENGTH + this.CODE_PREFIX.length, '0')}`;

    const { orgno = rootOrgno, level = 1 } = parent;

    const start = this.CODE_PREFIX.length;
    const end = this.CODE_LENGTH * level + start + 1;

    const nextOrgno = `${orgno.slice(start, end)}${nextCode}`;

    return `${this.CODE_PREFIX}${nextOrgno.padEnd(this.MAX_CODE_LENGTH, '0')}`;
  }

  async updateStatus(dto: SetStatusData): Promise<StatusEnum | never> {
    const { id, status } = dto;
    const entity = await this.orgRepository.findOneBy({
      id,
    });

    if (!entity)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_REMOVED,
        `组织${id}不存在`,
      );

    if (status === entity.status) return status;
    await this.orgRepository
      .createQueryBuilder()
      .update(entity)
      .set({
        status: status,
      })
      .where('id = :id', { id })
      .execute();

    return status;
  }

  async getSelectionTreeNodesByPid(
    pid: number,
  ): Promise<Array<TreeNodeOptionType>> {
    const rootOrganizations = await this.getChildrenByPid(pid);
    if (!rootOrganizations?.length) return [];

    const nodes: Array<TreeNodeOptionType> = rootOrganizations.map((e) =>
      OrganizationService.convertEntityToSelectTreeNode(e),
    );

    await this.recursiveSelectionTreeNodes(nodes);

    return nodes;
  }

  async recursiveSelectionTreeNodes(nodes: Array<TreeNodeOptionType>) {
    for (let i = 0; i < nodes.length; i++) {
      const { id } = nodes[i];
      const subEntities = await this.getChildrenByPid(id);
      if (!subEntities?.length) {
        nodes[i].isLeaf = true;
        continue;
      }

      nodes[i].children = subEntities.map((e) =>
        OrganizationService.convertEntityToSelectTreeNode(e),
      );

      void this.recursiveSelectionTreeNodes(nodes[i].children);
    }
  }

  private getChildrenByPid(pid: number): Promise<Array<OrganizationEntity>> {
    return this.orgRepository
      .createQueryBuilder('org')
      .where({ pid })
      .getMany();
  }

  private findChildren(
    node: OrganizationTreeNode,
    all: OrganizationEntity[],
  ): OrganizationTreeNode {
    const pid = node.id;
    const subs: OrganizationTreeNode[] =
      all
        .filter((it) => it.pid === pid)
        ?.map((it) => OrganizationService.convertEntityToTreeNode(it)) ?? null;

    if (subs?.length) node.children = subs;
    if (!node.children?.length) return node;
    for (let i = 0; i < node.children.length; i++) {
      this.findChildren(node.children[i], all);
    }

    return node;
  }

  /**
   *
   * @returns void
   */
  async initRootNode(): Promise<void> {
    const entities = await this.orgRepository.findBy({
      pid: ROOT_TRRE_NODE_PID,
    });

    if (entities?.length) return;
    const rootLevelCode = await this.getNextLevelCodeByPid(ROOT_TRRE_NODE_PID);
    const orgno = await this.autoGenerateOrgno(null);
    const time = new Date(1989, 5, 4).setHours(4, 15, 0, 0);
    const root: Partial<OrganizationEntity> = {
      id: ORG_ROOT_NODE_ID,
      pid: ROOT_TRRE_NODE_PID,
      name: 'Group Headquarters',
      shortName: 'GHQ',
      orgno: orgno,
      code: rootLevelCode,
      level: 1,
      contact: 'admin',
      email: 'tech-service@xtsai.cn',
      phone: '400-123-4567',
      sortno: 0,
      status: StatusEnum.NORMAL,
      description: 'Group Headquarters init',
      createdAt: new Date(time),
      updatedAt: new Date(time),
    };
    await this.orgRepository.save(root);
  }

  private async checkRepeat(
    dto: AddOrganizationModel,
  ): Promise<Partial<OrganizationEntity> | never> {
    const { name, code, pid } = dto;

    let find = await this.orgRepository
      .createQueryBuilder()
      .select()
      .where({ name: name.trim() })
      .getOne();
    if (find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `组织名称${name} 已存在`,
      );
    find = await this.orgRepository
      .createQueryBuilder()
      .select()
      .where({ code: code.trim() })
      .getOne();
    if (find)
      throw BizException.createError(
        ErrorCodeEnum.DATA_RECORD_CONFLICT,
        `组织编码${code} 已存在`,
      );

    const result = await this.orgRepository
      .createQueryBuilder('org')
      .select('MAX(org.sortno)', 'maxSortNo')
      .getRawOne();

    let level = 1;
    const parent = await this.orgRepository.findOneBy({ id: pid });
    if (parent && parent.level) {
      level = parent.level;
    }
    const someEntity: Partial<OrganizationEntity> = {
      sortno: result?.maxSortNo ? result?.maxSortNo + 1 : 1,
      level,
      status: StatusEnum.NORMAL,
      locking: false,
    };

    return someEntity;
  }

  static convertEntityToTreeNode(
    entity: OrganizationEntity,
  ): OrganizationTreeNode {
    const {
      id,
      pid,
      orgno,
      name,
      shortName,
      status,
      locking,
      description,
      icon,
      level,
      sortno,
    } = entity;

    return {
      id,
      pid,
      orgno,
      name,
      shortName,
      status,
      locking,
      description,
      icon,
      level,
      sortno,
    };
  }

  static convertEntityToSelectTreeNode(
    entity: OrganizationEntity,
  ): TreeNodeOptionType {
    const { id, pid, name, code, shortName, icon, level, status, locking } =
      entity;

    const node: TreeNodeOptionType = {
      id,
      key: id,
      label: name,
      pid,
      disabled: status !== StatusEnum.NORMAL,
      extra: {
        code,
        shortName,
        icon,
        level,
        locking,
      },
    };

    return node;
  }

  static convertEntityToTreeNodeOption(
    entity: OrganizationEntity,
  ): TreeNodeOptionType {
    const {
      id,
      pid,
      name,
      code,
      shortName,
      icon,
      level,
      status,
      locking,
      sortno,
      orgno,
    } = entity;
    const isLeaf = true;

    return {
      id: id,
      key: id,
      label: name,
      icon,
      pid: pid,
      isLeaf: isLeaf,
      level,
      disabled: status !== StatusEnum.NORMAL || locking,
      extra: {
        id,
        pid,
        code,
        shortName,
        sortno,
        orgno,
      },
    } as TreeNodeOptionType;
  }
}
