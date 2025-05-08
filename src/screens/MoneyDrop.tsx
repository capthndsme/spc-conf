import { useNavigate, useParams, useSearchParams } from "react-router";
import { useDropMoney } from "../api/useDropMoney";
import { useDashContext } from "../components/DashWrap";
import { useEffect, useState } from "react";
import { toast } from "sonner";

const MoneyDrop = () => {

  const dropApi = useDropMoney();
  const navigate = useNavigate()
  const ds = useDashContext();
  // get {initialWeight} from queryparams
  const [p] = useSearchParams()
  const { id } = useParams();
  const [dropping, setDropping] = useState(false);
  const finishUrl = `/DashUIx/end/${id}?initialWeight=${p.get('initialWeight')}&finalWeight=${p.get('finalWeight')}`
  const handleDrop = async () => {
    if (id) {
      setDropping(true)
      try {
        await dropApi.mutateAsync({ orderId: id });
        navigate(finishUrl);
      }
      catch (e) {
        toast.error("Oh no, we cannot collect payment. Try again.")
      }
      finally {
        setDropping(false)
      }
    }
  };

  useEffect(() => {
    ds.setLeftSideElement(<div>
      <div className="text-3xl font-light">Collect Payment</div>
      <div>COD order detected. Click the button to collect payment</div>
      <br />

    </div>)
  }, [])
  return (
    <div>
      Click the button to collect payment.
      <button
        disabled={dropping}
        onClick={handleDrop}
        className="bg-blue-500 hover:bg-blue-700 text-white w-full font-bold py-2 px-4 rounded disabled:bg-gray-400"
      >
        {dropping ? "Dropping..." : "Drop Money"}
      </button>
      
    </div>
  );

}

export default MoneyDrop;