import React, { useState, useEffect } from "react";
import { Form, Input, Button, Typography, Space, message } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import '../styles/Verify.css'; // Import CSS file

export const Verify = () => {
  const location = useLocation();
  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setEmail(initialEmail);
  }, [initialEmail]);

  const handleVerify = async () => {
    if (!email.trim() || !otp.trim()) {
      message.warning("All fields are required");
      return;
    }

    setLoading(true);
    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/verify_otp/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), otp: parseInt(otp.trim()) }),
    });
    setLoading(false);

    if (!response.ok) {
      message.error("Failed to verify");
      return;
    }

    message.success("Verification successful");
    alert("OTP verified successfully");
    navigate("/generate");
  };

  return (
    <Space direction="vertical" size="large" align="center" className="verify-container">
      <Typography.Title level={2}>Verify</Typography.Title>
      <Form onFinish={handleVerify} className="verify-form">
        <Form.Item>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Verify
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
};
