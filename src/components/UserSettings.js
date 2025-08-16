import React, { useEffect, useState, useContext } from "react";
import { Typography, Spin, Card, Button, Modal, Input, List, Popconfirm } from "antd";
import { DeleteOutlined, EditOutlined, CheckOutlined } from "@ant-design/icons";
import { AuthContext } from "../context/AuthContext";

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UserSettings = () => {
  const { userId } = useContext(AuthContext);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [positions, setPositions] = useState({});
  const [companies, setCompanies] = useState([]);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editingPosition, setEditingPosition] = useState({});
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUserDetails = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/user?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserDetails(data);
        setCompanies(data.company_name); // Assuming company_name is an array of strings
        setPositions(data.position); // Assuming position is an object with company names as keys and arrays of positions as values
      } else {
        console.error("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompany = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/add_company?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: newCompanyName,
          position: { ...positions, [newCompanyName]: positions[newCompanyName] ? [...positions[newCompanyName], newPosition] : [newPosition] },
        }),
      });
      if (response.ok) {
        fetchUserDetails(userId);
        setAddModalOpen(false);
        setNewCompanyName("");
        setNewPosition("");
      } else {
        console.error("Failed to add company");
      }
    } catch (error) {
      console.error("Error adding company", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveCompany = async (companyName) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/remove_company?user_id=${userId}&company_name=${companyName}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchUserDetails(userId);
      } else {
        console.error("Failed to remove company");
      }
    } catch (error) {
      console.error("Error removing company", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCompany = async (oldCompanyName, newCompanyName) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/edit_company?user_id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: oldCompanyName,
          new_company_name: newCompanyName,
          position: Object.keys(positions).reduce((acc, company) => {
            if (company === oldCompanyName) {
              acc[newCompanyName] = positions[company];
            } else {
              acc[company] = positions[company];
            }
            return acc;
          }, {}),
        }),
      });
      if (response.ok) {
        fetchUserDetails(userId);
        setEditingCompany(null);
      } else {
        console.error("Failed to edit company");
      }
    } catch (error) {
      console.error("Error editing company", error);
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditPosition = async (companyName, posIndex, newPosition) => {
    setActionLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/edit_positions?user_id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: companyName,
          position: positions[companyName].map((pos, i) => (i === posIndex ? newPosition : pos)),
        }),
      });
      if (response.ok) {
        fetchUserDetails(userId);
        setEditingPosition({});
      } else {
        console.error("Failed to edit position");
      }
    } catch (error) {
      console.error("Error editing position", error);
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDetails(userId);
  }, [userId]);

  if (loading) {
    return (
      <div style={{ width: '100%', marginTop: 40, textAlign: 'center' }}>
        <Spin size="large" />
        <Typography.Text style={{ display: 'block', marginTop: 16 }}>
          Loading User Details...
        </Typography.Text>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', marginTop: 40 }}>
      <Typography.Title level={3}>User Settings</Typography.Title>
      {userDetails && (
        <Card>
          <Typography.Text strong>First Name:</Typography.Text>
          <Typography.Paragraph>{userDetails.first_name}</Typography.Paragraph>
          <Typography.Text strong>Last Name:</Typography.Text>
          <Typography.Paragraph>{userDetails.last_name}</Typography.Paragraph>
          <Typography.Text strong>Email:</Typography.Text>
          <Typography.Paragraph>{userDetails.email}</Typography.Paragraph>
        </Card>
      )}
      <Card>
      <List
        dataSource={companies}
        renderItem={(company) => (
          <List.Item
            actions={[
              editingCompany === company ? (
                <Button type="link" icon={<CheckOutlined />} onClick={() => handleEditCompany(company, newCompanyName)} size="small" />
              ) : (
                <Button type="link" icon={<EditOutlined />} onClick={() => {
                  setEditingCompany(company);
                  setNewCompanyName(company);
                }} size="small" />
              ),
              <Popconfirm
                title="Are you sure you want to delete this company?"
                onConfirm={() => handleRemoveCompany(company)}
                okText="Yes"
                cancelText="No"
              >
                <Button type="link" icon={<DeleteOutlined />} size="small" />
              </Popconfirm>,
            ]}
            style={{ fontSize: "12px" }}
          >
            {editingCompany === company ? (
              <Input
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                style={{ marginRight: 8, fontSize: "12px" }}
              />
            ) : (
              company
            )}
          </List.Item>
        )}
      />
      {Object.keys(positions).map((companyName, index) => (
        <div key={index} style={{ marginBottom: 16 }}>
          <Typography.Text strong>{companyName}</Typography.Text>
          <List
            dataSource={positions[companyName]}
            renderItem={(position, posIndex) => (
              <List.Item
                actions={[
                  editingPosition.companyName === companyName && editingPosition.posIndex === posIndex ? (
                    <Button type="link" icon={<CheckOutlined />} onClick={() => handleEditPosition(companyName, posIndex, newPosition)} size="small" />
                  ) : (
                    <Button type="link" icon={<EditOutlined />} onClick={() => {
                      setEditingPosition({ companyName, posIndex });
                      setNewPosition(position);
                    }} size="small" />
                  ),
                  <Popconfirm
                    title="Are you sure you want to delete this position?"
                    onConfirm={() => handleEditPosition(companyName, posIndex, null)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="link" icon={<DeleteOutlined />} size="small" />
                  </Popconfirm>,
                ]}
                style={{ fontSize: "12px" }}
              >
                {editingPosition.companyName === companyName && editingPosition.posIndex === posIndex ? (
                  <Input
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    style={{ marginRight: 8, fontSize: "12px" }}
                  />
                ) : (
                  position
                )}
              </List.Item>
            )}
          />
        </div>
      ))}
        <Button type="primary" onClick={() => setAddModalOpen(true)} loading={actionLoading} size="small">
          Add Company
        </Button>
      </Card>
      <Modal
        title="Add New Company"
        visible={addModalOpen}
        onOk={handleAddCompany}
        onCancel={() => setAddModalOpen(false)}
        okText="Add"
        cancelText="Cancel"
        confirmLoading={actionLoading}
      >
        <Input
          placeholder="Company Name"
          value={newCompanyName}
          onChange={(e) => setNewCompanyName(e.target.value)}
          style={{ marginBottom: 16, fontSize: "12px" }}
        />
        <Input
          placeholder="Position"
          value={newPosition}
          onChange={(e) => setNewPosition(e.target.value)}
          style={{ marginBottom: 16, fontSize: "12px" }}
        />
      </Modal>
    </div>
  );
};

export default UserSettings;
