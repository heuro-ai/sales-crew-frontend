import React, { useState, useEffect, useContext } from "react";
import { Typography, Button, Card, Row, Col, message } from "antd";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";

const plans = [
  {
    title: "Basic Plan",
    price: 999,
    duration: 30,
    features: [
      "Access to basic features",
      "Email support",
      "10GB storage",
    ],
  },
  {
    title: "Premium Plan",
    price: 2999,
    duration: 90,
    features: [
      "Access to all features",
      "Priority email support",
      "100GB storage",
    ],
  },
];

const Subscribe = () => {
  const { userId } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setRazorpayLoaded(true);
    script.onerror = () => message.error("Failed to load Razorpay script");
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleSubscribe = async (plan) => {
    if (!razorpayLoaded) {
      message.error("Razorpay SDK is not loaded yet. Please try again later.");
      return;
    }

    setLoading(true);
    setLoadingPlan(plan.title);
    try {
      const response = await axios.post(`${API_BASE_URL}/subscribe/${userId}`, {
        plan_name: plan.title,
        duration_days: plan.duration,
        amount: plan.price,
      });

      const { order_id, amount, currency } = response.data;

      const options = {
        key: "rzp_live_RFDktR7v7FE4nf", // Replace with your Razorpay key
        amount: amount, // in paise
        currency: currency,
        name: "Leadagent.in",
        description: plan.title,
        order_id: order_id,
        handler: async function (response) {
          try {
            await axios.post(`${API_BASE_URL}/payment-success`, {
              order_id: response.razorpay_order_id,
              payment_id: response.razorpay_payment_id,
              signature: response.razorpay_signature,
            });
            message.success("Payment successful and subscription activated");
          } catch (error) {
            await axios.post(`${API_BASE_URL}/payment-failure`, {
              order_id: response.razorpay_order_id,
            });
            message.error("Payment verification failed");
          }
        },
        prefill: {
          name: "User Name", // Replace with actual user name
          email: "user@example.com", // Replace with actual user email
        },
        theme: {
          color: "#4CAF50",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response) {
        message.error("Payment failed: " + response.error.description);
      });
      rzp.open();
    } catch (error) {
      message.error("Subscription initiation failed");
    } finally {
      setLoading(false);
      setLoadingPlan(null);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <Typography.Title level={2}>Subscribe to Our Service</Typography.Title>
      <Row gutter={16}>
        {plans.map((plan) => (
          <Col span={12} key={plan.title}>
            <Card title={plan.title} bordered={false} style={{ height: '100%' }}>
              <Typography.Title level={3}>₹{plan.price}</Typography.Title>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <Button 
                type="primary" 
                style={{ width: '100%', backgroundColor: 'transparent', borderColor: '#4CAF50', color: '#4CAF50' }} 
                onClick={() => handleSubscribe(plan)}
                loading={loadingPlan === plan.title}
                disabled={loading && loadingPlan !== plan.title}
              >
                Subscribe
              </Button>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default Subscribe;
