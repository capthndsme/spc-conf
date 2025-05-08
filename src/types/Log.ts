export type Log = {

   id: number


   createdAt: string

   updatedAt: string


   logType: LogType


   dataMsg: string


   photoImage: string | null



}


export type LogType = 
  | "ATTEMPT_LOGIN"
  | "ATTEMPT_OTP"
  | "ATTEMPT_ORDER_ID"
  | "ATTEMPT_ENTER_NUMBER"
  | "ATTEMPT_ENTER_OTP"
  | "ATTEMPT_CANCEL_ORDER"
  | "ATETMPT_UNLOCK_COMPARTMENT"
  | "ATTEMPT_DROP_MONEY"
  | "ATTEMPT_FINISH_ORDER"