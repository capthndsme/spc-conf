import { useEffect, useState } from "react";
import { useDashContext } from "../components/DashWrap";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";

import { useOrderExists } from "../api/useOrderExists";
import { toast } from "sonner";
import { useNavigate } from "react-router";


const MainScreen = () => {

  const ds = useDashContext()
  const [orderId, setOrderId] = useState("");
  const trigger = useOrderExists();
  const navigate = useNavigate()

  const check = async () => {

    console.log("check order", orderId)
    // blur any current focus

    if (orderId === "") {
      toast.error("Enter an order ID.")
      return;
    }

    try {
      const res = await trigger.mutateAsync(orderId)
      if (res) {
        console.log("found")
        const isWaiting = res.state === "PENDING"
        if (!isWaiting) {
          toast.error("this parcel is pending...")
          return;
        }
        toast.success(`Found order ${orderId}`)
        navigate(`/DashUIx/o/${orderId}`)
      } else {
        toast("Invalid Order ID")
      }
    } catch (e) {
      toast("Invalid Order ID")
    }
  }
  // Get props from the hook to connect the input to the keyboard system

  useEffect(() => {
    ds.setLeftSideElement(<div>
      <div className="text-3xl font-light">Project SafeDrop</div>
      Please enter the parcel’s Order ID and press continue to enter.<br />
      Color: <MainScreenSelectColor />
    </div>)
  }, [])
  return <div>

    <h2 className="font-light text-xl">Enter Order ID</h2>
    { /** @ts-ignore */}
    <input type="text" placeholder="Order ID" className="w-full border border-black rounded-sm p-2"
      onChange={e => setOrderId(e.target.value)}
      value={orderId}
      onKeyDown={e => {
        if (e.key === "Enter") {
          check();
        }
      }}

    />
    <button className="text-white w-full mt-2" onClick={() => check()}>Verify </button>
  </div>
}


const MainScreenSelectColor = () => {
  const ctx = useDashContext()
  return <Select onValueChange={(v) => ctx.setTailwindColor(v as any)}
    defaultValue={ctx.tailwindColor}

  >
    <SelectTrigger className="w-[180px] text-white">
      <SelectValue placeholder="Select a color" />
    </SelectTrigger>
    <SelectContent className="text-white">
      <SelectItem value="red">Red</SelectItem>
      <SelectItem value="orange">Orange</SelectItem>
      <SelectItem value="amber">Amber</SelectItem>
      <SelectItem value="yellow">Yellow</SelectItem>
      <SelectItem value="lime">Lime</SelectItem>
      <SelectItem value="green">Green</SelectItem>
      <SelectItem value="emerald">Emerald</SelectItem>
      <SelectItem value="teal">Teal</SelectItem>
      <SelectItem value="cyan">Cyan</SelectItem>
      <SelectItem value="sky">Sky</SelectItem>
      <SelectItem value="blue">Blue</SelectItem>
      <SelectItem value="indigo">Indigo</SelectItem>
      <SelectItem value="violet">Violet</SelectItem>
      <SelectItem value="purple">Purple</SelectItem>
      <SelectItem value="fuchsia">Fuchsia</SelectItem>
      <SelectItem value="pink">Pink</SelectItem>
      <SelectItem value="rose">Rose</SelectItem>
      <SelectItem value="slate">Slate</SelectItem>
      <SelectItem value="gray">Gray</SelectItem>
      <SelectItem value="zinc">Zinc</SelectItem>
      <SelectItem value="neutral">Neutral</SelectItem>
      <SelectItem value="stone">Stone</SelectItem>
    </SelectContent>
  </Select>

}
export default MainScreen;