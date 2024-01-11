import React, { useState } from "react";
import { Drawer } from "antd";
import GlobalStore from "../lib/store";

const DrawerToggle = () => {
  const isLeftDrawerVisible = GlobalStore.useState(
    (s) => s.isLeftDrawerVisible
  );
  const drawerClosed = isLeftDrawerVisible ? "-close" : "";

  return (
    <div
      className={`arf-submissions-drawer-toggle${drawerClosed}`}
      onClick={() =>
        GlobalStore.update((s) => {
          s.isLeftDrawerVisible = !isLeftDrawerVisible;
        })
      }
    />
  );
};

const LeftDrawer = ({ title, content }) => {
  const isLeftDrawerVisible = GlobalStore.useState(
    (s) => s.isLeftDrawerVisible
  );
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  // check screen size or mobile browser
  window.addEventListener("resize", () => {
    setWindowWidth(window.innerWidth);
  });

  return (
    <div>
      <DrawerToggle />
      <Drawer
        className="arf-submissions-drawer-container"
        bodyStyle={{ padding: "0px", borderTop: "1px solid #d0d0d0" }}
        title={title || "Submissions"}
        placement="left"
        width={windowWidth > 700 ? "450" : "75%"}
        open={isLeftDrawerVisible}
        zIndex="1002"
        onClose={() =>
          GlobalStore.update((s) => {
            s.isLeftDrawerVisible = false;
          })
        }
        destroyOnClose
      >
        <DrawerToggle />
        {content}
      </Drawer>
    </div>
  );
};

export default LeftDrawer;
