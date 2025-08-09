declare namespace Api {
  /**
   * namespace Docker
   *
   * backend api module: "Docker"
   */
  namespace Docker {
    /** volume */
    type Volume = {
      name: string;
      driver: string;
      createTime: string;
      mountpoint?: string;
      options?: Record<string, any>;
      quotaRule?: {
        enabled: boolean;
        size: number;
        [key: string]: any;
      };
      labels: {
        volumeTypeEnum: string;
        userId: string;
        username: string;
        zfsDataset: string;
        isBuiltIn: boolean;
        alias: string;
      };
    };

    /** volume search params */
    type VolumeSearchParams = CommonType.RecordNullable<
      Pick<Volume, 'name'> & { alias?: string; username?: string } & Api.Common.CommonSearchParams
    >;

    /** volume operate params */
    type VolumeOperateParams = CommonType.RecordNullable<{
      alias: string;
      name?: string;
      driver?: string;
      createTime?: string;
      userId: string;
      volumeType: string;
      isBuiltin: boolean;
    }>;

    /** volume list */
    type VolumeList = Volume[];
    /** volume record */
    type VolumeRecord = Common.CommonRecord<{
      /** 主键ID */
      id: CommonType.IdType;
      /** 原始Docker Volume名称 */
      volumeName: string;
      /** 关联的ZFS数据集路径 */
      zfsDataset: string;
      /** Volume驱动 */
      driver: string;
      /** 原始标签(JSON格式)，用于恢复 */
      labels: string;
      /** 原始选项(JSON格式)，用于恢复 */
      options: string;
      /** 备注 */
      remark: string;
    }>;

    /** volume record search params */
    type VolumeRecordSearchParams = CommonType.RecordNullable<
      Pick<Api.Docker.VolumeRecord, 'volumeName'> & Api.Common.CommonSearchParams
    >;

    /** volume record operate params */
    type VolumeRecordOperateParams = CommonType.RecordNullable<
      Pick<Api.Docker.VolumeRecord, 'id' | 'volumeName' | 'zfsDataset' | 'driver' | 'labels' | 'options' | 'remark'>
    >;

    /** volume record list */
    type VolumeRecordList = Api.Common.PaginatingQueryRecord<VolumeRecord>;
  }
}
