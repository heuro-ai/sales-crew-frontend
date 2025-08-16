import React from "react";
import { Layout, Typography } from "antd";

const { Title, Paragraph } = Typography;
const { Content } = Layout;

const PrivacyPolicy = () => {
  return (
    <Layout style={{ padding: '0 24px 24px' }}>
      <Content style={{ margin: "24px 16px 0" }}>
        <Typography>
          <Title level={2}>Privacy Policy</Title>
          
          <Title level={3}>1. Introduction</Title>
          <Paragraph>
            Welcome to Sales Crew. We are committed to protecting your personal information and your right to privacy. If you have any questions or concerns about our policy, or our practices with regards to your personal information, please contact us.
          </Paragraph>
          
          <Title level={3}>2. Information We Collect</Title>
          <Paragraph>
            We collect personal information that you voluntarily provide to us when registering at the Services, expressing an interest in obtaining information about us or our products and services, when participating in activities on the Services or otherwise contacting us.
          </Paragraph>
          
          <Title level={3}>3. How We Use Your Information</Title>
          <Paragraph>
            We use personal information collected via our Services for a variety of business purposes described below. We process your personal information for these purposes in reliance on our legitimate business interests, in order to enter into or perform a contract with you, with your consent, and/or for compliance with our legal obligations.
          </Paragraph>
          
          <Title level={3}>4. Sharing Your Information</Title>
          <Paragraph>
            We only share information with your consent, to comply with laws, to provide you with services, to protect your rights, or to fulfill business obligations.
          </Paragraph>
          
          <Title level={3}>5. Security of Your Information</Title>
          <Paragraph>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable, and no method of data transmission can be guaranteed against any interception or other type of misuse.
          </Paragraph>
          
          <Title level={3}>6. Contact Us</Title>
          <Paragraph>
            If you have questions or comments about this policy, you may email us at dharani96556@gmail.com or by post to:
            <br />
            Sales Crew
            <br />
            India
            <br />
          </Paragraph>
        </Typography>
      </Content>
    </Layout>
  );
};

export default PrivacyPolicy;
