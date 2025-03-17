import { CommTreeNode, StatusEnum } from '@tsailab/core-types';
import { BaseSimpleEntity } from '@xtsai/core';
import { Transform, Type } from 'class-transformer';
import { Column, Entity, Index } from 'typeorm';

/**
 *
 */
@Entity({
  name: 'ai_bot_category',
  synchronize: true,
  comment: 'Front UI columns',
})
export class CategoryEntity extends BaseSimpleEntity {
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    name: 'pid',
    type: 'int',
    nullable: true,
    default: -1,
    comment: 'parent id',
  })
  pid: number;

  @Index()
  @Column({
    name: 'cateno',
    type: 'varchar',
    length: 64,
    nullable: false,
    comment: 'unique no',
  })
  cateno: string;

  @Column({
    name: 'title',
    type: 'varchar',
    length: 100,
    nullable: true,
    default: '',
    comment: 'title',
  })
  title: string;

  /**
   * reffer PET uuid
   */
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    name: 'uuid',
    type: 'int',
    nullable: true,
    default: 1000,
    comment: 'reffer PET uuid',
  })
  uuid: number;

  @Column({
    name: 'icon',
    type: 'varchar',
    length: 256,
    nullable: true,
    default: '',
    comment: 'icon name or image url',
  })
  icon: string;

  @Column({
    name: 'image',
    type: 'varchar',
    length: 256,
    nullable: true,
    default: '',
    comment: 'the main image url',
  })
  image: string;

  @Column({
    name: 'group',
    type: 'varchar',
    length: 100,
    nullable: true,
    default: '',
    comment: 'category grop may from dict',
  })
  group: string;

  @Column({
    name: 'tag',
    type: 'varchar',
    length: 200,
    nullable: true,
    default: '',
    comment: 'category tags',
  })
  tag: string;

  /**
   * front route path
   */
  @Column({
    name: 'path',
    type: 'varchar',
    length: 256,
    nullable: true,
    default: '',
    comment: 'category path for front route',
  })
  path: string;

  /**
   * out href url
   */
  @Column({
    name: 'url',
    type: 'varchar',
    length: 256,
    nullable: true,
    default: '',
    comment: 'category url for out link',
  })
  url: string;

  @Column({
    name: 'richcontent',
    type: 'longtext',
    nullable: true,
    default: null,
    comment: 'category rich html desc',
  })
  richcontent: string;

  @Column({
    name: 'remark',
    type: 'varchar',
    length: 256,
    nullable: true,
    default: '',
    comment: 'category remark back',
  })
  remark: string;

  children: CategoryEntity[];

  static entity2TreeNode(entity: CategoryEntity): CommTreeNode {
    const { id, pid, cateno, title, icon, status, sortno, tag, group, uuid } =
      entity;

    const node: CommTreeNode = {
      id,
      pid,
      key: id,
      label: title,
      disabled: status === StatusEnum.FORBIDDEN,
      sortno,
      isLeaf: true,
      extra: {
        uuid,
        cateno,
        icon,
        tag,
        group,
      },
    };

    return node;
  }
}
