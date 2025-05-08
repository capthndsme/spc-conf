import { useNavigate, useParams } from "react-router";
import { useDashContext } from "../components/DashWrap";
import { useEffect, useState } from "react";
import { useDashData } from "../api/dashDataI";
import { useWaitRelock } from "../api/useWaitRelock";
import { toast } from "sonner";
import { useCancelOrder } from "../api/useCancelOrder";
import { useOrderExists } from "../api/useOrderExists";

const EnterParcel = () => {
  const { id } = useParams();
  const ds = useDashContext();
  const navigate = useNavigate();
  const dashApi = useDashData(); // mutation variant
  const [initWeight, setInitWeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [relocking, setRelocking] = useState(false);
  const parcelApi = useWaitRelock();
  const cancelApi = useCancelOrder()
  const getParcelApi = useOrderExists()
  // --- New State for Countdown ---

  const [countdown, setCountdown] = useState(120);
  const [timerActive, setTimerActive] = useState(false); // To control the timer effect

  const handleCancel = async () => {
    // Implement cancel logic if needed
    // Maybe navigate back or reset state

    if (!id ) {
      navigate(`/dashuix`);
      return;
    }
    try {
      await cancelApi.mutateAsync({orderId: id})
    } catch (e) {
      toast.error("Failed to cancel order. Returning.")
      return;
      
    }
    navigate(`/dashuix`); // Example navigation
    toast("Parcel drop-off cancelled.");

  };

  const handleParcelOpen = async () => {
    if (!id) return;
    setCountdown(120); // Reset countdown each time unlock is pressed
    setTimerActive(true); // Start the timer effect
    setRelocking(true);
    
    try { // Added try...finally to ensure state updates correctly
      const d = await parcelApi.mutateAsync(); // This has the 120s timeout internally

      if (d.data) {
        toast("Relock success!");
        const curWeight = await dashApi.mutateAsync();
        if (!curWeight) {
          // Handle error case where weight couldn't be read
          toast.error("Failed to read current weight after relock.");
          setTimerActive(false); // Stop timer
          setRelocking(false);
          return;
        }
        const wei = curWeight.sensors.weight;

        const diff = wei - initWeight;

        toast(`Meaningful change? ${diff} grams.`);
        if (diff < 30) {
          toast.error("Not enough weight change detected, please try again!");
          // Don't navigate away, allow user to try again or cancel
        } else {
          toast.success("Parcel dropped off successfully!");
          // get ORDER 
          // if ORDER === COD, go to money collect
          // if ORDER === PAID, go to end screen (/dashuix/end/:id)

          const order = await getParcelApi.mutateAsync(id);
          if (order) {
            if (order.type === "COD") {
              navigate(`/dashuix/money/${id}?initialWeight=${initWeight}&finalWeight=${wei}`);
            } else {
              navigate(`/dashuix/end/${id}?initialWeight=${initWeight}&finalWeight=${wei}`);
            }
          } else {
            toast.error("Failed to get order. Please try again.")
          }
          

        }

      } else {
        if (d.status === "MAGNET_ERROR") {
          toast.error("Door is not closed properly. Please close it firmly and try again.");
        } else {
          // General failure or timeout from parcelApi
          toast.error("Relock failed or timed out! Check the door and try again.");
        }
      }
    } catch (error) {
        // Catch potential errors from parcelApi.mutateAsync() itself
        console.error("Error during parcel relock process:", error);
        toast.error("An unexpected error occurred during the relock process.");
    } finally {
        // This block ensures state is reset regardless of success, failure, or error
        setTimerActive(false); // Stop timer effect
        setRelocking(false); // Update relocking state
    }
  };

  // Effect to fetch initial weight
  useEffect(() => {
    let isMounted = true; // Prevent state update on unmounted component
    const d = async () => {
      setLoading(true); // Ensure loading is true at the start
      try {
        const dataDash = await dashApi.mutateAsync();
        if (isMounted && dataDash) {
          setInitWeight(dataDash.sensors.weight);
        } else if (isMounted) {
            toast.error("Failed to fetch initial weight.");
        }
      } catch (error) {
        if (isMounted) {
            console.error("Error fetching initial weight:", error);
            toast.error("Error fetching initial weight.");
        }
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    d();
    return () => { isMounted = false }; // Cleanup function
  }, []); // Runs once on mount


  // Effect to update the dashboard context display
   useEffect(() => {
    ds.setLeftSideElement(
      <div>
        <div className="text-3xl font-light">Parcel Handoff</div>
        <div>Order {id}</div>
        After dropping off the parcel, you can proceed to
        money collection.<br />
        <b>Initial weight: {initWeight}g</b><br />
        <CurrentWeight /><br />
        It should weigh more after dropping off the parcel.
        <br />
        <button onClick={handleCancel} className="text-white mt-4 bg-red-600 hover:bg-red-700 px-4 py-2 rounded">
          Cancel Handoff
        </button>
      </div>
    );
    // Include necessary dependencies, handleCancel might need useCallback if complex
  }, [initWeight, id, handleCancel]);

  // --- Countdown Timer Effect ---
  useEffect(() => {
    let intervalId = null;

    if (timerActive && countdown > 0) {
      intervalId = setInterval(() => {
        setCountdown((prevCount) => prevCount - 1);
      }, 1000); // Run every second
    } else if (countdown === 0) {
      // Optionally handle timeout explicitly here if needed,
      // though the parcelApi handles its own timeout.
      // Maybe show a specific timeout message independent of parcelApi?
      // toast.warning("Drop-off time limit reached."); // Example
      setTimerActive(false); // Ensure timer stops if it hits zero
    }

    // Cleanup function to clear interval when component unmounts
    // or when timerActive becomes false or countdown hits 0
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [timerActive, countdown]); // Dependencies: run when timerActive or countdown changes


  // Return loading state
  if (loading) return <div>Loading initial data...</div>;

  // Main component render
  return (
    <div>
      <p className="mb-4">
        Click the unlock button when you are ready to place the parcel inside the compartment.
      </p>
      <button
        onClick={handleParcelOpen}
        className={`text-white w-full px-4 py-3 rounded font-semibold ${relocking ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
        disabled={relocking}
      >
        {relocking ? "Waiting for Relock..." : "Unlock Compartment"}
      </button>

      {relocking && (
        <div className="mt-4 p-4 border border-yellow-500 bg-yellow-100 text-yellow-800 rounded">
          <p className="font-semibold">Action Required:</p>
          <p>Please open the door, put the parcel inside, and close the door firmly.</p>
          <p className="text-lg font-bold mt-2">
            Time remaining: {countdown} seconds
          </p>
          <p className="text-sm mt-1">The compartment will attempt to relock automatically.</p>
        </div>
      )}
    </div>
  );
};

export default EnterParcel;

// --- CurrentWeight Component (remains the same) ---
const CurrentWeight = () => {
  const dashApi = useDashData();
  const [weight, setWeight] = useState(0);
 
  useEffect(() => {
    let isMounted = true; // Prevent state updates on unmounted components

    const fetchWeight = async () => {
 
        try {
            const dataDash = await dashApi.mutateAsync();
            if (isMounted && dataDash) {
                setWeight(dataDash.sensors.weight);
            }
        } catch (error) {
            // Optionally handle fetch errors, e.g., show temporary error state
             if (isMounted) console.error("Error fetching current weight:", error);
        } 
    };

    // Initial fetch
    fetchWeight();

    // Set up interval
    const interval = setInterval(fetchWeight, 2000); // Fetch every 2 seconds

    // Cleanup function
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []); // Removed isFetching from dependency array as it causes re-runs

  return <div>Current weight: {weight}g</div>;
};