
import { useEffect, useState } from "react";
import { useDashContext } from "../components/DashWrap";
import { useNavigate, useParams } from "react-router-dom";
 
import { toast } from "sonner";

 
import { useCancelOrder } from "../api/useCancelOrder";
import { useGetAvailableSlots } from "../api/useGetAvailableSlots";

const SlotSelectPhase = () => {
  const ds = useDashContext();
  const { id: orderId } = useParams();
  const navigate = useNavigate();
  const slotData = useGetAvailableSlots();

  const cancelApi = useCancelOrder();
  
  const navigateToSlotApi = (sel: number) => {
    navigate(`/dashuix/parcel-entry/${orderId}?slotId=${sel - 1}`); // Example navigation
  };

  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);

  const slots = slotData.data || [];
  const selectedSlot = slots.find((s) => s.slotId === selectedSlotId);

  useEffect(() => {
    ds.setLeftSideElement(
      <div>
        <div className="text-3xl font-light">Select a Slot</div>
        <div>Order {orderId}</div>
        {selectedSlot ? (
          <div className="mt-4 text-lg">
            <h3 className="font-bold">Selected Slot:</h3>
            <p>Slot ID: {selectedSlot.slotId}</p>
            <p>
              Dimensions: {selectedSlot.length}cm x {selectedSlot.width}cm x{" "}
              {selectedSlot.height}cm
            </p>
          </div>
        ) : (
          <p className="mt-4">
            Please select an available slot for the parcel.
          </p>
        )}
        <br />
        <button
          onClick={() => {
            if (orderId) {
              cancelApi.mutate({ orderId: orderId });
              navigate(-1);
            }
          }}
          className="text-white mt-4"
        >
          Cancel
        </button>
      </div>
    );
  }, [ds, orderId, navigate, selectedSlot, cancelApi]);
  const handleSlotSelect = (slotId: number) => {
    setSelectedSlotId(slotId);
  };

  const handleConfirmSelection = () => {
    if (selectedSlotId !== null && orderId) {
      // Here you would typically make an API call to assign the slot to the order
      // For now, we'll just navigate
      toast.success(`Slot ${selectedSlotId} selected for order ${orderId}`);
      navigateToSlotApi(selectedSlotId);
    } else {
      toast.error("Please select a slot first.");
    }
  };

  if (slotData.isLoading) {
    return <div>Loading available slots...</div>;
  }

  if (slotData.isError) {
    return <div>Error loading slots: {slotData.error?.message}</div>;
  }

  return (
    <div>
      <h2 className="font-light text-xl mb-2">Available Slots</h2>
      {slots.length === 0 ? (
        <p>No available slots at the moment. Please try again later.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 text-white">
          {slots.map((slot) => (
            <button
              key={slot.slotId}
              className={`p-4 border rounded-lg text-center text-white  ${
                selectedSlotId === slot.slotId
                  ? "!bg-blue-500 text-white border-blue-600"
                  : slot.isOccupied
                  ? "bg-red-200 text-gray-500 border-red-300 cursor-not-allowed"
                  : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"
              }`}
              onClick={() => !slot.isOccupied && handleSlotSelect(slot.slotId)}
              disabled={slot.isOccupied}
            >
              <div className="font-bold text-lg">Slot {slot.slotId}</div>
              <div>{slot.isOccupied ? "Occupied" : "Available"}</div>
              <div className="text-sm">
                {slot.length}cm x {slot.width}cm x {slot.height}cm
              </div>
            </button>
          ))}
        </div>
      )}

      <button
        className="text-white w-full mt-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 py-2 rounded"
        onClick={handleConfirmSelection}
        disabled={selectedSlotId === null || slots.length === 0}
      >
        {selectedSlotId
          ? `Confirm Selection: Slot ${selectedSlotId}`
          : "Confirm Selection"}
      </button>
    </div>
  );
};

export default SlotSelectPhase;
export { SlotSelectPhase }