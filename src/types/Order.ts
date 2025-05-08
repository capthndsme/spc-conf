import Slot from "./Slot";

 

export default class Order  {

  declare id: number

  
  declare createdAt: string

 
  declare updatedAt: string

 

 
  /**
   * This is the E-Commerce's ORDER ID
   * This will be used to search for users orders.
   */
  declare orderId: string;


 
  declare otpRider: string;

 
  declare riderName: string;

 
  declare riderNumber?: string;

 
  declare courier?: string;

 
  declare orderPlaced: string;

 
  declare itemDescription: string;
  

 
  declare orderReceived: string;

 
  declare orderGetOut: string;

 
  declare slotId: number;

 
  declare slot: Slot | null;

 
  declare state: "PENDING" | "OTP_WAITING" | "DELETED" | "DELIVERED" |  "FINISHED";

 
  declare beforeWeight?: string;

 
  declare afterWeight?: string;

 
  declare moneyContent?: number

 
  declare type: "COD" | "PAID"


}

