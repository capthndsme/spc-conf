import { Link } from "react-router";

const NavBar = () => {

  return <div className="sticky top-0 left-0 w-full bg-gray-700 z-10  ">
    <div className="max-w-5xl w-full mx-auto p-4 flex items-center justify-between">
      <div>Project Safedrop</div>
      <div className="flex items-center space-x-4">
      <Link to="/" className="text-blue-300! hover:text-gray-300!">Home</Link>
      <Link to="/orders" className="text-blue-300! hover:text-gray-300!">Orders</Link>
      <Link to="/history" className="text-blue-300! hover:text-gray-300!">Settings</Link>

      </div>
    </div>
  </div>
}

export default NavBar;