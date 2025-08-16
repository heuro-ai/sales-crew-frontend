import React, { useContext } from "react";
import { Link, Navigate, useLocation } from "react-router-dom"; // Add useLocation import
import { Menu, Dropdown, Button } from "antd";
import { UserOutlined, LoginOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext"; // Import AuthContext

export const AuthConsumer = () => {
  const { isAuthenticated, logout } = useContext(AuthContext); // Use AuthContext

  const menu = (
    <Menu>
      {isAuthenticated && (
        <>
          <Menu.Item key="generate">
            <Link to="/generate">Campaign</Link>
          </Menu.Item>
          <Menu.Item key="mailstatus">
            <Link to="/mailstatus">Mails</Link>
          </Menu.Item>
          <Menu.Item key="profile">
            <Link to="/profile">Profile</Link>
          </Menu.Item>
          <Menu.Item key="logout" onClick={logout}>
            Logout
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return isAuthenticated ? (
    <Dropdown overlay={menu} trigger={['click']}>
      <Button icon={<UserOutlined />} />
    </Dropdown>
  ) : (
    <Link to="/login">
      <Button icon={<LoginOutlined />}>Login</Button>
    </Link>
  );
};

export const ProtectedRoute = ({ component: Component }) => {
  const { isAuthenticated } = useContext(AuthContext); // Use AuthContext
  const location = useLocation(); // Get the current location

  if (!isAuthenticated) {
    localStorage.setItem("redirectPath", location.pathname); // Store the current path in local storage
    return <Navigate to="/login" />;
  }

  return <Component />;
};
