import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { ConfigProvider, Layout } from "antd";

import { Login } from "./components/Login";
import { Register } from "./components/Register";
import { PotentialCompaniesForm } from "./components/PotentialCompaniesForm";
import { MailStatusTable } from "./components/MailStatusTable";
import UserSettings from "./components/UserSettings"; // Add this import
import AppHeader from "./components/Header";
import { Footer } from "./components/Footer";
import { AuthProvider } from "./context/AuthContext";
import { AuthConsumer, ProtectedRoute } from "./components/AuthComponents";
import { Verify } from "./components/Verify"; // Import Verify component
import Home from "./components/Home"; // Add this import
import PrivacyPolicy from "./components/PrivacyPolicy"; // Add this import

const { Content } = Layout;

const App = () => {
  return (
    <AuthProvider>
      <ConfigProvider>
        <Router>
          <Layout style={{ minHeight: "100vh" }}>
            <AppHeader>
              <AuthConsumer />
            </AppHeader>
            <Layout>
              <Layout style={{ padding: '0' }}>
                <Content style={{ margin: "0" }}>
                  <Routes>
                    <Route
                      path="/"
                      element={<Home />} // Change this route to Home component
                    />
                    <Route path="/login" element={<Login />} /> 
                    <Route path="/register" element={<Register />} />
                    <Route path="/verify" element={<Verify />} /> {/* Add this route */}
                    <Route
                      path="/generate"
                      element={<ProtectedRoute component={PotentialCompaniesForm} />}
                    />
                    <Route
                      path="/mailstatus"
                      element={<ProtectedRoute component={MailStatusTable} />}
                    />
                    <Route path="/profile" element={<ProtectedRoute component={UserSettings} />} /> {/* Add this route */}
                    <Route path="/privacy-policy" element={<PrivacyPolicy />} /> {/* Add this route */}
                    {/* <Route path="/subscribe" element={<Subscribe />} /> Add route for Subscribe page */}
                  </Routes>
                </Content>
              </Layout>
            </Layout>
            <Footer />
          </Layout>
        </Router>
      </ConfigProvider>
    </AuthProvider>
  );
};

export default App;