// src/components/UpsertOrder.tsx

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom'; // Added useNavigate for redirection
import { useGetOrder } from '../api/useGetOrder';
import { useUpsertOrder } from '../api/useUpsertOrder';
import Order from '../types/Order'; // Make sure path is correct
import { Label } from '@radix-ui/react-label';
import * as sonner from 'sonner';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { useGetSlots } from '../api/useGetSlots';

/**
 * Toast compat
 */

const toast = ({ title, description, variant = "default" }: { title: string, description: string, variant?: string }) => {
  sonner.toast(title, {
    description,

  })
  console.log('unk var', variant)
}

// Definethe possible states based on your Order type
const orderStates: Order['state'][] = [
  'PENDING',
  'OTP_WAITING',
  'DELIVERED',
  'FINISHED',
  'DELETED', // Include all valid states
];

// Define the possible types based on your Order type
const orderTypes: Order['type'][] = ['COD', 'PAID'];


const UpsertOrder = () => {
  const { id } = useParams<{ id?: string }>(); // id might be undefined for create
  const navigate = useNavigate(); // Hook for programmatic navigation
  const availableSlots = useGetSlots();
  // --- Data Fetching ---
  // Fetch order data only if an ID exists (for update)
  const getOrderQuery = useGetOrder(id ?? '', {
    enabled: !!id, // Only run query if id is truthy
  });

  // --- Data Mutation ---
  const upsertMutation = useUpsertOrder();

  // --- Form State ---
  // Initialize with default structure, potentially Partial<Order>
  const [formData, setFormData] = useState<Partial<Order>>({
    // Set default values if needed for 'create' mode
    orderId: '',
    otpRider: '',
    riderName: '',
    itemDescription: '',
    state: 'PENDING', // Default state for new orders
    type: 'COD',      // Default type for new orders,
    slotId: undefined
    
    // Add other fields with defaults or leave them undefined
  });

  // --- Effect to Populate Form on Edit ---
  useEffect(() => {
    // If we have an ID and data has been fetched successfully, populate the form
    if (id && getOrderQuery.data) {
      // Ensure fetched data conforms to Partial<Order> before setting
      const fetchedOrderData: Partial<Order> = {
        ...getOrderQuery.data,
        // Convert potential null/undefined values if necessary for form inputs
        riderNumber: getOrderQuery.data.riderNumber ?? '',
        courier: getOrderQuery.data.courier ?? '',
        orderPlaced: getOrderQuery.data.orderPlaced ?? '', // Handle potential date formatting if needed
        orderReceived: getOrderQuery.data.orderReceived ?? '',
        orderGetOut: getOrderQuery.data.orderGetOut ?? '',
        beforeWeight: getOrderQuery.data.beforeWeight ?? undefined, // Keep number|undefined
        afterWeight: getOrderQuery.data.afterWeight ?? undefined,
        moneyContent: getOrderQuery.data.moneyContent ?? undefined,
        slotId: getOrderQuery.data.slotId ?? undefined,
    
      };
      setFormData(fetchedOrderData);
    }
    // If no id, ensure form starts fresh or with defaults (handled by initial state)
  }, [id, getOrderQuery.data]); // Rerun effect if id or fetched data changes

  // --- Handlers ---
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      // Handle number inputs specifically if needed
      [name]: type === 'number' ? (value === '' ? undefined : Number(value)) : value,
    }));
  };

  const handleSelectChange = (name: keyof Order, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Prepare data for submission
    const submissionData: Partial<Order> = {
      ...formData,
      // Explicitly include the id if we are updating
      ...(id && { id: parseInt(id, 10) }), // Make sure id is number if backend expects it
    };

    // Add type assertion if necessary, depending on how useUpsertOrder expects the type
    upsertMutation.mutate(submissionData as Order, { // Assert if mutation expects full Order
      onSuccess: (savedOrder) => {
        console.log('Order saved successfully:', savedOrder);
        // Optional: Show success notification
        toast({ title: "Success", description: `Order ${id ? 'updated' : 'created'} successfully.` });
        // Navigate back to orders list or view page
        navigate('/'); // Adjust the target route as needed
      },
      onError: (error) => {
        console.error('Failed to save order:', error);
        // Optional: Show error notification
        toast({ title: "Error", description: `Failed to ${id ? 'update' : 'create'} order. ${error.message || ''}`, variant: "destructive" });
      },
    });
  };

  // --- Render Logic ---
  if (id && getOrderQuery.isLoading) {
    return <div>Loading order details...</div>; // Or use a Shadcn Skeleton loader
  }

  if (id && getOrderQuery.isError) {
    return <div>Error loading order data: {getOrderQuery.error.message}</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 bg-card mt-4 rounded-lg shadow-lg">
      <div className="text-2xl font-bold mb-6">
        {id ? 'Edit Order' : 'Create New Order'}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Example Field: Order ID (from E-commerce) */}
        <div>
          <Label htmlFor="orderId">E-commerce Order ID</Label>
          <Input
            id="orderId"
            name="orderId"
            value={formData.orderId ?? ''}
            onChange={handleInputChange}
            required
            placeholder="e.g., ECOM-12345"
          />
        </div>

        {/* Example Field: Item Description */}
        <div>
          <Label htmlFor="itemDescription">Item Description</Label>
          <Input
            id="itemDescription"
            name="itemDescription"
            value={formData.itemDescription ?? ''}
            onChange={handleInputChange}
            required
            placeholder="Describe the item(s)"
          />
        </div>

        {/* Example Field: Rider Name */}
        <div>
          <Label htmlFor="riderName">Rider Name</Label>
          <Input
            id="riderName"
            name="riderName"
            value={formData.riderName ?? ''}
            onChange={handleInputChange}
            placeholder="Rider's full name"
          />
        </div>
        {
          // Rider Phone number
          // used for OTP
        }
        <div>
          <Label htmlFor="riderNumber">Rider Phone Number</Label>
          <Input
            id="riderNumber"
            name="riderNumber"
            value={formData.riderNumber ?? ''}
            onChange={handleInputChange}
            placeholder="+639000000000"
          />
        </div>
 
        {/* Example Field: Courier */}
        <div>
          <Label htmlFor="courier">Courier</Label>
          <Input
            id="courier"
            name="courier"
            value={formData.courier ?? ''}
            onChange={handleInputChange}
            placeholder="e.g., J&T Express"
          />
        </div>
        

        {/* --- State Dropdown Example --- */}
        <div>
          <Label htmlFor="state">Order State</Label>
          <Select
            name="state" // Optional: Useful if you adapt handleChange
            value={formData.state ?? ''}
            onValueChange={(value) => handleSelectChange('state', value as Order['state'])} // Pass field name and value
          >
            <SelectTrigger id="state">
              <SelectValue placeholder="Select state..." />
            </SelectTrigger>
            <SelectContent>
              {orderStates.map((stateValue) => (
                <SelectItem key={stateValue} value={stateValue}>
                  {/* You might want nicer display names */}
                  {stateValue.replace('_', ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* --- End State Dropdown Example --- */}

        {/* Example Field: Order Type (Dropdown) */}
        <div>
          <Label htmlFor="type">Order Type</Label>
          <Select
            name="type"
            value={formData.type ?? ''}
            onValueChange={(value) => handleSelectChange('type', value as Order['type'])}
          >
            <SelectTrigger id="type">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              {orderTypes.map((typeValue) => (
                <SelectItem key={typeValue} value={typeValue}>
                  {typeValue}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {
          // DropDown of Slots
        }
        {
          formData?.type === "COD" && <>

            <Label htmlFor="slotId">Slot (COD)</Label>
            <Select
              name="slotId"
              value={formData.slotId?.toString() ?? ''}
              onValueChange={(value) => handleSelectChange('slotId', value)}
            >
              <SelectTrigger id="slotId">
                <SelectValue placeholder="Select slot..." />
              </SelectTrigger>
              <SelectContent>
                {
                  // the current slot selected
                }
                {
                  !!formData.slotId && <SelectItem value={formData.slotId.toString()} disabled>
                    {formData.slotId} (Selected)
                  </SelectItem>
                }
                
                {availableSlots.data?.filter(s => s.activeOrderId === null || s.activeOrderId === undefined)?.map((slot) => (
                  <SelectItem key={slot.id} value={slot.id.toString()}>
                    {slot.id}
                  </SelectItem>
                )) ?? <SelectItem value="none">No slots</SelectItem>}
              </SelectContent>
            </Select>

          </>
        }

        {/* Add other form fields here following the pattern: */}
        {/* Label, Input/Select, value, onChange/onValueChange */}
        {/* Example: otpRider, riderNumber, courier, dates, weights, moneyContent */}

        {/* Example: Money Content (Number) */}
        <div>
          <Label htmlFor="moneyContent">Money Content (Optional)</Label>
          <Input
            id="moneyContent"
            name="moneyContent"
            type="number" // Use type="number"
            value={formData.moneyContent ?? ''} // Handle potential undefined
            onChange={handleInputChange}
            placeholder="e.g., 1500.00"
            step="0.01" // Optional: for decimal steps
          />
        </div>


        {/* --- Submission Button --- */}
        <Button type="submit" disabled={upsertMutation.isPending}>
          {upsertMutation.isPending
            ? 'Saving...'
            : id
              ? 'Update Order'
              : 'Create Order'}
        </Button>
        {upsertMutation.isError && (
          <p className="text-red-500 text-sm mt-2">
            Error: {upsertMutation.error.message}
          </p>
        )}
      </form>
    </div>
  );
};

export default UpsertOrder;

// --- Update useGetOrder hook to accept options (like 'enabled') ---
