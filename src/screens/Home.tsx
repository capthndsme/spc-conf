import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { useCallback, useEffect, useState } from "react";
import { useDashData } from "../api/dashData";
import { tareApi } from "../api/tareApi";
import { toast } from "sonner";
import { useGetSlots } from "../api/useGetSlots";
import { ReusableTable } from "../components/ui/table";
import { FiEdit } from "react-icons/fi";
import { useGetOrders } from "../api/useGetOrders";
import { useTestServo } from "../api/useTestServo";
import { getToken } from 'firebase/messaging'
import { messaging } from "../firebaseConfig";
import { useWaitRelock } from "../api/useWaitRelock";
import { useGetLog } from "../api/useGetLog";
import { useUpdateToken } from "../api/useUpdateToken";

const Home = () => {
  // 
  const dash = useDashData();
  const dashData = dash.data;

  const slots = useGetSlots();
  const logs = useGetLog();
  const orders = useGetOrders();

  // unlock
  const unlockApi = useWaitRelock()

  const [unlock, setUnlock] = useState(false)

  const unlockBtn = useCallback(async (id: number) => {
    setUnlock(true);
    try {
      toast.success("Unlocked for 120 seconds")
      await unlockApi.mutateAsync(id)

    } catch (e) {
      toast.error("Failed to unlock")
    } finally {
      setUnlock(false)
    }

  }, [])

  // refetcher

  useEffect(() => {
    const t = setInterval(() => {
      dash.refetch();
    }, 2000)
    return () => clearInterval(t);
  }, []);


  const [taring, setTaring] = useState(false);
  const tare = async () => {
    setTaring(true);
    try {
      await tareApi()
      toast.success("Tare success")
    } catch (e: any) {
      console.log(e)
      toast.error("Tare failed with: " + e?.message)
    } finally {
      setTaring(false)
    }

  }

  const api = useUpdateToken()
  const requestPermission = useCallback(async () => {
    //requesting permission using Notification API
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted" && messaging !== null) {
        const token = await getToken(messaging, {
          vapidKey: "BGYqD_q25VxSyQKFI5-BtO1ebYpGQAYBSGASIq_CeSIaF3GIc366NCQtx0ag9xu_4T_eLGRXbFXGcdJLDWMwcOg",
        });


        if (token) {
          api.mutate({ token: token })
        }
        
        console.log("Token generated : ", token);




      } else if (permission === "denied") {
        //notifications are blocked
        toast(<div>
          Notifications are blocked<br />
          Please allow notifications to continue
        </div>)
      }
    }
    catch (e: any) {
      toast(<div>
        Something went wrong while requesting permission<br />
        Please try again<br />
        {e?.message}
      </div>)
      console.error(e)
    }
  }, [])
  return <div className="max-w-5xl w-full mx-auto p-4 ">
    <Card>

      <CardHeader>
        <CardTitle>Welcome Home!</CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={requestPermission}>Request Notification Permission</Button><br />

        Project Safedrop
        is a Secure Parcel Storage Solution with Integrated Surveillance and Cash Payment Mechanism<br />
        asdasd
      </CardContent>
    </Card>
    {
      // Order history simple ui
    }
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Order List</CardTitle>
        <Link to="/orders/create" className="underline!">Create</Link>
      </CardHeader>
      <CardContent>
        <ReusableTable
          data={orders.data ?? []}
          columns={[
            {
              header: "Order ID",
              accessorKey: 'id'
            },
            {
              header: "Order Number",
              accessorKey: "orderId",
              nullFallback: "No order"
            },
            {
              header: "Item Description",
              accessorKey: "itemDescription",
              nullFallback: "No description"
            },
            {
              header: "Status",
              accessorKey: "state",
              nullFallback: "No status"
            },
            {
              header: "Rider Name",
              accessorKey: "riderName",
              nullFallback: "No rider"
            },
            {
              header: "Slot ID",
              accessorKey: "slotId",
              nullFallback: "No slot"
            },
            {
              header: "Before",
              accessorKey: "beforeWeight",
              nullFallback: "No weight"
            },
            {
              header: "After",
              accessorKey: "afterWeight",
              nullFallback: "No weight"
            },
            {
              header: "Item weight",
              cell: (row) => parseInt(row?.afterWeight??"0") - parseInt(row?.beforeWeight??"0"),
              // @ts-ignore non use
              accessorKey: "NO"
            
            },
            {
              header: "Actions",
              // @ts-ignore A fully cell only
              accessorKey: "ROW_EDIT",
              cell: (row) => <Link to={`/orders/${row.id}`}>
                <FiEdit />
              </Link>
            }
          ]}
        />

      </CardContent>
    </Card>
    {
      // Coin Slot list
    }
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Cash Slots</CardTitle>
        <Link to="/slots" className="underline!">View all</Link>
      </CardHeader>
      <CardContent>
        {
          // using Tanstack table, pipe to Tanstack... query
        }
        <ReusableTable
          data={slots.data ?? []}
          columns={[
            {
              header: "Slot ID",
              accessorKey: 'id'
            },
            {
              header: "Money Amount",
              accessorKey: "moneyAmount",
              columnSuffix: " PHP",
              nullFallback: "No money"
            },
            {
              header: "Active Order ID",
              accessorKey: "activeOrderId",
              cell: (row) => row?.activeOrderId
                ? <Link to={`/orders/${row.activeOrderId}`}>{row.activeOrderId}</Link>
                : "No order"
            },
            {
              header: "Actions",
              // @ts-ignore A fully cell only
              accessorKey: "ROW_EDIT",
              cell: (row) => <Link to={`/slots/${row.id}`}>
                <FiEdit />
              </Link>

            }
          ]}
        />

      </CardContent>
    </Card>

    {
      // log
    }
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>Logs</CardTitle>
      </CardHeader>
      <CardContent>
        <ReusableTable
          data={logs.data ?? []}
          columns={[
            {
              header: "Timestamp",
              accessorKey: 'createdAt',
              cell: (row) => new Date(row.createdAt).toLocaleString()
            },
            {
              header: "Message",
              accessorKey: "dataMsg",
              nullFallback: "No message"
            },
          ]}
        />

      </CardContent>
    </Card>
    

    {
      // settings
    }
    <Card className="mt-4 bg-fuchsia-950 border-fuchsia-900 text-fuchsia-300" >
      <CardHeader>
        <CardTitle>Settings</CardTitle>

      </CardHeader>
      <CardContent>
        <div>
          <h2 className="font-bold text-xl">Tare</h2>
          Whenever on startup, taring is a good idea.<br />
          Current weight: {typeof dashData?.sensors?.weight === "number"
            // convert gram to kg (2 decimal place)
            ? (dashData?.sensors?.weight / 1000).toFixed(2) + " kg"

            : "No Data"}<br />
          <Button onClick={() => tare()} disabled={taring}>Tare</Button>
        </div>
        <div>
          <h2 className="font-bold text-xl mt-4">System</h2>
          <p>Test Servos for 15 seconds</p>
          <TestServoButton id="1" />
          <TestServoButton id="2" />
          <TestServoButton id="3" />
          <TestServoButton id="4" />
          <h2 className="font-bold text-xl mt-4">Unlock</h2>
          <p>Unlocks device for 120 seconds, please relock after getting the packages.<br />
            <b>NOTE</b> Please make sure no one else is using the system.</p>
            <div className="flex flex-row justify-center">
                <Button onClick={() => unlockBtn(0)} className="w-[25%] mr-2" disabled={unlock}>Unlock 1</Button>
            <Button onClick={() => unlockBtn(1)} className="w-[25%] mr-2" disabled={unlock}>Unlock 2</Button>
            <Button onClick={() => unlockBtn(2)} className="w-[25%] mr-2" disabled={unlock}>Unlock 3</Button>
            <Button onClick={() => unlockBtn(3)} className="w-[25%]" disabled={unlock}>Unlock 4</Button>
            </div>

        </div>


      </CardContent>
    </Card>

  </div>;

}

/**
 * A simple button with loading overlay when 
 * in progress 
 */
const TestServoButton = ({ id }: { id: string }) => {
  const [loading, setLoading] = useState(false);
  const api = useTestServo()

  const testServo = async () => {
    setLoading(true);
    try {
      await api.mutateAsync(id);
      toast.success("Test servo success")
    } catch (e) {
      toast.error("Failed to test servo.")
    } finally {

      setLoading(false);
    }
  }
  return <Button onClick={testServo} disabled={loading} className="mx-2">
    {loading ? "Testing..." : "Test Servo " + id}
  </Button>

}
export default Home;