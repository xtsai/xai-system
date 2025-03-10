import { StatusEnum } from '@tsailab/core-types';
import { BaseORGEntity } from '@xtsai/core';
import { Transform, Type } from 'class-transformer';
import { Column, Entity } from 'typeorm';

/**
 * this entity is used to store the custom user group information
 */
@Entity({
  name: 'sys_auth_group',
  synchronize: true,
})
export class AuthGroupEntity extends BaseORGEntity {
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    nullable: true,
    name: 'pid',
    comment: 'parent group id',
  })
  pid: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'groupname',
    comment: 'group name',
  })
  groupname: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    nullable: true,
    name: 'sortno',
    default: 1,
    comment: 'group sortno',
  })
  sortno: number;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'tinyint',
    name: 'status',
    default: 1,
    comment: 'group status',
  })
  status: StatusEnum;

  @Column({
    type: 'varchar',
    length: 200,
    nullable: true,
    name: 'description',
    comment: 'description',
  })
  description: string;
}
