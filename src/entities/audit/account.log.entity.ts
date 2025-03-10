import { AuditDetailJson, AuditErrorJson } from '@xtsai/core';
import { Transform, TransformFnParams, Type } from 'class-transformer';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'sys_user_log',
  synchronize: true,
  comment: 'record back-end account logs',
})
export class SysAccountLogEntity extends BaseEntity {
  @PrimaryGeneratedColumn({
    type: 'bigint',
    name: 'id',
    comment: 'Primary key ID',
  })
  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  id: number;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
    name: 'biztype',
    comment: 'audit log biz type',
  })
  biztype: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @Column({
    type: 'int',
    name: 'uid',
    nullable: true,
    comment: 'user id',
  })
  uid: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'username',
    comment: 'username',
  })
  username: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    name: 'client_id',
    comment: 'clientId',
  })
  clientId: string;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
    name: 'ip',
    comment: 'ip',
  })
  ip: string;

  @Column({
    type: 'longtext',
    nullable: true,
    name: 'detail',
    comment: 'log detail',
  })
  detail: string;

  detailJson?: AuditDetailJson | null;

  @Column({
    type: 'longtext',
    nullable: true,
    name: 'biz_detail',
    default: null,
    comment: 'biz log detail',
  })
  bizDetail: string;

  @Column({
    type: 'longtext',
    nullable: true,
    name: 'error',
    default: null,
    comment: 'log error detail',
  })
  error: string;

  errorJson?: AuditErrorJson | null;

  @Type(() => Boolean)
  @Transform(({ value }) => Boolean(value))
  @Column({
    name: 'locked',
    type: 'tinyint',
    default: 1,
    comment: 'log can clear by ui',
  })
  locked: boolean;

  @Transform((row: TransformFnParams) => +new Date(row.value))
  @CreateDateColumn({
    type: 'timestamp',
    nullable: false,
    name: 'created_at',
    comment: 'record create time',
  })
  createdAt: Date;

  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
    comment: 'Logic delete sign',
  })
  deletedAt?: Date;

  static parseJson(entity: SysAccountLogEntity): SysAccountLogEntity {
    const { detail, error } = entity;
    if (detail?.length) {
      try {
        entity.detailJson = JSON.parse(detail) as AuditDetailJson;
        // eslint-disable-next-line no-empty
      } catch (_) {}
    }

    if (error?.length) {
      try {
        entity.errorJson = JSON.parse(error);
        // eslint-disable-next-line no-empty
      } catch (_) {}
    }

    return entity;
  }
}
