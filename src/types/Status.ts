 
export type IStatusResponse<T = any> = {
  data: T;
  status: Status;
  error?: boolean
}

export const StatusResponse = <T = any>(data: T, status: Status = Status.GENERIC_SUCCESS, error: boolean = false): IStatusResponse<T> => ({
  data,
  status,
  error
})

export enum Status {
  GENERIC_SUCCESS = "GENERIC_SUCCESS",
  GENERIC_ERROR = "GENERIC_ERROR",
  INVALID_ACCESS = "INVALID_ACCESS",
  ERR_ORDER_NOT_FOUND = "ERR_ORDER_NOT_FOUND",
  ERR_NO_SUCH_SLOT = "ERR_NO_SUCH_SLOT",
  ERR_NUMBER_MISMATCH = "ERR_NUMBER_MISMATCH",
  MAGNET_ERROR = "MAGNET_ERROR"

}