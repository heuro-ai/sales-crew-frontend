import React from "react";
import { Menu } from "antd";
import { Link } from "react-router-dom";
import { HomeOutlined, MailOutlined, BankOutlined } from "@ant-design/icons";

const Sidebar = () => {
  return (
    <Menu mode="vertical" style={{ width: 256, marginTop: 64 }}>
      <Menu.Item key="generate" icon={<BankOutlined />}>
        <Link to="/generate">Generate Campaign</Link>
      </Menu.Item>
      <Menu.Item key="mailstatus" icon={<MailOutlined />}>
        <Link to="/mailstatus">Mail Status</Link>
      </Menu.Item>
    </Menu>
  );
};

export default Sidebar;