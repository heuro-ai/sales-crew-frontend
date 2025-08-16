import React from "react";
import { Layout, Typography } from "antd";
import { Link } from "react-router-dom"; // Add this import

const { Footer: AntFooter } = Layout;

export const Footer = () => {
  return (
    <AntFooter className="footer-box" style={{ textAlign: 'center' }}>
      <Typography.Text type="secondary">
        &copy; {new Date().getFullYear()} Sales AI Agent CRM. All rights reserved.
      </Typography.Text>
      <br />
      <Link to="/privacy-policy">Privacy Policy</Link> {/* Add this link */}
    </AntFooter>
  );
};