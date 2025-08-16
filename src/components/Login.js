import React, { useState, useContext, useEffect } from "react";
import { Form, Input, Button, Typography, Space, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import encrypt from "../utils/encryption";
import axios from "axios";
import '../styles/Login.css'; // Import CSS file

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  useEffect(() => {
    const checkIfLoggedIn = () => {
      const token = localStorage.getItem("user_token");
      if (token) {
        navigate("/generate");
      }
    };
    checkIfLoggedIn();
  }, [navigate]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      message.warning("All fields are required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/login/`, {
        email: email.trim().toLowerCase(),
        password: encrypt(password.trim())
      });
      const { access_token } = response.data;
      login(access_token);
      message.success("Welcome back!");
      const redirectPath = localStorage.getItem("redirectPath") || "/generate";
      localStorage.removeItem("redirectPath");
      navigate(redirectPath);
    } catch (error) {
      alert("Invalid credentials");
    }
    setLoading(false);
  };

  return (
    <Space direction="vertical" size="large" align="center" className="login-container">
      <Typography.Title level={2}>Login</Typography.Title>
      <Form onFinish={handleLogin} className="login-form">
        <Form.Item>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input.Password
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Login
          </Button>
        </Form.Item>
      </Form>
      <Typography.Text>
        Don't have an account? <Link to="/register">Register</Link>
      </Typography.Text>
    </Space>
  );
};