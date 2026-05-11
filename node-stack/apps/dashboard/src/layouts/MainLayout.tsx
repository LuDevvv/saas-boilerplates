import React from "react";
import { Outlet } from "react-router-dom";

import { UploadTray } from "@/features/storage";
import NavbarSidebarLayout from "./NavBarSideBarLayout";

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
