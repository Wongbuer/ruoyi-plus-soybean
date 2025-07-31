/**
 * namespace Saga
 *
 * backend api module: "Saga"
 */
declare namespace Saga {
  import CommonRecord = Api.Common.CommonRecord;
  /** operate log */
  type OperateLog = CommonRecord<{
    /** saga操作ID */
    sagaOperateId: CommonType.IdType;
    /** saga名称 */
    sagaName: string;
    /** saga状态 */
    sagaStatus: string;
    /** 当前步骤名称 */
    currentStepName: string;
    /** saga上下文json */
    sagaContextJson: string;
    /** 错误详情 */
    errorDetails: string;
  }>;

  /** operate log search params */
  type OperateLogSearchParams = CommonType.RecordNullable<
    Pick<Saga.OperateLog, 'sagaName'> & Api.Common.CommonSearchParams
  >;

  /** operate log operate params */
  type OperateLogOperateParams = CommonType.RecordNullable<
    Pick<
      Saga.OperateLog,
      'sagaOperateId' | 'sagaName' | 'sagaStatus' | 'currentStepName' | 'sagaContextJson' | 'errorDetails'
    >
  >;

  /** operate log list */
  type OperateLogList = Api.Common.PaginatingQueryRecord<OperateLog>;
}
