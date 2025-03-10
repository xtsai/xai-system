import { Transform, Type } from 'class-transformer';
import { Column, Entity, Index, OneToMany, Unique } from 'typeorm';
import { StatusEnum } from '@tsailab/core-types';
import { SysDictItemEntity } from './dict.item.entity';
import { CommonEntity } from '@xtsai/core';

@Entity({
  name: 'sys_dict',
  synchronize: true,
})
@Unique('uq_name_code', ['name', 'code'])
export class SysDictEntity extends CommonEntity {
  @Index()
  @Column({
    name: 'name',
    type: 'varchar',
    length: 64,
    nullable: false,
    comment: 'Dict name require not null',
  })
  name: string;

  @Column({
    name: 'code',
    type: 'varchar',
    length: 128,
    nullable: false,
    comment: 'Dict code require not null',
  })
  code: string;

  @Column({
    name: 'pcode',
    type: 'varchar',
    length: 128,
    nullable: true,
    default: '',
    comment: 'Dict parent code',
  })
  pcode: string;

  @Column({
    name: 'tag',
    type: 'varchar',
    length: 64,
    nullable: true,
    default: '',
    comment: 'Dict group',
  })
  tag: string;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'icon',
    comment: 'Record icon',
  })
  icon: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    nullable: true,
    default: 0,
    name: 'sortno',
    comment: 'record sort number',
  })
  sortno: number;

  @Column({
    type: 'tinyint',
    nullable: true,
    default: 1,
    name: 'status',
    comment: 'status,0-forbidden,1-normal',
  })
  status: StatusEnum;

  @OneToMany(() => SysDictItemEntity, (e) => e.dictId)
  items: Array<SysDictItemEntity>;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: true,
    name: 'remark',
    comment: 'Record remark',
  })
  remark: string;
}
