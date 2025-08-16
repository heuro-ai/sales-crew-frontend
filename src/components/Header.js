import React, { useContext, useEffect, useState } from "react";
import { Layout, Typography, Space, Button } from "antd";
import { AppstoreOutlined, TeamOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import lightLogo from '../assets/light-logo.png';
import darkLogo from '../assets/dark-logo.png';
import '../styles/Header.css'; // Import CSS file

const { Header } = Layout;

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AppHeader = ({ children }) => {
  const { userId } = useContext(AuthContext);
  const [productLimit, setProductLimit] = useState(0);
  const [companyLimit, setCompanyLimit] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();

  const fetchUserDetails = async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProductLimit(data.product_limit);
        setCompanyLimit(data.company_limit);
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserDetails(userId);
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [userId]);

  const handleSubscribeClick = () => {
    navigate("/subscribe");
  };

  const handleLogoClick = () => {
    navigate("/");
  };

  return (
    <Header className={`app-header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="logo-container" onClick={handleLogoClick}>
        <img
          src={isScrolled ? darkLogo : lightLogo}
          alt="Logo"
          className="logo"
        />
        <div className="logo-text">
          <Typography.Text className="title">
            Sales Crew
          </Typography.Text>
          <Typography.Text className="subtitle">
            A Heuro Product
          </Typography.Text>
        </div>
      </div>
      <Space size="middle" className="header-space">
        <Space>
          <AppstoreOutlined className="icon" />
          <Typography.Text className="text">{productLimit}</Typography.Text>
        </Space>
        <Space>
          <TeamOutlined className="icon" />
          <Typography.Text className="text">{companyLimit}</Typography.Text>
        </Space>
        <Button type="primary" onClick={handleSubscribeClick} disabled={true} className="subscribe-button">Subscribe</Button>
        {children}
      </Space>
    </Header>
  );
};

export default AppHeader;