import { useNavigate, useParams } from "react-router";
import { useDashContext } from "../components/DashWrap";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { useDashData } from "../api/dashDataI";
import { useWaitRelock } from "../api/useWaitRelock";
import { toast } from "sonner";
import { useCancelOrder } from "../api/useCancelOrder";
import { useOrderExists } from "../api/useOrderExists";
import { useQueryParamState } from "../components/useQueryParamState";

const EnterParcel = () => {
  const { id } = useParams();
  const [params] = useQueryParamState({ slotId: undefined });
  const slotId = params.slotId;

  const ds = useDashContext();
  const navigate = useNavigate();
  const dashApi = useDashData(); // mutation variant
  const [initWeight, setInitWeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relocking, setRelocking] = useState(false);
  const parcelApi = useWaitRelock();
  const cancelApi = useCancelOrder();
  const getParcelApi = useOrderExists();

  // --- New State for Countdown ---
  const [countdown, setCountdown] = useState(120);
  const [timerActive, setTimerActive] = useState(false);

  // --- store mutateAsync in refs so polling effects don't depend on the whole hook object ---
  const dashMutateRef = useRef(dashApi.mutateAsync);
  useEffect(() => {
    dashMutateRef.current = dashApi.mutateAsync;
  }, [dashApi]);

  const parcelMutateRef = useRef(parcelApi.mutateAsync);
  useEffect(() => {
    parcelMutateRef.current = parcelApi.mutateAsync;
  }, [parcelApi]);

  const cancelMutateRef = useRef(cancelApi.mutateAsync);
  useEffect(() => {
    cancelMutateRef.current = cancelApi.mutateAsync;
  }, [cancelApi]);

  const getOrderMutateRef = useRef(getParcelApi.mutateAsync);
  useEffect(() => {
    getOrderMutateRef.current = getParcelApi.mutateAsync;
  }, [getParcelApi]);

  // Memoize handleCancel so effects depending on it won't re-run.
  const handleCancel = useCallback(async () => {
    if (!id) {
      navigate(`/dashuix`);
      return;
    }
    try {
      if (!cancelMutateRef.current) throw new Error("cancel API missing");
      await cancelMutateRef.current({ orderId: id });
    } catch (e) {
      toast.error("Failed to cancel order. Returning.");
      return;
    }
    navigate(`/dashuix`);
    toast("Parcel drop-off cancelled.");
  }, [id, navigate]);

  // Memoize handleParcelOpen. It's okay to depend on id/slotId/initWeight etc.
  const handleParcelOpen = useCallback(async () => {
    if (!id || !slotId) {
      toast.error("Missing order ID or slot ID!");
      return;
    }
    setCountdown(120); // Reset countdown each time unlock is pressed
    setTimerActive(true);
    setRelocking(true);

    try {
      const parcelMut = parcelMutateRef.current;
      if (!parcelMut) throw new Error("parcel API unavailable");
      const d = await parcelMut(slotId); // parcel API has its own timeout

      if (d?.data) {
        toast("Relock success!");
        const dashMut = dashMutateRef.current;
        if (!dashMut) throw new Error("dash API unavailable");
        const curWeight = await dashMut();
        if (!curWeight) {
          toast.error("Failed to read current weight after relock.");
          setTimerActive(false);
          setRelocking(false);
          return;
        }
        const wei = curWeight.sensors.weights[parseInt(slotId, 10)];
        const diff = wei - initWeight;

        toast(`Meaningful change? ${diff} grams.`);
        if (diff < 30) {
          toast.error("Not enough weight change detected, please try again!");
        } else {
          toast.success("Parcel dropped off successfully!");
          const getOrder = getOrderMutateRef.current;
          if (!getOrder) {
            toast.error("Order lookup unavailable.");
            return;
          }
          const order = await getOrder(id);
          if (order) {
            if (order.type === "COD") {
              navigate(
                `/dashuix/money/${id}?initialWeight=${initWeight}&finalWeight=${wei}`
              );
            } else {
              navigate(
                `/dashuix/end/${id}?initialWeight=${initWeight}&finalWeight=${wei}`
              );
            }
          } else {
            toast.error("Failed to get order. Please try again.");
          }
        }
      } else {
        if (d?.status === "MAGNET_ERROR") {
          toast.error(
            "Door is not closed properly. Please close it firmly and try again."
          );
        } else {
          toast.error("Relock failed or timed out! Check the door and try again.");
        }
      }
    } catch (error) {
      console.error("Error during parcel relock process:", error);
      toast.error("An unexpected error occurred during the relock process.");
    } finally {
      setTimerActive(false);
      setRelocking(false);
    }
  }, [id, slotId, initWeight, navigate]);

  // Effect to fetch initial weight
  useEffect(() => {
    if (!slotId) {
      setLoading(false);
      return;
    }
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const dashMut = dashMutateRef.current;
        if (!dashMut) throw new Error("dash API missing");
        const dataDash = await dashMut();
        console.log({dataDash})
        if (isMounted && dataDash) {
          setInitWeight(dataDash.sensors.weights[parseInt(slotId, 10)]);
        } else if (isMounted) {
          toast.error("Failed to fetch initial weight.");
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error fetching initial weight:", error);
          toast.error("Error fetching initial weight.");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    return () => {
      isMounted = false;
    };
  }, [slotId]); // only re-run when slotId changes — dashMutateRef is used so hook object instability doesn't restart it

  // Update the dashboard context display
  // Memoize the element so ds.setLeftSideElement receives the same reference unless meaningful inputs change
  const leftSideElement = useMemo(() => {
    return (
      <div>
        <div className="text-3xl font-light">Parcel Handoff</div>
        <div>Order {id}</div>
        <div>Slot {Number(slotId) + 1}</div>
        After dropping off the parcel, you can proceed to money collection.<br />
        It should weigh more after dropping off the parcel.
        <br />
 
        <button
          onClick={handleCancel}
          className="text-white mt-4 ml-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
        >
          Cancel Handoff
        </button>
      </div>
    );
    // handleCancel is stable via useCallback
  }, [initWeight, id, slotId, handleCancel, navigate]);

  useEffect(() => {
    ds.setLeftSideElement(leftSideElement);
  }, [ds, leftSideElement]);

  // --- Countdown Timer Effect ---
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    if (timerActive && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000);
    } else if (countdown === 0) {
      setTimerActive(false);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [timerActive, countdown]);

  if (loading) return <div>Loading initial data...</div>;

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div>
      <p className="mb-4">
        Click the unlock button when you are ready to place the parcel inside the
        compartment.
      </p>
      <button
        onClick={() => setConfirmOpen(true)}
        className={`text-white w-full px-4 py-3 rounded font-semibold ${
          relocking
            ? "bg-gray-500 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
        disabled={relocking}
      >
        {relocking ? "Waiting for Relock..." : "Unlock Compartment"}
      </button>
      {
        confirmOpen && !relocking && (
          <div className="fixed inset-0 z-20 bg-black/50 flex items-center justify-center">
            <div className="bg-white text-black rounded shadow-lg w-full max-w-md p-6">
              <div className="text-xl font-semibold mb-2">Confirm Unlock</div>
              <div className="text-sm text-gray-700 mb-4">
                Are you sure this is the correct box to unlock?
              </div>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => { setConfirmOpen(false); handleParcelOpen(); }}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                >
                  Yes, Unlock
                </button>
              </div>
            </div>
          </div>
        )
      }

      {relocking && (
        <div className="mt-4 p-4 border border-yellow-500 bg-yellow-100 text-yellow-800 rounded">
          <p className="font-semibold">Action Required:</p>
          <p>
            Please open the door, put the parcel inside, and close the door
            firmly.
          </p>
          <p className="text-lg font-bold mt-2">
            Time remaining: {countdown} seconds
          </p>
          <p className="text-sm mt-1">
            The compartment will attempt to relock automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnterParcel;

// --- CurrentWeight Component (fixed to avoid effect deps on unstable hook object) ---
const CurrentWeight = ({ slotId }: { slotId?: string | null }) => {
  const dashApi = useDashData();
  const [weight, setWeight] = useState(0);

  // Keep a ref to the latest mutateAsync so the polling interval effect doesn't depend on the hook object.
  const dashMutRef = useRef(dashApi.mutateAsync);
  useEffect(() => {
    dashMutRef.current = dashApi.mutateAsync;
  }, [dashApi]);

  useEffect(() => {
    if (!slotId) return;
    let isMounted = true;

    const fetchOnce = async () => {
      try {
        const dashMut = dashMutRef.current;
        if (!dashMut) return;
        const dataDash = await dashMut();
        if (isMounted && dataDash) {
          setWeight(dataDash.sensors.weights[parseInt(slotId, 10)]);
        }
      } catch (error) {
        if (isMounted) console.error("Error fetching current weight:", error);
      }
    };

    fetchOnce();

    const interval = setInterval(async () => {
      try {
        const dashMut = dashMutRef.current;
        if (!dashMut) return;
        const dataDash = await dashMut();
        if (isMounted && dataDash) {
          setWeight(dataDash.sensors.weights[parseInt(slotId, 10)]);
        }
      } catch (error) {
        if (isMounted) console.error("Error fetching current weight:", error);
      }
    }, 2000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
    // NOTE: intentionally only depending on slotId (primitive) so the polling
    // interval is not recreated every render due to hook object instability.
  }, [slotId]);

  return <div>Current weight: {weight}g</div>;
};
