import { StatusEnum } from '@tsailab/core-types';
import { BaseORGEntity } from '@xtsai/core';
import { Transform, Type } from 'class-transformer';
import { Column, Entity } from 'typeorm';

@Entity({
  name: 'sys_menu',
})
export class SysMenuEntity extends BaseORGEntity {
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    nullable: true,
    name: 'pid',
    default: 0,
    comment: 'parent id',
  })
  pid: number;
  @Column({
    name: 'title',
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: 'titl',
  })
  title: string;
  @Column({
    name: 'code',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'menu auth code',
  })
  code: string;

  @Column({
    name: 'path',
    type: 'varchar',
    length: 256,
    nullable: true,
    comment: 'menu auth code',
  })
  path: string;
  @Column({
    name: 'component',
    type: 'varchar',
    length: 200,
    comment: 'UI component name',
  })
  component: string;
  @Column({
    type: 'varchar',
    length: 256,
    name: 'redirect',
    comment: 'redirect',
  })
  redirect: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    nullable: false,
    name: 'sortno',
    default: 1,
    comment: 'sort no',
  })
  sortno: number;
  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'icon',
    comment: 'Record icon',
  })
  icon: string;
  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: 'status,0-forbidden,1-normal',
  })
  status: StatusEnum;
  @Column({
    type: 'longtext',
    nullable: true,
    name: 'metajson',
    comment: 'UI route meta',
  })
  metajson: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'remark',
    comment: 'Record remark',
  })
  remark: string;
}
