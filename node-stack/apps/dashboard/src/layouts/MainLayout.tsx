import React from "react";
import { Outlet } from "react-router-dom";

import NavbarSidebarLayout from "./NavBarSideBarLayout";

import { UploadTray } from "@/features/storage";

const MainLayout: React.FC = () => {
  return (
    <>
      <NavbarSidebarLayout isFooter={false}>
        <Outlet />
      </NavbarSidebarLayout>
      <UploadTray />
    </>
  );
};

export default MainLayout;
