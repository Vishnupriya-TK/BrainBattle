import React from "react";
import { getUser } from "../api";

const UserHeader = ({ position = "top" }) => {
  const user = getUser();

  if (!user) return null;

  return (
    <div className={`bg-white p-4 rounded-xl shadow-lg ${position === "top" ? "mb-4" : ""}`}>
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Welcome, {user.name}!</h3>
          <p className="text-gray-600 text-sm">{user.email}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Role: <span className="font-semibold capitalize">{user.role}</span></div>
        </div>
      </div>
    </div>
  );
};

export default UserHeader;

