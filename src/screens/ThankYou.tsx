/**
 * Creating a simple Thank you component 
 */

import { useEffect } from "react";
import { useDashContext } from "../components/DashWrap";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useFinishOrder } from "../api/useFinishOrder";
import { toast } from "sonner";



export function ThankYou() {
  const ds = useDashContext();
  const navigate = useNavigate();
  const {id} = useParams();
  const markFinish = useFinishOrder()
  const [p] = useSearchParams()
  const initialWeight = p.get('initialWeight')
  const finalWeight = p.get('finalWeight')

  const done = async () => {
    if (!id) return;
    try {
        await markFinish.mutateAsync({orderId: id, initialWeight, finalWeight})
        toast.success("Order marked as done! Thank you for using SmartDrop.")
    } catch (e) {
      toast.warning("Warning, can't mark order done.")

    } finally {
      navigate(`/dashuix`)
    }
    
  }
  useEffect(() => {

    ds.setLeftSideElement(<div>
      <div className="text-3xl font-light">Order completed successfully!</div>
      <div>Thank you for using SmartDrop</div>
      <br />
      <button onClick={() => done()} className="text-white mt-4">
        Home
      </button>
    </div>)
  }, [])

  useEffect(() => {
    const cancel = setTimeout(() => {
      done();
    }, 6000);
    return () => clearTimeout(cancel);
  }, [navigate]);
  
  
  return <div>
      <div className="text-3xl font-light">Order completed successfully!</div>
      <div>Thank you for using SmartDrop</div>
      <br />
      <button onClick={() => navigate(`/dashuix`)} className="text-white mt-4">
        Home
      </button>
    </div>
    
}