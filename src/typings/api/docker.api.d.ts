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
  }
}
