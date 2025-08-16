import React from "react";
import { Layout, Typography, Row, Col, Card, Button } from "antd";
import {
  RocketOutlined,
  BankOutlined,
  TeamOutlined,
  EditOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const { Content } = Layout;
const { Title, Paragraph } = Typography;

const Home = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/login");
  };

  // Animation variants for container and items
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <Layout>
      <Content style={{ padding: "24px", backgroundColor: "#f0f2f5" }}>
        {/* Hero Section with a large icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: "center", margin: "40px 0" }}
        >
          <RocketOutlined style={{ fontSize: "64px", color: "#1890ff", marginBottom: "20px" }} />
          <Title level={2}>Empower Your Sales Pipeline</Title>
          <Paragraph
            style={{
              fontSize: "16px",
              color: "#595959",
              maxWidth: "600px",
              margin: "0 auto",
            }}
          >
            Sales Crew streamlines your lead generation process — from finding target companies and identifying decision makers to crafting personalized outreach and tracking results.
          </Paragraph>
          <Button type="primary" size="large" style={{ marginTop: "20px" }} onClick={handleGetStarted}>
            Get Started
          </Button>
        </motion.div>

        {/* Process Cards with Animated Transitions and Icon Enhancements */}
        <motion.div variants={containerVariants} initial="hidden" animate="visible">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} md={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card hoverable style={{ borderRadius: "8px", textAlign: "center" }}>
                  <BankOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "10px" }} />
                  <Title level={4}>1. Find Companies</Title>
                  <Paragraph>
                    Identify companies that match your ideal customer profile with advanced filters by industry, size, location, and more.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card hoverable style={{ borderRadius: "8px", textAlign: "center" }}>
                  <TeamOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "10px" }} />
                  <Title level={4}>2. Identify Decision Makers</Title>
                  <Paragraph>
                    Access detailed profiles of key decision makers to ensure your outreach reaches the right contacts.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card hoverable style={{ borderRadius: "8px", textAlign: "center" }}>
                  <EditOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "10px" }} />
                  <Title level={4}>3. Personalize Outreach</Title>
                  <Paragraph>
                    Craft tailored email campaigns that address the specific needs and challenges of your prospects.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
            <Col xs={24} sm={12} md={12} lg={6}>
              <motion.div variants={itemVariants}>
                <Card hoverable style={{ borderRadius: "8px", textAlign: "center" }}>
                  <BarChartOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "10px" }} />
                  <Title level={4}>4. Track & Optimize</Title>
                  <Paragraph>
                    Monitor email performance and engagement, enabling you to optimize your strategy in real time.
                  </Paragraph>
                </Card>
              </motion.div>
            </Col>
          </Row>
        </motion.div>
      </Content>
    </Layout>
  );
};

export default Home;
