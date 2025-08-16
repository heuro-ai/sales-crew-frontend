import React, { useState } from "react";
import { Form, Input, Button, Typography, Space, message } from "antd";
import { useNavigate } from "react-router-dom";
import { DeleteOutlined } from "@ant-design/icons";
import encrypt from "../utils/encryption";
import '../styles/Register.css'; // Import CSS file

export const Register = () => {
  const [confirmPassword, setConfirmPassword] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [companies, setCompanies] = useState([]);
  const [positions, setPositions] = useState({});
  const [newCompany, setNewCompany] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAddCompany = () => {
    if (newCompany && newPosition) {
      if (!companies.includes(newCompany)) {
        setCompanies([...companies, newCompany]);
        console.log("Companies: ", companies);
        console.log("Length of companies: ", companies.length);
      }
      const updatedPositions = { ...positions };
      if (!updatedPositions[newPosition]) {
        updatedPositions[newPosition] = [];
      }
      updatedPositions[newPosition].push(newCompany);
      setPositions(updatedPositions);
      setNewCompany("");
      setNewPosition("");
    } else {
      message.error("Please enter both company name and position");
    }
  };

  const handleRemoveCompany = (company) => {
    const updatedCompanies = companies.filter((c) => c !== company);
    const updatedPositions = { ...positions };
    Object.keys(updatedPositions).forEach((key) => {
      updatedPositions[key] = updatedPositions[key].filter((c) => c !== company);
      if (updatedPositions[key].length === 0) {
        delete updatedPositions[key];
      }
    });
    setCompanies(updatedCompanies);
    setPositions(updatedPositions);
  };

  const handleRemovePosition = (position, company) => {
    const updatedPositions = { ...positions };
    updatedPositions[position] = updatedPositions[position].filter((c) => c !== company);
    if (updatedPositions[position].length === 0) {
      delete updatedPositions[position];
    }
    setPositions(updatedPositions);
  }; 

  const handleRegister = async () => {
    if (!firstName.trim() || !lastName.trim() || !email.trim() || !password.trim() || !confirmPassword.trim() || companies.length === 0) {
      message.warning("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      message.warning("Passwords do not match"); 
      return;
    }

    setLoading(true);
    const newUser = {
      password: encrypt(password.trim()),
      email: email.trim().toLowerCase(),
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      company_name: companies,
      position: companies.reduce((acc, company) => {
        acc[company] = Object.keys(positions).filter(position => positions[position].includes(company));
        return acc;
      }, {})
    };

    const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/register/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newUser),
    });

    if (!response.ok) {
      message.error("Failed to register user");
      setLoading(false);
      return;
    }
    setLoading(false);
    message.success("OTP has been sent to your email. Please verify to login");
    navigate("/verify", { state: { email: email.trim().toLowerCase() } });
  };

  return (
    <Space direction="vertical" size="large" align="center" className="register-container">
      <Typography.Title level={2}>Register</Typography.Title>
      <Form onFinish={handleRegister} className="register-form">
        <Form.Item>
          <Input
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
          />
        </Form.Item>
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
          <Input.Password
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </Form.Item>
        <Form.Item>
          <Input
            placeholder="Company Name"
            value={newCompany}
            onChange={(e) => setNewCompany(e.target.value)}
            className="input-margin"
          />
          <Input
            placeholder="Position"
            value={newPosition}
            onChange={(e) => setNewPosition(e.target.value)}
            className="input-margin"
          />
          <Button type="primary" onClick={handleAddCompany}>
            Add Company and Position
          </Button>
          <div className="company-list">
            {companies.map((company, index) => (
              <div key={index} className="company-item">
                <strong>{company}</strong>
                <DeleteOutlined
                  className="delete-icon"
                  onClick={() => handleRemoveCompany(company)}
                />
                <div className="position-list">
                  {Object.keys(positions).map((position, posIndex) => (
                    positions[position].includes(company) && (
                      <div key={posIndex} className="position-item">
                        <span>{position}</span>
                        <DeleteOutlined
                          className="delete-icon"
                          onClick={() => handleRemovePosition(position, company)}
                        />
                      </div>
                    )
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block disabled={companies.length === 0} loading={loading}>
            Register
          </Button>
        </Form.Item>
      </Form>
    </Space>
  );
};
