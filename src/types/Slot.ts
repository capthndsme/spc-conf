 
import Order from './Order'
 
export default class Slot  {
 
  declare id: number

 
  declare createdAt: string

 
  declare updatedAt: string
  

  /**
   * Slot details
   */

 
  declare isFilled: boolean;

  
  declare moneyAmount: number;

 
  declare lastTriggered: number | null;

 
  declare num: number 


  /**
   * Active order id validation
   */
 
  declare activeOrderId: number

 
  declare orders: Order[] | null


 
}