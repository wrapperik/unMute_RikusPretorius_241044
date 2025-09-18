import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  return (
    <div className="navbar shadow-sm text-black bg-milk sticky top-0 z-50">
      <div className="flex-1">
        <a className="p-2 text-xl"><span className="font-bold">un</span><span>Mute</span></a>
      </div>
      {/* Mobile menu button */}
      <div className="flex-none lg:hidden">
        <div className="dropdown dropdown-end">
          <label tabIndex={0} className="btn btn-ghost btn-circle">
            <Menu className="w-6 h-6" />
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-milk rounded-box w-52">
            <li><a>Home</a></li>
            <li><a>Explore</a></li>
            <li><a>Resources</a></li>
            <li><a>About</a></li>
            <li>
              <details>
                <summary>Account</summary>
                <ul className="bg-milk rounded-t-none p-2 w-full">
                  <li><a>Link 1</a></li>
                  <li><a>Link 2</a></li>
                </ul>
              </details>
            </li>
          </ul>
        </div>
      </div>
      {/* Desktop menu */}
      <div className="flex-none hidden lg:block">
        <ul className="menu menu-horizontal px-1">
          <li><a>Home</a></li>
          <li><a>Explore</a></li>
          <li><a>Resources</a></li>
          <li><a>About</a></li>
          <li>
            <details>
              <summary>Account</summary>
              <ul className="bg-milk rounded-t-none p-2 w-full">
                <li><a>Link 1</a></li>
                <li><a>Link 2</a></li>
              </ul>
            </details>
          </li>
        </ul>
      </div>
    </div>
  );
}