import { useParams, useNavigate } from "react-router-dom"; // Import useNavigate
import { useGetSlots } from "../api/useGetSlots"; // Assuming this fetches all slots
// *** IMPORTANT: You'll need a hook/function to *update* a slot ***
// Let's assume you have something like this (replace with your actual implementation):
// import { useUpdateSlotMutation } from "../api/useUpdateSlot";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label"; // Assuming shadcn/ui
import { Input } from "../components/ui/input";   // Assuming shadcn/ui
import { Button } from "../components/ui/button"; // Assuming shadcn/ui
import React, { useState, useEffect } from "react"; // Import React hooks
import { toast } from "sonner";
import { useUpdateSlot } from "../api/useUpdateSlot";

const EditSlot = () => {
  const slotData = useGetSlots();
  const slotUpdate = useUpdateSlot()
  
  const { id } = useParams();
  const navigate = useNavigate(); // Hook for navigation

  // --- Assume you have a mutation hook like this ---
  // const { mutate: updateSlot, isLoading, isError, error } = useUpdateSlotMutation();
  // --- Mock mutation function for demonstration ---
  const [isLoading, setIsLoading] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const updateSlot = async (payload: { id: number; moneyAmount: number }) => {
    setIsLoading(true);
    setUpdateError(null);
 
    await slotUpdate.mutateAsync({
      id: payload.id,
      moneyAmount: payload.moneyAmount
    })
    setIsLoading(false);
    // In a real scenario, the mutation hook would handle success/error state
    // and potentially invalidate queries to refetch data.
    navigate(-1)
  };
 


  // Find the id in slot data
  const slot = slotData.data?.find(s => s.id === Number(id));

  // Set up local state for the editable field
  const [editedMoneyAmount, setEditedMoneyAmount] = useState<string>("");

  // Effect to initialize the local state when the slot data loads
  useEffect(() => {
    if (slot) {
      // Initialize the input field with the current money amount
      // Use string for input value compatibility
      setEditedMoneyAmount(String(slot.moneyAmount));
    }
  }, [slot]); // Re-run effect if the slot object changes

  // --- New Async Handler ---
  const handleUpdateSlot = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission which reloads the page
    setUpdateError(null); // Clear previous errors

    if (!slot) {
      console.error("Slot data not available for update.");
      toast.error("Slot not found")
      return;
    }

    const newMoneyAmount = Number(editedMoneyAmount); // Convert input string to number

    if (isNaN(newMoneyAmount) || newMoneyAmount < 0) {
      toast.error("Below zero")
      return;
    }

    try {
      console.log(`Attempting to update slot ${slot.id} with amount ${newMoneyAmount}`);

      // --- Call your actual update mutation/function here ---
      await updateSlot({ id: slot.id, moneyAmount: newMoneyAmount });
      // ----------------------------------------------------

      toast.success(`Slot ${slot.id} updated successfully`)

      // Optional: Refetch the data after update if your mutation hook doesn't handle it
      // slotData.refetch?.(); // Uncomment if useGetSlots provides a refetch method

      // Optional: Navigate back to a list page or dashboard
      // navigate('/admin/slots'); // Adjust the route as needed

    } catch (err: any) {
      console.error("Failed to update slot:", err);
      // Error state is handled by the mock/mutation hook in this example
      // You might want additional specific error handling here
      alert(`Error updating slot: ${updateError || err.message || 'Unknown error'}`);
    }
  };
  // --- End Async Handler ---


  if (slotData.isLoading) {
    return <div>Loading slot data...</div>; // Handle loading state
  }

  if (!slot) {
    // Handle case where slotData is loaded but the specific ID wasn't found
    return <div>Slot with ID {id} not found.</div>;
  }

  return (
    <div className="max-w-5xl w-full mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>
            Editing Slot ID {slot?.id}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-1">
            <p><span className="font-semibold">Slot ID:</span> {slot.id}</p>
            <p><span className="font-semibold">Current Money Amount:</span> {slot.moneyAmount} PHP</p>
            <p><span className="font-semibold">Active Order ID:</span> {slot.activeOrderId ?? "NONE"}</p>
          </div>

          <hr className="my-4" />

          {/* --- Edit Form --- */}
          <form onSubmit={handleUpdateSlot} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="moneyAmount">Adjust Money Amount (PHP)</Label>
              <div className="flex items-center gap-2 transition-all" style={{ pointerEvents: isLoading ? "none" : "auto", opacity: isLoading ? 0.6 : 1, filter: isLoading ? "blur(2px)" : "none" }}>
                
                <Button 

                  variant="outline"
 
                  onClick={(e) => {
                    e.preventDefault()
                    const current = Number(editedMoneyAmount);
                    if (!isNaN(current)) {
                      setEditedMoneyAmount(String(current - 100));
                    } else {
                      setEditedMoneyAmount("0");
                    }
                  }}
                  disabled={isLoading}
                  
                >
                  -100 PHP
                </Button>
                
                <Input
                  id="moneyAmount"
                  type="number"
                  value={editedMoneyAmount}
                  onChange={(e) => setEditedMoneyAmount(e.target.value)}
                  placeholder="Enter new amount"
                  min="0" // Prevent negative numbers in browser
                  step="any" // Allow decimals if needed, or "1" for integers
                  required // Make the field required
                  disabled={isLoading} // Disable input while loading
                />
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.preventDefault()
                    const current = Number(editedMoneyAmount);
                    if (!isNaN(current)) {
                      setEditedMoneyAmount(String(current + 100));
                    } else {
                      setEditedMoneyAmount("0");
                    }
                  }}
                  disabled={isLoading}
                  
                  
                >
                  +100 PHP
                </Button>
              </div>

            </div>

            {updateError && <p className="text-red-600 text-sm">Error: {updateError}</p>}

            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Save Changes"}
            </Button>
          </form>
          {/* --- End Edit Form --- */}

        </CardContent>
      </Card>
    </div>
  );
};

export default EditSlot;