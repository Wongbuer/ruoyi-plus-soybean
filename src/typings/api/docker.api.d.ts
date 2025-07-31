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
      labels: {
        volumeTypeEnum: string;
        userId: string;
        username: string;
        zfsDataset: string;
        isBuiltIn: boolean;
      };
    };

    /** volume search params */
    type VolumeSearchParams = CommonType.RecordNullable<
      Pick<Volume, 'name'> & { username?: string } & Api.Common.CommonSearchParams
    >;

    /** volume operate params */
    type VolumeOperateParams = CommonType.RecordNullable<
      Pick<Volume, 'name'> & {
        // Add other fields needed for create/update if known
      }
    >;

    /** volume list */
    type VolumeList = Volume[];
  }
}
