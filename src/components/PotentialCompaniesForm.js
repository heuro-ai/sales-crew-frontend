import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  Input,
  Button,
  Typography,
  Table,
  Modal,
  message,
  Select,
  InputNumber,
  Drawer,
} from "antd";
import { EditOutlined, PlusOutlined, CheckOutlined, DeleteOutlined, ExportOutlined, CloseOutlined } from "@ant-design/icons"; // Add DeleteOutlined
import 'react-quill/dist/quill.snow.css'; // Add this import for styles
import { AuthContext } from "../context/AuthContext";
import '../styles/PotentialCompaniesTable.css'; // Add this import for styles


// Use environment variable for API base URL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const businessModels = ["B2C", "B2B"];

// const ProcessStatus = ({ status }) => (
//   <div className="process-status">
//     <Typography.Text className="status-text">Status: {status}</Typography.Text>
//     {status !== "" && <Spin size="small" />}
//   </div>
// );

export const PotentialCompaniesForm = () => {
  const [inputs, setInputs] = useState({
    productDescription: "",
    companySizeMin: 0,
    companySizeMax: 0,
    businessModel: [],
    geographicLocation: [],
    industry: [],
    painPoints: "",
    existingCustomerData: [],
    productName: "",
  });
  const [companies, setCompanies] = useState([]);
  const [status, setStatus] = useState("");
  const [progress, setProgress] = useState(0);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editCompany, setEditCompany] = useState(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [existingCustomers, setExistingCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [newProductModalOpen, setNewProductModalOpen] = useState(false);
  const [newProductName, setNewProductName] = useState("");
  // const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [email, setEmail] = useState("");
  console.log("Email:", email);
  // const [password, setPassword] = useState("");
  const actions = ["Find Potential Companies", "Get Potential Decision Makers", "Draft a Mail", "Send the Mail"];
  const [loadingIndex, setLoadingIndex] = useState(null);
  const [isNewProduct, setIsNewProduct] = useState(false);
  const [loading, setLoading] = useState(false);
  const { userId } = useContext(AuthContext);
  const [selectedProductId, setSelectedProductId] = useState('');
  console.log("Selected Product ID:", selectedProductId);

  const [preloading, setPreloading] = useState(false); // Add preloading state

  const [senderName, setSenderName] = useState("");
  const [senderCompanyName, setSenderCompanyName] = useState("");
  const [senderPosition, setSenderPosition] = useState("");
  const [senderModalOpen, setSenderModalOpen] = useState(false);
  console.log("senderModalOpen", senderModalOpen);
  const [currentCompany, setCurrentCompany] = useState(null);
  console.log("Current Company:", currentCompany);
  const [companiesList, setCompaniesList] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [positionsDict, setPosiitonsDict] = useState({});
  const [newCompanyName, setNewCompanyName] = useState("");
  const [newPosition, setNewPosition] = useState("");
  const [companyLimit, setCompanyLimit] = useState(0); // Add company limit state
  const [productLimit, setProductLimit] = useState(0); // Add product limit state

  const [messageApi, contextHolder] = message.useMessage();
  const success = (message) => {
    messageApi.open({
      type: 'success',
      content: message,
    });
  };
  const error = (message) => {
    messageApi.open({
      type: 'error',
      content: message,
    });
  };
  // const warning = (message) => {
  //   messageApi.open({
  //     type: 'warning',
  //     content: message,
  //   });
  // };

  const loading_message = (message) => {
    messageApi.open({
      type: 'loading',
      content: message,
      duration: 0,
    });
  };

  const fetchProducts = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_products?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
        console.log("Product ID:", data.product_id);
      } else if (response.status === 401) {
        error("Unauthorized access. Please check your credentials.");
      } else {
        error("Failed to fetch products. Refresh the page or contact support");
      }
    } catch (error) {
      console.error("Error fetching products", error);
    }
  }, [userId, error]);

  const fetchExistingCustomersForProduct = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_single_product/${productId}?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setInputs((prev) => ({
          ...prev,
          productId: data.product_id,
          productDescription: data.product_description,
          companySizeMin: data.target_min_emp_count || prev.companySizeMin,
          companySizeMax: data.target_max_emp_count || prev.companySizeMax,
          industry: data.target_industries,
          geographicLocation: data.target_geo_loc,
          businessModel: Array.isArray(data.target_business_model) ? data.target_business_model : data.target_business_model.replace(/[{}]/g, '').split(',').map(item => item.trim()),
          painPoints: data.addressing_pain_points.join(", "),
          existingCustomerData: prev.existingCustomerData.length === 0 ? data.existing_customers : [...prev.existingCustomerData, ...data.existing_customers],
        }));
        await get_product_loading(productId);
      } else if (response.status === 401) {
        error("Unauthorized access. Please check your credentials.");
      } else {
        error("Failed to fetch existing customers for the selected product");
      }
    } catch (error) {
      console.error("Error fetching existing customers for product", error);
    }
  };

  const fetchUserDetails = useCallback(async (userId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/user?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setSenderName(`${data.first_name} ${data.last_name}`);
        setCompaniesList(data.company_name || []);
        setPositionsList(data.position[data.company_name[0]] || []);
        setSenderCompanyName(data.company_name[0]);
        setEmail(data.email);
        setPosiitonsDict(data.position || {});
        setSenderPosition(data.position[data.company_name[0]][0]);
        setCompanyLimit(data.company_limit); // Set company limit
        setProductLimit(data.product_limit); // Set product limit
      } else if (response.status === 401) {
        error("Unauthorized access. Please check your credentials.");
      } else {
        error("Failed to fetch user details. Try refreshing or contact support");
      }
    } catch (error) {
      console.error("Error fetching user details", error);
    }
  }, [userId, error]);

  const fetchGeneratedCompanies = async (product_id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/get_generated_companies/?user_id=${userId}&product_id=${product_id}`);
      if (response.ok) {
        const data = await response.json();
        const formattedCompanies = data.map((company, index) => ({
          ...company,
          key: index,
          // if tryParseToArray(company.decision_maker) is true, convert company.decision_maker to array else keep it as string
          decision_maker: tryParseToArray(company.decision_maker) ? JSON.parse(company.decision_maker.replace(/'/g, '"')) : company.decision_maker,
          decision_maker_position: tryParseToArray(company.decision_maker_position) ? JSON.parse(company.decision_maker_position.replace(/'/g, '"')) : company.decision_maker_position,
          linkedin_url: tryParseToArray(company.linkedin_url) ? JSON.parse(company.linkedin_url.replace(/'/g, '"')) : company.linkedin_url,
          status: company.status,
          action: company.status === "Not Contacted" ? 0 : company.status === "Decision Maker Found" ? 1 : company.status === "Mail Drafted" ? 2 : company.status === "Mail Sent" ? 3 : 4,
          email_subject: company.subject,
          email_body: company.body
        }
      )
    );
        console.log('Formatted', formattedCompanies)
        setCompanies(formattedCompanies);
        // Store the names of the fetched companies in existingCustomers
        setExistingCustomers((prev) => [...prev, ...data.map((company) => company.name)]);
        // update the existingCustomerData in the input state
        // setInputs((prev) => ({
        //   ...prev,
        //   existingCustomerData: prev.existingCustomerData.length === 0 ? data.map((company) => company.name) : [...prev.existingCustomerData, ...data.map((company) => company.name)],
        // }));
      } else if (response.status === 401) {
        error("Unauthorized access. Please check your credentials.");
      } else {
        error("Failed to fetch generated companies. Refresh the page and try again else contact support");
      }
    } catch (error) {
      console.error("Error fetching generated companies", error);
    }
  };

  const get_product_loading = async(product_id) => {
    setPreloading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/product_loading_status?user_id=${userId}&product_id=${product_id}`, {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setPreloading(data.preloading_status);
      } else if (response.status === 404) {
        error("Product not found. Please check the product ID.");
      } else {
        error("Failed to fetch product loading status. Refresh the page and try again else contact support");
      }
    } catch (error) {
      console.error("Error fetching product loading status", error);
      error("Failed to fetch product loading status. Refresh the page and try again else contact support");
    }
  }

  useEffect(() => { 
    fetchProducts();
    fetchUserDetails(userId); // Replace "user_id" with the actual user ID
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setInputs((prev) => ({ ...prev, [name]: value }));
    if (name === "productName") {
      const selectedProduct = products.find((product) => product.product_name === value);
      if (selectedProduct) {
        // from the inputs, remove the products that have product_id == "ref"
        setInputs((prev) => ({ ...prev, productId: selectedProduct.product_id }));
        fetchExistingCustomersForProduct(selectedProduct.product_id);
        fetchGeneratedCompanies(selectedProduct.product_id); // Fetch generated companies after a product is selected
        setSelectedProductId(selectedProduct.product_id);
      }
    }
  };

  const handleGenerate = async () => {
    Modal.info({
      title: 'Process Started',
      content: 'This process will take several minutes. Once done, we\'ll mail you.',
    });
    setStatus("Fetching Potential Companies");
    setProgress(0);
    console.log("Status", status)
    setLoading(true); // Enable loading state

    try {
      if (isNewProduct) {
        const prodId = await handleAddProduct();
        await generateCompanies(prodId);
      } else {
        const existingProduct = products.find(product => product.product_name === inputs.productName);
        if (existingProduct) {
          await updateProduct(existingProduct.product_id);
        }
        await generateCompanies(existingProduct.product_id);
      }
    } catch (error) {
      console.error("Error during generation process", error);
      setStatus("Error");
    } finally {
      setLoading(false); // Disable loading state
    }
  };

  const updateProduct = async (productId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update_product/${productId}?user_id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: inputs.productName,
          existing_customers: inputs.existingCustomerData,
          product_description: inputs.productDescription,
          target_min_emp_count: inputs.companySizeMin,
          target_max_emp_count: inputs.companySizeMax,
          target_industries: inputs.industry,
          target_geo_loc: inputs.geographicLocation,
          target_business_model: inputs.businessModel,
          addressing_pain_points: inputs.painPoints.split(","),
        }),
      });
      if (response.ok) {
        // const data = await response.json();
        success("Product updated successfully");
        fetchProducts(); // Refresh the product list
        
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        error("Failed to update product. Contact support if this persists");
      }
    } catch (error) {
      console.error("Error updating product", error);
    }
  };

  const addGeneratedCompanies = async (companies, product_id) => {
    try {
      console.log("Inputs State:", inputs); // Log the inputs state to verify
      const payload = {
        product_id: product_id, // Ensure product_id is included
        companies: companies.map(company => ({
          name: company.name,
          industry: company.industry,
          domain: company.domain,
          decision_maker_name: company.decision_maker,
          decision_maker_mail: company.decision_maker_mail,
          decision_maker_position: company.decision_maker_position,
          linkedin_url: company.linkedin_url,
          status: company.status,
        })),
      };
      console.log("Payload:", payload); // Log the payload to verify

      const response = await fetch(`${API_BASE_URL}/add_generated_companies/?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        success("Generated companies added successfully");
      } else {
        error("Failed to add generated companies. Contact support if this persists");
      }
    } catch (err) {
      console.error("Error adding generated companies", err);
      error("Failed to add generated companies");
    }
  };

  const updateGeneratedCompanyStatus = async (companyId, status, domain, personalityType, linkedinUrl, decisionMakerName, decisionMakerEmail, decisionMakerPosition, failed_company=false, subject, body) => {
    try {
      const response = await fetch(`${API_BASE_URL}/update_generated_company_status/?user_id=${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_id: companyId,
          status,
          decision_maker_name: decisionMakerName || null,
          personality_type: personalityType || null,
          linkedin_url: linkedinUrl || null,
          decision_maker_mail: decisionMakerEmail || null,
          decision_maker_position: decisionMakerPosition || null,
          failed_company: failed_company || null,
          subject: subject || null,
          body: body || null,
          domain_name: domain || null,
        }),
      });
      if (response.ok) {
        success("Company status updated successfully");
      } else {
        error("Failed to update company status. Contact support if this persists");
      }
    } catch (err) {
      console.error("Error updating company status", err);
      error("Failed to update company status, Contact support if this persists");
    }
  };

  const generateCompanies = async (product_id) => {
    try {
      loading_message("Started generating companies");
      setPreloading(true);
      const companiesResponse = await fetch(`${API_BASE_URL}/potential-companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: product_id, // Ensure product_id is included
          product_name: inputs.productName, // Include product_name field
          product_description: inputs.productDescription,
          target_min_emp_count: inputs.companySizeMin || null, // Fix duplicate keys
          target_max_emp_count: inputs.companySizeMax || null, // Fix duplicate keys
          sender_position: senderPosition,
          sender_company: senderCompanyName,
          target_industries: inputs.industry,
          target_geo_loc: inputs.geographicLocation,
          target_business_model: inputs.businessModel,
          addressing_pain_points: inputs.painPoints.split(", "),
          existing_customers: existingCustomers || inputs.existingCustomerData,
          limit: companyLimit >= 5 ? 5 : companyLimit > 0 ? companyLimit : 0,
        }),
      });
      setProgress(progress + ((1/20)*100));

      if (companiesResponse.status === 200) {
        const companiesData = await companiesResponse.json();
        console.log("Companies Data:", companiesData);
        const formattedCompanies = companiesData.map((company, index) => ({
          ...company,
          key: index,
          name: company.name,
          industry: company.industry,
          domain: company.domain,
          decision_maker_name: company.decision_maker,
          decision_maker_mail: company.decision_maker_mail,
          decision_maker_position: company.decision_maker_position,
          status: "Mail Drafted",
          action: 2,
        }));

        setCompanies([...companies, ...formattedCompanies]);
        messageApi.destroy();
        success("Successfully generated potential companies");
        await addGeneratedCompanies(formattedCompanies, product_id); // Add generated companies to the database
        await fetchGeneratedCompanies(product_id);
        await fetchUserDetails(userId);
      } else {
        const errorData = await companiesResponse.json();
        console.error("Error response:", errorData);
        error("Oops!\nNo Potential Companies Found. Try other inputs");
      }
    } catch (error) {
      console.error("Error fetching potential companies", error);
      setStatus("Error");
    }
    messageApi.destroy();
    setStatus("");
  };

  function tryParseToArray(str) {
    try {
      // Replace single quotes with double quotes to form valid JSON
      const replacedStr = str.replace(/'/g, '"');
  
      // Attempt to parse the modified string as JSON
      const parsed = JSON.parse(replacedStr);
      
      // Check if the parsed result is an array
      if (Array.isArray(parsed)) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      // Return an error object if parsing fails
      return false;
    }
  }

  const handleNextAction = async (action, company, index) => {
    setLoadingIndex(index);
    console.log("LoadingIndex", loadingIndex)
    setLoading(true); // Enable loading state
    try {
      console.log("Action:", actions[action]);
      if (actions[action] === "Get Potential Decision Makers") {
        loading_message("Generating Potential Leads. This could take a while please wait!")
        setStatus("Fetching Decision Makers");
        const response = await fetch(`${API_BASE_URL}/potential-decision-makers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            user_id: userId,
            company_name: company.name,
            domain_name: company.domain,
            industry: company.industry
          }),
        });

        if (!response.ok) {
          error("Oops!\nNo Decision Maker details Found. Try other companies");
          await updateGeneratedCompanyStatus(company.id, "Decision Maker not Found",null, null, null, "", "", "", true);
          setStatus("");
          setLoadingIndex(null);
          setLoading(false); // Disable loading state
          return;
        }

        const responseData = await response.json();
        console.log("Decision Maker Data:", responseData);
        let updatedCompanies = null;
        if ( typeof responseData.decision_maker === 'string' && typeof responseData.decision_maker_position === 'string' && typeof responseData.linkedin_url === 'string' ) {
          console.log("DM Data", tryParseToArray(responseData.linkedin_url));
          updatedCompanies = companies.map((c) =>
          c.name === company.name
            ? {
                ...c,
                decision_maker: responseData.decision_maker,
                decision_maker_mail: responseData.decision_maker_mail,
                decision_maker_position: responseData.decision_maker_position,
                domain: responseData.status === 'No MX' ? `${responseData.domain} - No such domain, maybe a smaller business` : responseData.status === 'Accepted' ? responseData.domain : `${responseData.domain}`,
                linkedin_url: responseData.linkedin_url,
                
                action: tryParseToArray(responseData.linkedin_url) ? 4 : 1,
              }
            : c
        );
      }
      else{
        console.log("DM Data", tryParseToArray(responseData.linkedin_url));
        updatedCompanies = companies.map((c) =>
          c.name === company.name
            ? {
                ...c,
                decision_maker: responseData.decision_maker,
                decision_maker_mail: responseData.status === 'No MX' ? `No such domain, maybe a smaller business` : responseData.status === 'Accepted' ? responseData.decision_maker_email :  `No MailID found`,
                decision_maker_position: responseData.decision_maker_position,
                domain: responseData.status === 'No MX' ? `${responseData.domain} - No such domain, maybe a smaller business` : responseData.status === 'Accepted' ? responseData.domain :  `${responseData.domain}`,
                linkedin_url: responseData.linkedin_url,
                status: tryParseToArray(responseData.linkedin_url) ? "Cannot Proceed": "Decision Maker Found",
                action: tryParseToArray(responseData.linkedin_url) ? 4 : 1,
              }
            : c
        );
      }
        console.log("Updated companies:", updatedCompanies)
        setCompanies(updatedCompanies);
        setProgress(progress + ((1/20)*100));
        messageApi.destroy();
        success(`${responseData.decision_maker} is a potential Decision Maker at ${company.name}`);
        if ( typeof responseData.decision_maker !== 'string' && typeof responseData.decision_maker_position !== 'string' && typeof responseData.linkedin_url !== 'string' ){
          // convert the responseData to string and pass to updateGeneratedCompanies function
          await updateGeneratedCompanyStatus(company.id, "Decision Makers Found", responseData.status === 'No MX' ? `${responseData.domain} - No such domain, maybe a smaller business` : `${responseData.domain}`, null, JSON.stringify(responseData.linkedin_url), JSON.stringify(responseData.decision_maker), responseData.status === 'No MX' ? `No such domain, maybe a smaller business` : responseData.status === 'Accepted' ? responseData.decision_maker_email :  `No MailID found`, JSON.stringify(responseData.decision_maker_position))
          return
        }
        await updateGeneratedCompanyStatus(company.id, "Decision Maker Found", responseData.domain, null, responseData.linkedin_url, responseData.decision_maker, responseData.decision_maker_mail, responseData.decision_maker_position); // Update company status
      } else if (actions[action] === "Draft a Mail") {
        setCurrentCompany(company);
        setSenderModalOpen(true);
      } else if (actions[action] === "Send the Mail") {
        setEditCompany(company);
        handleSendMail(); // Directly call handleSendMail
      }
      setStatus("");
    } catch (error) {
      console.error("Error performing next action", error);
      setStatus("Error");
    } finally {
      messageApi.destroy();
      setLoadingIndex(null);
      setLoading(false); // Disable loading state
    }
  };

  const [loadingButtons, setLoadingButtons] = useState({}); // Add this state 

  // const handleDraftMail = async () => {
  //   setLoadingButtons((prev) => ({ ...prev, [currentCompany.name]: true })); // Set loading state for the clicked button
  //   setStatus("Drafting Emails");
  //   setLoading(true);
  //   try {
  //     loading_message(`Crafting a personalised email ${inputs.productName} to ${inputs.decision_maker}`)
  //     const response = await fetch(`${API_BASE_URL}/email-proposal`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         product_description: inputs.productDescription,
  //         company_name: currentCompany.name,
  //         decision_maker: currentCompany.decision_maker,
  //         decision_maker_position: currentCompany.decision_maker_position,
  //         sender_name: senderName,
  //         sender_company: senderCompanyName,
  //         sender_position: senderPosition,
  //       }),
  //     });

  //     if (!response.ok) {
  //       error("Failed to draft email. Try again.");
  //       setStatus("");
  //       setLoading(false);
  //       setLoadingButtons({}); // Reset all buttons to normal state
  //       return;
  //     }

  //     const responseData = await response.json();
  //     console.log("Email Proposal Data:", responseData);
  //     const updatedCompanies = companies.map((company) =>
  //       company.name === currentCompany.name
  //         ? { ...company, personality_type: responseData.personality_type, email_subject: responseData.subject, email_body: responseData.body, action: 2 }
  //         : company
  //     );
  //     setCompanies(updatedCompanies);
  //     setProgress(progress + ((1/20)*100));
  //     messageApi.destroy();
  //     success(`Email Drafted Successfully for ${currentCompany.decision_maker}. Please review using Edit Button`);
  //     setSenderModalOpen(false);
  //     setEditCompany(currentCompany);
  //     setEditSubject(responseData.subject);
  //     setEditBody(responseData.body);
  //     setEditDialogOpen(true);
  //     await updateGeneratedCompanyStatus(currentCompany.id, "Mail Drafted", null, responseData.personality_type, null, null, null, null, null, responseData.subject, responseData.body); // Update company status
  //   } catch (error) {
  //     console.error("Error drafting email", error);
  //     setStatus("Error");
  //   } finally {
  //     messageApi.destroy();
  //     setSenderModalOpen(false);
  //     setLoading(false);
  //     setLoadingButtons({}); // Reset all buttons to normal state
  //   }
  // };

  const handleSendMail = async () => {
    try {
      const mailtoLink = `mailto:${editCompany.decision_maker_mail}?subject=${encodeURIComponent(editCompany.email_subject)}&body=${encodeURIComponent(editCompany.email_body)}`;
      window.location.href = mailtoLink;
    } catch (error) {
      console.error("Error sending email", error);
      setStatus("Error");
    }
  };

  const handleEditClick = (company) => {
    setEditCompany(company);
    setEditSubject(company.email_subject);
    setEditBody(company.email_body.replace(/<br\s*\/?>/gi, '\n')); // Replace <br> tags with \n
    setEditDialogOpen(true);
  };

  const handleEditSave = () => {
    const updatedCompanies = companies.map((company) =>
      company.name === editCompany.name
        ? { ...company, email_subject: editSubject, email_body: editBody }
        : company
    );
    setCompanies(updatedCompanies);
    setEditDialogOpen(false);
  };

  const handleEditCancel = () => {
    setEditDialogOpen(false);
    setEditCompany(null);
    setEditSubject("");
    setEditBody("");
  };

  const handleAddProduct = async () => {
    try {
      const existingProduct = products.find(product => product.product_name.toLowerCase() === inputs.productName.toLowerCase());
      if (existingProduct) {
        error("Product name already exists. Please use a different product name.");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/add_product?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_name: inputs.productName, // Ensure product_name is included
          existing_customers: inputs.existingCustomerData,
          product_description: inputs.productDescription,
          target_min_emp_count: inputs.companySizeMin,
          target_max_emp_count: inputs.companySizeMax,
          target_industries: inputs.industry,
          target_geo_loc: inputs.geographicLocation,
          target_business_model: inputs.businessModel, // Ensure this is a list
          addressing_pain_points: inputs.painPoints.split(","),
        }),
      });
      if (response.ok) {
        const data = await response.json();
        success("Product added successfully");
        fetchProducts(); // Refresh the product list
        setNewProductModalOpen(false);
        setNewProductName("");
        console.log("product_id", data.product_id)
        setInputs((prev) => ({ ...prev, productId: data.product_id }));
        setSelectedProductId(data.product_id)
        return data.product_id
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        error("Failed to add product");
        return
      }
    } catch (error) {
      console.error("Error adding product", error);
      return
    }
  };

  const handleAddProductToPlaceholder = () => {
    const existingProduct = products.find(product => product.product_name.toLowerCase() === newProductName.toLowerCase());
      if (existingProduct) {
        error("Product name already exists. Please use a different product name.");
        return;
      }
      else {
        console.log("products", inputs);
        setCompanies([]);
        setNewProductModalOpen(false);
    setIsNewProduct(true);
    setInputs((prev) => ({
      ...prev,
      productDescription: "",
    companySizeMin: 0,
    companySizeMax: 0,
    businessModel: [],
    geographicLocation: [],
    industry: [],
    painPoints: "",
    existingCustomerData: [],
    // if product name 
    productName: newProductName ,
    product_id: "ref"
    }));
    setExistingCustomers([]);
      }
  };

  const handleFindMore = async () => {
    Modal.info({
      title: 'Process Started',
      content: 'This process will take several minutes. Once done, we\'ll mail you.',
    });
    setStatus("Fetching More Potential Companies");
    setProgress(0);
    setLoading(true); // Enable loading state

    try {
      const existingProduct = products.find(product => product.product_name === inputs.productName);
      loading_message("Finding more potential companies");
      setPreloading(true);
      const companiesResponse = await fetch(`${API_BASE_URL}/potential-companies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          product_id: existingProduct.product_id, // Ensure product_id is included
          product_name: inputs.productName, // Include product_name field
          product_description: inputs.productDescription,
          target_min_emp_count: inputs.companySizeMin || null, // Fix duplicate keys
          target_max_emp_count: inputs.companySizeMax || null, // Fix duplicate keys
          target_industries: inputs.industry,
          target_geo_loc: inputs.geographicLocation,
          target_business_model: inputs.businessModel,
          sender_position: senderPosition,
          sender_company: senderCompanyName,
          addressing_pain_points: inputs.painPoints.split(", "),
          existing_customers: existingCustomers || inputs.existingCustomerData,
          limit: companyLimit >= 5 ? 5 : companyLimit > 0 ? companyLimit : 0,
        }),
      });
      setProgress(progress + ((1/20)*100));

      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        console.log("Companies Data:", companiesData);
        const formattedCompanies = companiesData.map((company, index) => ({
          ...company,
          key: index,
          name: company.name,
          industry: company.industry,
          domain: company.domain,
          decision_maker_name: company.decision_maker,
          decision_maker_mail: company.decision_maker_mail,
          decision_maker_position: company.decision_maker_position,
          status: "Mail Drafted",
          action: 2,
        }));

        setCompanies([...companies, ...formattedCompanies]);
        messageApi.destroy();
        success("Found more potential companies")
        setPreloading(true);
        await addGeneratedCompanies(formattedCompanies, inputs.productId); // Add generated companies to the database
        await fetchUserDetails(userId);
        await fetchGeneratedCompanies(inputs.productId);
      } else {
        const errorData = await companiesResponse.json();
        console.error("Error response:", errorData);
        error("Oops!\nNo Potential Companies Found. Try other inputs");
      }
    } catch (error) {
      console.error("Error fetching more potential companies", error);
      setStatus("Error");
    } finally {
      messageApi.destroy();
      setStatus("");
      setLoading(false); // Disable loading state
    }
  };

  const handleAddCompany = async () => {
    try {
      const newPosList = positionsDict[newCompanyName] 
  ? [...positionsDict[newCompanyName], newPosition] 
  : [newPosition];
      const response = await fetch(`${API_BASE_URL}/add_company?user_id=${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          company_name: newCompanyName,
          // if the newCompanyName is already present in the positionsDict then the newPosition will be added in the list of newCompanyname in the positionsDict, if not exists and a new newCompany to the psoitionsDict as key and list of new posiiton as value
          position: { ...positionsDict, [newCompanyName]: newPosList }
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
        error("Failed to add company and positions");
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
        error("Failed to remove company");
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
          company_name: senderCompanyName,
          position: positionsList.filter(pos => pos !== position),
        }),
      });
      if (response.ok) {
        success("Position removed successfully");
        fetchUserDetails(userId); // Refresh the user details
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        error("Failed to remove position");
      }
    } catch (error) {
      console.error("Error removing position", error);
    }
  };

  const handleCompanyChange = (value) => {
    setSenderCompanyName(value);
    setPositionsList(positionsDict[value] || []); // Update positions based on the selected company
    setSenderPosition(positionsDict[value][0]); // Set the first position as default
  };

  const handleExportLinkedIn = (url) => {
    window.open(url, "_blank");
  };

  const columns = [
    { title: "Company Name", dataIndex: "name", key: "name", fixed: "left", render: text => <span className="intable-text">{text}</span> },
    { 
      title: "Decision Maker Name", 
      dataIndex: "decision_maker", 
      key: "decision_maker",
      render: (text, record) => (
        <>
          {record.linkedin_url && typeof record.linkedin_url === 'string' ? ( 
            <div className="intable-text">
              {text}
              <ExportOutlined
                className="export-icon"
                onClick={() => handleExportLinkedIn(record.linkedin_url)}
              />
            </div>
          ) : Array.isArray(record.linkedin_url) ? (
            (Array.isArray(record.decision_maker) ? record.decision_maker : [record.decision_maker]).map((key, index) => (
              <div key={index} className="intable-text">
                {key}
                <ExportOutlined
                  className="export-icon"
                  onClick={() => handleExportLinkedIn(record.linkedin_url[index])}
                />
              </div>
            ))
          ) :
          (
            <div className="intable-text">
              {text}
            </div>
          )
          }
        </>
      )
    },
    { title: "Industry", dataIndex: "industry", key: "industry", render: text => <span className="intable-text">{text}</span> },
    { title: "Domain", dataIndex: "domain", key: "domain", render: text => <span className="intable-text">{text}</span> },
    { title: "Match Score", dataIndex: "match_score", key: "match_score", render: text => <span className="intable-text">{text} %</span>, sorter: (a, b) => b.match_score - a.match_score }, // Add sorter
    { title: "Personality Type", dataIndex: "personality_type", key: "personality_type", render: text => <span className="intable-text">{text}</span> },
    { 
      title: "Decision Maker Position", 
      dataIndex: "decision_maker_position", 
      key: "decision_maker_position",
      render: (text, record) => (
        <>
          {record.decision_maker_position && typeof record.decision_maker_position === 'string' ? (
            <div className="intable-text">
              {text}
            </div>
          ) : Array.isArray(record.decision_maker_position) ? (
            (Array.isArray(record.decision_maker_position) ? record.decision_maker_position : [record.decision_maker_position]).map((key, index) => (
              <div key={index} className="intable-text">
                {key}
              </div>
            ))
          ) :
          (
            <div className="intable-text">
              {text}
            </div>
          )
          }
        </>
      )
    },
    { title: "Decision Maker Email", dataIndex: "decision_maker_mail", key: "decision_maker_mail", render: text => <span className="intable-text">{text}</span> },
    {
      title: "Action",
      key: "action",
      render: (text, record, index) => (
        <div className="intable-text">
          {!record.failed_company && record.action + 1 < actions.length && (
            <Button
              type="primary"
              onClick={() => handleNextAction(record.action + 1, record, index)}
              loading={loadingButtons[record.name]} // Use individual loading state
              disabled={loading} // Disable other buttons
              size="medium"
              className="intable-text"
            >
              {actions[record.action + 1]}
            </Button>
          )}
          {!record.failed_company && record.action === 2 && (
            <EditOutlined
              className="edit-icon"
              onClick={() => handleEditClick(record)}
              disabled={Object.values(loadingButtons).some((loading) => loading)} // Disable other buttons
            />
          )}
          {!record.failed_company && record.action === 3 ? (
            <Button
              type="primary"
              icon={<CheckOutlined />}
              className="mail-sent-button"
              disabled
              size="medium"
            >
              Mail Sent
            </Button>
          ) : record.action > 3 && (
            <Button
              type="dashed"
              icon={<CloseOutlined />}
              disabled
              size="medium"
            >
              Cannot proceed
            </Button>
          )}
        </div>
      ),
    },
  ];

  const [drawerVisible, setDrawerVisible] = useState(false); // Add state for drawer visibility

  const handleStartDrawerOpen = () => {
    setDrawerVisible(true);
    setInputs((prev) => ({
      ...prev,
      productDescription: "",
    companySizeMin: 0,
    companySizeMax: 0,
    businessModel: [],
    geographicLocation: [],
    industry: [],
    painPoints: "",
    existingCustomerData: [],
    productName: "",
    product_id: "ref"
    }));
    setExistingCustomers([]);
  };

  const handleDrawerOpen = () => {
    setDrawerVisible(true);
  }

  const handleDrawerClose = () => {
    setDrawerVisible(false);
  };

  const handleCustomerInputKeyPress = (event) => {
    if (event.key === 'Enter' && event.target.value) {
      const newCustomer = event.target.value.trim();
      if (newCustomer && !inputs.existingCustomerData.includes(newCustomer)) {
        setInputs((prev) => ({
          ...prev,
          existingCustomerData: [...prev.existingCustomerData, newCustomer],
        }));
        event.target.value = '';
      }
    }
  };

  return (
    <div className="table-container"> {/* Add padding for mobile */}
      {contextHolder}
      <Typography.Title level={3} className="table-title">Campaign</Typography.Title> {/* Adjust font size */}
      <Button type="primary" onClick={handleStartDrawerOpen} className="table-button" disabled={loading || productLimit === 0}> {/* Adjust font size */}
        Start a Campaign
      </Button>
      <div className="table-select-container"> {/* Add flexWrap for mobile */}
        <Select
          placeholder="Select Product"
          value={inputs.productName}
          onChange={(value) => handleSelectChange("productName", value)}
          className="table-select"
        >
          {products.map((product) => (
            <Select.Option key={product.product_id} value={product.product_name}>
              {product.product_name}
            </Select.Option>
          ))}
        </Select>
        <Button type="primary" onClick={handleDrawerOpen} disabled={loading} className="table-button"> {/* Adjust width for mobile */}
          Edit Campaign
        </Button>
      </div>
      <Drawer
        title="Campaign Form"
        placement="right"
        onClose={handleDrawerClose}
        visible={drawerVisible}
        className="table-drawer"
        zIndex={1000} // Ensure the drawer has a lower z-index than the modal
      >
        <div className="table-drawer-content">
          <Select
            placeholder="Select Product"
            value={inputs.productName}
            onChange={(value) => handleSelectChange("productName", value)}
            className="table-drawer-input"
            dropdownRender={(menu) => (
              <>
                {menu}
                <div className="add-new-product">
                  <Button
                    type="link"
                    icon={<PlusOutlined />}
                    onClick={() => {setNewProductModalOpen(true); setNewProductName("")}}
                    disabled={productLimit === 0} // Disable button if product limit is reached
                  >
                    Add New Product
                  </Button>
                </div>
              </>
            )}
          >
            {products.map((product) => (
              <Select.Option key={product.product_id} value={product.product_name}>
                {product.product_name}
              </Select.Option>
            ))}
          </Select>
          <Input.TextArea
            placeholder="Product Description"
            name="productDescription"
            value={inputs.productDescription}
            onChange={handleChange}
            rows={4}
            className="table-drawer-input"
          />
          <div className="input-number-container">
            <InputNumber
              placeholder="Company Size Min"
              name="companySizeMin"
              value={inputs.companySizeMin}
              onChange={(value) => handleSelectChange("companySizeMin", value)}
              className="table-drawer-input-half"
            />
            <InputNumber
              placeholder="Company Size Max"
              name="companySizeMax"
              value={inputs.companySizeMax}
              onChange={(value) => handleSelectChange("companySizeMax", value)}
              className="table-drawer-input-half"
            />
          </div>
          <Select
            mode="tags"
            placeholder="Enter Industry"
            value={inputs.industry}
            onChange={(value) => handleSelectChange("industry", value)}
            className="table-drawer-input"
          />
          <Select
            mode="tags"
            placeholder="Enter Geographic Location"
            value={inputs.geographicLocation}
            onChange={(value) => handleSelectChange("geographicLocation", value)}
            className="table-drawer-input"
          />
          <Select
            mode="multiple"
            placeholder="Select Business Model"
            value={inputs.businessModel}
            onChange={(value) => handleSelectChange("businessModel", value)}
            className="table-drawer-input"
          >
            {businessModels.map((model) => (
              <Select.Option key={model} value={model}>
                {model}
              </Select.Option>
            ))}
          </Select>
          <Input.TextArea
            placeholder="Enter Pain Points (comma-separated)"
            name="painPoints"
            value={inputs.painPoints}
            onChange={handleChange}
            rows={4}
            className="table-drawer-input"
          />
          <Select
            mode="tags"
            placeholder="Select Existing Customers"
            value={[...existingCustomers, ...inputs.existingCustomerData.filter((customer) => !existingCustomers.includes(customer))]}
            onChange={(value) => handleSelectChange("existingCustomerData", value.filter((customer) => !existingCustomers.includes(customer)))}
            onInputKeyDown={handleCustomerInputKeyPress} // Add this line
            className="table-drawer-input"
          >
            {existingCustomers.map((customer) => (
              <Select.Option key={customer} value={customer} disabled>
                {customer}
              </Select.Option>
            ))}
            {inputs.existingCustomerData
              .filter((customer) => !existingCustomers.includes(customer))
              .map((customer) => (
                <Select.Option key={customer} value={customer}>
                  {customer}
                </Select.Option>
              ))}
          </Select>
          <Input
            placeholder="Sender Name"
            value={senderName}
            disabled
            className="sender-name-input"
          />
          <Select
            placeholder="Select Company"
            value={senderCompanyName}
            onChange={handleCompanyChange}
            className="table-drawer-input"
            dropdownRender={(menu) => (
              <>
                {menu}
                <div className="add-new-company">
                  <Input
                    placeholder="New Company Name"
                    value={newCompanyName}
                    onChange={(e) => setNewCompanyName(e.target.value)}
                    className="new-company-input"
                  />
                  <Input
                    placeholder="New Position"
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                    className="new-position-input"
                  />
                  <Button 
                    type="link" 
                    icon={<PlusOutlined />} 
                    onClick={handleAddCompany} 
                    disabled={!newCompanyName.trim() || !newPosition.trim()}
                  >
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
                  className="delete-icon"
                  onClick={() => handleRemoveCompany(company)}
                />
              </Select.Option>
            ))}
          </Select>
          <Select
            placeholder="Select Position"
            value={senderPosition}
            onChange={(value) => setSenderPosition(value)}
            className="table-drawer-input"
          >
            {positionsList.map((position) => (
              <Select.Option key={position} value={position}>
                {position}
                <DeleteOutlined
                  className="delete-icon"
                  onClick={() => handleRemovePosition(position)}
                />
              </Select.Option>
            ))}
          </Select>
          <Button
            type="primary"
            onClick={handleGenerate}
            className="table-drawer-button" // Adjust font size
            // disabled={loading || companyLimit === 0 || preloading || (!inputs.productName || !inputs.productDescription || !inputs.industry || !inputs.businessModel)} // Disable button if company limit is reached
          > Generate </Button>
        </div>
      </Drawer>
      {inputs.productName && <Table
        dataSource={companies}
        columns={columns}
        rowKey="key"
        scroll={{ x: 1300 }} // Add horizontal scroll
        size="medium" // Reduce the size of the 
        className="table" // Reduce font size
        loading={loading || preloading} // Add loading state to the table
      />}
      <Button
        type="primary"
        onClick={handleFindMore}
        className="table-button-find-more" // Adjust font size
        disabled={!companies.length>0 || loading || companyLimit === 0 || preloading} // Disable button if company limit is reached
      >
        Find More
      </Button>
      <Modal
        title="Edit Mail"
        visible={editDialogOpen}
        footer={null} // Remove default footer
        onCancel={handleEditCancel}
      >
        <Typography.Text strong>Email Subject:</Typography.Text>
        <Input
          placeholder="Email Subject"
          value={editSubject}
          onChange={(e) => setEditSubject(e.target.value)}
          className="email-subject-input"
        />
        <Typography.Text strong>Email Body:</Typography.Text>
        <Input.TextArea
          value={editBody}
          onChange={(e) => setEditBody(e.target.value)}
          rows={10}
          className="email-body-editor"
        />
        <div className="edit-modal-footer">
          <Button onClick={handleEditCancel} className="cancel-button">
            Cancel
          </Button>
          <Button type="primary" onClick={handleEditSave} className="save-button">
            Save
          </Button>
        </div>
      </Modal>
      <Modal
        title="Add New Product"
        visible={newProductModalOpen}
        onOk={handleAddProductToPlaceholder}
        onCancel={() => setNewProductModalOpen(false)}
        okText="Add"
        cancelText="Cancel"
        zIndex={1100} // Ensure the modal has a higher z-index than the drawer
      >
        <Input
          placeholder="Product Name"
          value={newProductName}
          onChange={(e) => {setNewProductName(e.target.value); console.log("newProductName", newProductName)
          }}
          className="new-product-input"
        />
      </Modal>
    </div>
  );
};