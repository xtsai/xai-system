import { StatusEnum } from '@tsailab/core-types';
import { BaseORGEntity } from '@xtsai/core';
import { Type } from 'class-transformer';
import { Column, Entity, Index, Unique } from 'typeorm';

@Entity({ name: 'sys_role' })
@Unique('name_deleted', ['name', 'deletedAt'])
export class SysRoleEntity extends BaseORGEntity {
  @Index({ unique: true })
  @Column({
    type: 'varchar',
    nullable: false,
    length: 50,
    name: 'name',
    comment: 'Role name',
  })
  name: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'group',
    comment: 'Role group',
  })
  group: string;

  @Column({
    type: 'varchar',
    nullable: true,
    length: 100,
    name: 'description',
    comment: 'Role Description',
  })
  description: string;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: 'Role status:0-unavailable,1-available',
  })
  status: StatusEnum;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 0,
    name: 'is_default',
    comment: 'Is default role for registered,0-not,1-yes',
  })
  @Type(() => Boolean)
  isDefault: boolean;
}
