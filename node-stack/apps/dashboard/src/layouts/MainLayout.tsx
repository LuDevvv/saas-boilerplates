import React from "react";
import { Outlet } from "react-router-dom";
import NavbarSidebarLayout from "./NavBarSideBarLayout.js";

const MainLayout: React.FC = () => {
  return (
    <NavbarSidebarLayout isFooter={false}>
      <Outlet />
    </NavbarSidebarLayout>
  );
};

export default MainLayout;
