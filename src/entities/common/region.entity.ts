import { Column, Entity } from 'typeorm';
import { Transform, Type } from 'class-transformer';
import { StatusEnum } from '@tsailab/core-types';
import { BaseSimpleEntity } from '@xtsai/core';

@Entity({
  name: 'sys_region',
  synchronize: true,
})
export class SysRegionEntity extends BaseSimpleEntity {
  @Column({
    type: 'bigint',
    name: 'pid',
    nullable: false,
    comment: 'region parent id',
  })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  pid: number;

  @Column({
    type: 'varchar',
    name: 'name',
    length: 128,
    nullable: false,
    comment: 'Region name',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
    name: 'code',
    comment: 'Region code',
  })
  code: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
    name: 'value',
    comment: 'Region value',
  })
  value: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 20,
    default: null,
    name: 'tag',
    comment: 'Region tag',
  })
  tag: string;

  @Column({
    type: 'bigint',
    name: 'sortno',
    nullable: true,
    default: 0,
    comment: 'region sortno',
  })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  sortno: number;

  @Column({
    type: 'tinyint',
    nullable: true,
    name: 'status',
    default: '1',
    comment: 'Region status',
  })
  status: StatusEnum;

  @Column({
    type: 'longtext',
    nullable: true,
    default: null,
    name: 'extra',
    comment: 'Region extra record',
  })
  extra: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'remark',
    comment: 'Region remark',
  })
  remark: string;
}
