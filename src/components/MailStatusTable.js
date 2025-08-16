import React, { useEffect, useState, useContext, useCallback } from "react";
import {
  Table,
  Button,
  Typography,
  Spin,
  message,
  Modal,
  Input,
  InputNumber,
  Select,
} from "antd";
import { EditOutlined, CheckOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import encrypt from "../utils/encryption";
import ReactQuill from 'react-quill'; // Add this import
import 'react-quill/dist/quill.snow.css'; // Add this import for styles
import { AuthContext } from "../context/AuthContext"; // Import AuthContext
import '../styles/MailStatusTable.css'; // Import the new CSS file

// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const MailStatusTable = () => {
  const [mailStatus, setMailStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reminderLoading, setReminderLoading] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editRecord, setEditRecord] = useState(null);
  const [products, setProducts] = useState([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [senderName, setSenderName] = useState("");
  const [senderPosition, setSenderPosition] = useState("");
  const [senderCompany, setSenderCompany] = useState("");
  const [senderModalOpen, setSenderModalOpen] = useState(false);
  const [thresholdEditOpen, setThresholdEditOpen] = useState(false);
  const [thresholdValue, setThresholdValue] = useState(0);
  const [loadingButtons, setLoadingButtons] = useState({}); // Add this state
  const [companiesList, setCompaniesList] = useState([]); // Add this state
  const [positionsList, setPositionsList] = useState([]); // Add this state
  const [positionsDict, setPositionsDict] = useState({}); // Add this state
  const [newCompanyName, setNewCompanyName] = useState(""); // Add this state
  const [newPosition, setNewPosition] = useState(""); // Add this state
  const { userId } = useContext(AuthContext); // Add this line
  const [tableLoading, setTableLoading] = useState(true); // Add this state

  const [messageApi, contextHolder] = message.useMessage();
  const success = (content) => {
    messageApi.open({
      type: 'success',
      content: content,
    });
  };
  const errorMsg = (content) => {
    messageApi.open({
      type: 'error',
      content: content,
    });
  };

  const fetchMailStatus = useCallback(async () => {
    setTableLoading(true); // Set table loading state
    try {
      const response = await fetch(`${API_BASE_URL}/fetch-mail-status?user_id=${userId}`);
      const data = await response.json();
      setMailStatus(data);
    } catch (err) {
      errorMsg("Failed to fetch mail status. Please try again later.");
    } finally {
      setLoading(false);
      setTableLoading(false); // Reset table loading state
    }
  }, [userId, errorMsg]);

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_products?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        errorMsg("Failed to fetch products");
      }
    } catch (error) {
      console.error("Error fetching products", error);
    }
  }, [userId, errorMsg]);

  const fetchUserDetails = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSenderName(`${data.first_name} ${data.last_name}`);
        setCompaniesList(data.company_name);
        setPositionsList(data.position[data.company_name[0]]);
        setSenderCompany(data.company_name[0]);
        setPositionsDict(data.position);
        setSenderPosition(data.position[data.company_name[0]][0]);
      } else {
        errorMsg("Failed to fetch user details");
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  }, [userId, errorMsg]);

  useEffect(() => {
    fetchProducts();
    fetchMailStatus();
    fetchUserDetails(userId); // Replace "user_id" with the actual user ID
  }, [fetchMailStatus, fetchProducts, fetchUserDetails, userId]);

  const handleDailyCheckup = async () => {
    setLoading(true); // Enable loading state
    setTableLoading(true); // Set table loading state
    try {
      for (const email of mailStatus) {
        await fetch(`${API_BASE_URL}/email-status-check?tracking_id=${email.id}&user_id=${userId}`);
      }
      fetchMailStatus();
      success("Daily checkup completed successfully.");
    } catch (err) {
      errorMsg("Failed to perform daily checkup. Please try again later.");
    } finally {
      setLoading(false); // Disable loading state
      setTableLoading(false); // Reset table loading state
    }
  };

  const handleDraftReminder = async (record) => {
    setLoadingButtons((prev) => ({ ...prev, [record.id]: true })); // Set loading state for the clicked button
    setReminderLoading(true); // Enable loading state
    setEditRecord(record);
    setSenderModalOpen(true);
  };

  const handleDraftMail = async () => {
    setReminderLoading(true); // Enable loading state
    try {
      const response = await fetch(`${API_BASE_URL}/email-reminder?tracking_id=${editRecord.id}&user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: 'followup',
          sender_name: senderName,
          sender_position: senderPosition,
          sender_company: senderCompany
        }),
      });

      if (!response.ok) {
        errorMsg("Failed to draft reminder. Try again.");
        setReminderLoading(false); // Disable loading state
        return;
      }

      const responseData = await response.json();
      setEditSubject(responseData.subject);
      setEditBody(responseData.body);
      setEditDialogOpen(true);
      success("Reminder drafted successfully. Please review and send.");

      // Update the record to show the edit button
      const updatedMailStatus = mailStatus.map((item) =>
        item.id === editRecord.id ? { ...item, status: "Drafted Reminder" } : item
      );
      setMailStatus(updatedMailStatus);
      setSenderModalOpen(false);
    } catch (err) {
      errorMsg("Failed to draft reminder. Please try again later.");
    } finally {
      setReminderLoading(false); // Disable loading state
      setLoadingButtons({}); // Enable all buttons
    }
  };

  const handleSendReminder = async (record) => {
    setLoadingButtons((prev) => ({ ...prev, [record.id]: true })); // Set loading state for the clicked button
    setReminderLoading(true); // Enable loading state
    setEditRecord(record);
    setEmailModalOpen(true);
  };

  const handleSendMail = async () => {
    setReminderLoading(true); // Enable loading state
    try {
      const encryptedPassword = encrypt(password); // Encrypt the password
      const response = await fetch(`${API_BASE_URL}/send_followup_email?user_id=${userId}&user_email=${email}&encrypted_password=${encryptedPassword}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_uid: editRecord.id,
          recipient_name: editRecord.dm_name,
          company_name: editRecord.company_name,
          dm_position: editRecord.dm_position,
          recipient: editRecord.email_id,
          subject: editRecord.email_subject,
          body: editRecord.email_body.replace(/\n/g, "<br/>"),
        }),
      });

      if (!response.ok) {
        errorMsg("Failed to send reminder. Try again.");
        setReminderLoading(false); // Disable loading state
        return;
      }

      // Update the record to show the sent status
      const updatedMailStatus = mailStatus.map((item) =>
        item.id === editRecord.id ? { ...item, status: "Reminder Sent" } : item
      );
      setMailStatus(updatedMailStatus);
      success("Reminder sent successfully.");
      setEmailModalOpen(false);
      setEmail("");
      setPassword("");
    } catch (err) {
      errorMsg("Failed to send reminder. Please try again later.");
    } finally {
      setReminderLoading(false); // Disable loading state
    }
  };

  const handleEditClick = (record) => {
    setEditRecord(record);
    setEditSubject(record.email_subject);
    setEditBody(record.email_body.replace(/<br\/>/g, "\n"));
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    const updatedMailStatus = mailStatus.map((item) =>
      item.id === editRecord.id
        ? { ...item, email_subject: editSubject, email_body: editBody, status: "Drafted Reminder" }
        : item
    );
    setMailStatus(updatedMailStatus);
    setEditDialogOpen(false);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditRecord(null);
    setEditSubject("");
    setEditBody("");
  };

  const handleThresholdEdit = (record) => {
    setEditRecord(record);
    setThresholdValue(record.followup_threshold);
    setThresholdEditOpen(true);
  };

  const handleThresholdSave = async () => {
    try {
      const followup_id = mailStatus.find((item) => item.id === editRecord.id).followup_id;
      const response = await fetch(`${API_BASE_URL}/update-followup?followup_id=${followup_id}&followup_field=followup_threshold&field_value=${thresholdValue}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        errorMsg("Failed to update followup threshold. Try again.");
        return;
      }

      const updatedMailStatus = mailStatus.map((item) =>
        item.id === editRecord.id
          ? { ...item, followup_threshold: thresholdValue }
          : item
      );
      setMailStatus(updatedMailStatus);
      success("Followup threshold updated successfully.");
      setThresholdEditOpen(false);
    } catch (err) {
      errorMsg("Failed to update followup threshold. Please try again later.");
    }
  };

  const handleAddCompany = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/add_company?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: newCompanyName,
          position: { ...positionsDict, [newCompanyName]: positionsDict[newCompanyName] ? [...positionsDict[newCompanyName], newPosition] : [newPosition] },
        }),
      });
      if (response.ok) {
        success("Company and positions added successfully");
        fetchUserDetails(userId); // Refresh the user details
        setNewCompanyName("");
        setNewPosition("");
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        errorMsg("Failed to add company and positions");
      }
    } catch (error) {
      console.error("Error adding company and positions", error);
    }
  };

  const handleRemoveCompany = async (companyName) => {
    try {
      const response = await fetch(`${API_BASE_URL}/remove_company?user_id=${userId}&company_name=${companyName}`, {
        method: "DELETE",
      });
      if (response.ok) {
        success("Company removed successfully");
        fetchUserDetails(userId); // Refresh the user details
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        errorMsg("Failed to remove company");
      }
    } catch (error) {
      console.error("Error removing company", error);
    }
  };

  const handleRemovePosition = async (position) => {
    try {
      const response = await fetch(`${API_BASE_URL}/edit_positions?user_id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: senderCompany,
          position: positionsList.filter(pos => pos !== position),
        }),
      });
      if (response.ok) {
        success("Position removed successfully");
        fetchUserDetails(userId); // Refresh the user details
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        errorMsg("Failed to remove position");
      }
    } catch (error) {
      console.error("Error removing position", error);
    }
  };

  const handleCompanyChange = (value) => {
    setSenderCompany(value);
    setPositionsList(positionsDict[value] || []); // Update positions based on the selected company
    setSenderPosition(positionsDict[value][0]); // Set the first position as default
  };

  const handleSenderModalCancel = () => {
    setSenderModalOpen(false);
    setLoadingButtons({}); // Reset all buttons to normal state
  };

  const productFilters = products.map(product => ({
    text: product.product_name,
    value: product.product_id, // Use product_id for filtering
  }));

  const columns = [
    { title: "S. No.", dataIndex: "index", key: "index", render: (text, record, index) => <span className="table-cell">{index + 1}</span> },
    { title: "Decision Maker Name", dataIndex: "dm_name", key: "dm_name", sorter: (a, b) => a.dm_name.localeCompare(b.dm_name), render: text => <span className="table-cell">{text}</span> },
    { title: "Company Name", dataIndex: "company_name", key: "company_name", sorter: (a, b) => a.company_name.localeCompare(b.company_name), render: text => <span className="table-cell">{text}</span> },
    { title: "Position", dataIndex: "dm_position", key: "dm_position", sorter: (a, b) => a.dm_position.localeCompare(b.dm_position), render: text => <span className="table-cell">{text}</span> },
    { title: "Email ID", dataIndex: "email_id", key: "email_id", sorter: (a, b) => a.email_id.localeCompare(b.email_id), render: text => <span className="table-cell">{text}</span> },
    { title: "Product Name", dataIndex: "product_name", key: "product_name", filters: productFilters, onFilter: (value, record) => record.product_id === value, render: text => <span className="table-cell">{text}</span> },
    { title: "Sender Name", dataIndex: "sender_name", key: "sender_name", sorter: (a, b) => a.sender_name.localeCompare(b.sender_name), render: text => <span className="table-cell">{text}</span> },
    { title: 'Sender Email', dataIndex: 'sender_email', key: 'sender_email', sorter: (a, b) => a.sender_email.localeCompare(b.sender_email), render: text => <span className="table-cell">{text}</span> },
    { title: "Sender Company", dataIndex: "sender_company", key: "sender_company", sorter: (a, b) => a.sender_company.localeCompare(b.sender_company), render: text => <span className="table-cell">{text}</span> },
    { title: "Sender Position", dataIndex: "sender_position", key: "sender_position", sorter: (a, b) => a.sender_position.localeCompare(b.sender_position), render: text => <span className="table-cell">{text}</span> },
    { title: "Email Open Count", dataIndex: "email_open_count", key: "email_open_count", sorter: (a, b) => a.email_open_count - b.email_open_count, render: text => <span className="table-cell">{text}</span> },
    { title: "Follow Up Sent Count", dataIndex: "followup_sent_count", key: "followup_sent_count", sorter: (a, b) => a.followup_sent_count - b.followup_sent_count, render: text => <span className="table-cell">{text}</span> },
    { title: "Follow Up Open Count", dataIndex: "followup_open_count", key: "followup_open_count", sorter: (a, b) => a.followup_open_count - b.followup_open_count, render: text => <span className="table-cell">{text}</span> },
    { title: "Followup Threshold", dataIndex: "followup_threshold", key: "followup_threshold", sorter: (a, b) => a.followup_threshold - b.followup_threshold, render: (text, record) => text > 0 ? (
      <>
        <span className="table-cell">{text} days</span>
        <EditOutlined
          className="edit-icon"
          onClick={() => handleThresholdEdit(record)}
        />
      </>
    ) : null },
    { title: "Status", dataIndex: "status", key: "status", filters: [
        { text: 'Not Responded', value: 'Not Responded' },
        { text: 'Interested', value: 'Interested' },
        { text: 'Not Interested', value: 'Not Interested' },
        { text: 'Send Reminder', value: 'Send Reminder' },
      ], onFilter: (value, record) => record.status === value, render: text => <span className="table-cell">{text}</span> },
    { title: "Date Sent", dataIndex: "date_sent", key: "date_sent", sorter: (a, b) => new Date(a.date_sent) - new Date(b.date_sent), render: text => <span className="table-cell">{text}</span> },
    { title: "Date Opened", dataIndex: "date_opened", key: "date_opened", sorter: (a, b) => new Date(a.date_opened) - new Date(b.date_opened), render: text => <span className="table-cell">{text}</span> },
    {
      title: "Action",
      key: "action",
      render: (text, record) => (
        <div className="action-button">
          {record.status === "Send Reminder" && (
            <Button
              type="primary"
              onClick={() => handleDraftReminder(record)}
              loading={loadingButtons[record.id]} // Use individual loading state
              disabled={Object.values(loadingButtons).some((loading) => loading)} // Disable other buttons
              size="small"
            >
              Draft Reminder
            </Button>
          )}
          {record.status === "Drafted Reminder" && (
            <>
              <Button
                type="primary"
                onClick={() => handleSendReminder(record)}
                loading={loadingButtons[record.id]} // Use individual loading state
                disabled={Object.values(loadingButtons).some((loading) => loading)} // Disable other buttons
                size="small"
              >
                Send Reminder
              </Button>
              <EditOutlined
                className="edit-icon"
                onClick={() => handleEditClick(record)}
                disabled={Object.values(loadingButtons).some((loading) => loading)} // Disable other buttons
              />
            </>
          )}
          {record.status === "Send Another Reminder" && (
            <Button
              type="primary"
              onClick={() => handleSendReminder(record)}
              loading={loadingButtons[record.id]} // Use individual loading state
              disabled={Object.values(loadingButtons).some((loading) => loading)} // Disable other buttons
              size="small"
            >
              Send the Reminder
            </Button>
          )}
          {record.status === "Reminder Sent" && (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              className="reminder-sent-button"
              disabled
              size="small"
            >
              Reminder Sent
            </Button>
          )}
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="container">
        <Spin size="large" />
        <Typography.Text className="loading-container">
          Loading Mail Status...
        </Typography.Text>
      </div>
    );
  }

  return (
    <div className="container">
      {contextHolder}
      <Typography.Title level={3} className="title">Mail Status</Typography.Title>
      <Button type="primary" onClick={handleDailyCheckup} className="button" disabled={loading}>
        Daily Checkup
      </Button>
      <Table
        dataSource={mailStatus}
        columns={columns}
        rowKey="id"
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="medium" // Reduce the size of the table
        className="table"
        loading={tableLoading} // Add loading state to the table
      />
      <Modal
        title="Edit Reminder"
        visible={editDialogOpen}
        footer={null} // Remove default footer
        onCancel={handleEditCancel}
      >
        <Typography.Text strong>Email Subject:</Typography.Text>
        <Input
          placeholder="Email Subject"
          value={editSubject}
          onChange={(e) => setEditSubject(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Typography.Text strong>Email Body:</Typography.Text>
        <ReactQuill
          value={editBody}
          onChange={(content) => setEditBody(content)}
          modules={{
            toolbar: [
              [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
              [{size: []}],
              ['bold', 'italic', 'underline', 'strike', 'blockquote'],
              [{'list': 'ordered'}, {'list': 'bullet'}, 
               {'indent': '-1'}, {'indent': '+1'}],
              ['link', 'image', 'video'],
              ['clean']                                         
            ],
          }}
          formats={[
            'header', 'font', 'size',
            'bold', 'italic', 'underline', 'strike', 'blockquote',
            'list', 'bullet', 'indent',
            'link', 'image', 'video'
          ]}
          style={{ height: 250 }} // Adjust the height to ensure buttons do not overlay
        />
        <div className="edit-modal-footer">
          <Button onClick={handleEditCancel} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleEditSave}>
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        title="Enter Email Credentials"
        visible={emailModalOpen}
        onOk={handleSendMail}
        onCancel={() => setEmailModalOpen(false)}
        okText="Send"
        cancelText="Cancel"
      >
        <Input
          placeholder="Email ID"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ marginBottom: 16 }}
        />
        <Input.Password
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </Modal>
      <Modal
        title="Sender Details"
        visible={senderModalOpen}
        onOk={handleDraftMail}
        onCancel={handleSenderModalCancel} // Use the new cancel handler
        okText="Draft"
        cancelText="Cancel"
        loading={reminderLoading}
      >
        <div className="sender-modal-content">
          <Input
            placeholder="Sender Name"
            value={senderName}
            disabled
          />
          <Select
            placeholder="Select Company"
            value={senderCompany}
            onChange={handleCompanyChange}
            style={{ width: "100%" }}
            dropdownRender={(menu) => (
              <>
                {menu}
                <div className="new-company-input">
                  <Input
                    placeholder="New Company Name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                  />
                  <Input
                    placeholder="New Position"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                  />
                  <Button type="link" icon={<PlusOutlined />} onClick={handleAddCompany}>
                    Add
                  </Button>
                </div>
              </>
            )}
          >
            {companiesList.map((company) => (
              <Select.Option key={company} value={company}>
                {company}
                <DeleteOutlined
                  style={{ color: "red", marginLeft: 8 }}
                  onClick={() => handleRemoveCompany(company)}
                />
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Select Position"
            value={senderPosition}
            onChange={(value) => setSenderPosition(value)}
            style={{ width: "100%" }}
          >
            {positionsList.map((position) => (
              <Select.Option key={position} value={position}>
                {position}
                <DeleteOutlined
                  style={{ color: "red", marginLeft: 8 }}
                  onClick={() => handleRemovePosition(position)}
                />
              </Select.Option>
            ))}
          </Select>
        </div>
      </Modal>
      <Modal
        title="Edit Followup Threshold"
        visible={thresholdEditOpen}
        onOk={handleThresholdSave}
        onCancel={() => setThresholdEditOpen(false)}
        okText="Save"
        cancelText="Cancel"
      >
        <Typography.Text strong>Followup Threshold (days):</Typography.Text>
        <InputNumber
          min={0}
          value={thresholdValue}
          onChange={(value) => setThresholdValue(value)}
          style={{ width: "100%", marginTop: 16 }}
        />
      </Modal>
    </div>
  );
};
