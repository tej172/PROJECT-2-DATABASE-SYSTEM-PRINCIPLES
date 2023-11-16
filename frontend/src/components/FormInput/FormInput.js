import { useState, useEffect } from "react";
import axios from "axios";

import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";
import Toast from "react-bootstrap/Toast";
import Spinner from "react-bootstrap/Spinner";

import FormOutput from "../FormOutput/FormOutput";

import styles from "./FormInput.module.css";

const FormInput = () => {
  const [input, setInput] = useState({
    query: "",
    predicates: [],
  });

  const [output, setOutput] = useState({
    data: {},
    bestPlanId: 1,
    status: "",
    error: false,
  });

  const [showPredicateWarning, setShowPredicateWarning] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [queries, setQueries] = useState([]);

  useEffect(() => {
    // Fetch queries when the component mounts
    const fetchQueries = async () => {
      try {
        const response = await fetch("./queries.json"); // Replace with the actual path
        const data = await response.json();
        console.log(data); // Add this line
        setQueries(data);
      } catch (error) {
        console.error("Error fetching queries:", error);
      }
    };

    fetchQueries();
  }, []);

  const handleQueryButtonClick = (query) => {
    setInput({ ...input, query });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowLoading(true);
    setOutput((oldState) => ({
      ...oldState,
      status: "Generating output...",
      error: false,
    }));

    if (input.query !== "") {
      axios
        .post("/generate", input)
        .then((response) => {
          setShowLoading(false);
          if (response.status === false || response.data["error"] === true) {
            setOutput((oldState) => ({
              ...oldState,
              status: response.data["status"],
              error: true,
            }));
            setShowError(true);
          } else {
            setOutput((oldState) => ({
              ...oldState,
              data: response.data["data"],
              bestPlanId: response.data["best_plan_id"],
              status: response.data["status"],
              schema_dict: response.data["schema_dict"],
              error: false,
            }));
            setShowSuccess(true);
          }
        })
        .catch((error) => {
          setShowLoading(false);
          setOutput((oldState) => ({
            ...oldState,
            status:
              "Error generating output. Please check your query's formatting and/or validity.",
            error: true,
          }));
          setShowError(true);
        });
    } else {
      setShowLoading(false);
      setOutput((oldState) => ({
        ...oldState,
        status: "Error generating output. Please input an SQL query.",
        error: true,
      }));
      setShowError(true);
    }
  };

  const resetForm = (event) => {
    setInput({
      query: "",
      predicates: [],
    });
    setOutput({
      data: {},
      bestPlanId: 1,
      status: "",
      schema_dict: {},
      error: false,
    });
  };

  const showSelectedPredicates = () => {
    if (input.predicates && input.predicates.length > 0) {
      let selectedPredicates = "";
      input.predicates.forEach((predicate) => {
        selectedPredicates += `${predicate}, `;
      });
      return selectedPredicates.slice(0, selectedPredicates.length - 2);
    } else {
      return "";
    }
  };

  return (
    <>
      {/* Toasts for loading, success, and error */}
      <div className={styles.toastWrapper}>
        <Toast
          bsPrefix={styles.toastLoading}
          animation={true}
          autohide={false}
          delay={3000}
          onClose={() => setShowLoading(false)}
          show={showLoading}
        >
          <div className={styles.toastLoadingWrapper}>
            <Spinner
              animation="border"
              size="sm"
              variant="light"
              as="span"
              role="status"
            ></Spinner>
            <Toast.Header bsPrefix={styles.toastHeader}>
              Loading data...
            </Toast.Header>
          </div>
          <Toast.Body bsPrefix={styles.toastBody}>
            Please wait patiently - this could take a while.
          </Toast.Body>
        </Toast>
      </div>

      <div className={styles.toastWrapper}>
        <Toast
          bsPrefix={styles.toastSuccess}
          animation={true}
          autohide={true}
          delay={3000}
          onClose={() => setShowSuccess(false)}
          show={showSuccess}
        >
          <Toast.Header bsPrefix={styles.toastHeader}>Success!</Toast.Header>
          <Toast.Body bsPrefix={styles.toastBody}>
            Data loaded. Please see the output for the results.
          </Toast.Body>
        </Toast>
      </div>

      <div className={styles.toastWrapper}>
        <Toast
          bsPrefix={styles.toastError}
          animation={true}
          autohide={true}
          delay={8000}
          onClose={() => setShowError(false)}
          show={showError}
        >
          <Toast.Header bsPrefix={styles.toastHeader}>Error!</Toast.Header>
          <Toast.Body bsPrefix={styles.toastBody}>{output.status}</Toast.Body>
        </Toast>
      </div>

      {/* Form and buttons */}
      <Form onSubmit={handleSubmit} className="mb-4">
        <Form.Row>
          <Form.Group as={Col} controlId="formInput">
            <Row>
              {/* Left column for Form.Text */}
              <Col md={6}>
                <Form.Group controlId="formQuery">
                  <Form.Label bsPrefix={styles.largeText}>SQL Query</Form.Label>
                  <Form.Text bsPrefix={styles.smallText}>
                    Please input your SQL query. Ensure that the query is
                    properly formatted and is a valid SQL query. You can type
                    your query across multiple lines using the 'Enter' key.
                  </Form.Text>
                </Form.Group>
                <Form.Text bsPrefix={styles.largeText}>
                  Example Queries:
                </Form.Text>
                <div className={styles.queryButtons}>
                  <Row>
                    {queries.map((queryObj, index) => (
                      <Col md={2} key={index} className="mb-2 mr-3">
                        <Button
                          variant="outline-primary"
                          className={`${styles.queryButton} ${styles.customOutlinePurple}`}
                          onClick={() => handleQueryButtonClick(queryObj.query)}
                        >
                          {`Query ${index + 1}`}
                        </Button>
                      </Col>
                    ))}
                  </Row>
                </div>
              </Col>

              {/* Right column for Form.Control */}
              <Col md={6}>
                <Form.Control
                  as="textarea"
                  rows="12"
                  placeholder="Input SQL query..."
                  onChange={(event) =>
                    setInput({ ...input, query: event.target.value })
                  }
                  value={input.query}
                />
                {/* Buttons */}
                <Row>
                  <Col md={6}>
                    <Button
                      onClick={resetForm}
                      variant="secondary"
                      type="reset"
                      className="w-100 mt-3"
                    >
                      Reset
                    </Button>
                  </Col>
                  <Col md={6}>
                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 mt-3"
                      style={{ backgroundColor: "#9a6dad" }}
                    >
                      Generate
                    </Button>
                  </Col>
                </Row>
              </Col>
            </Row>
          </Form.Group>
        </Form.Row>
      </Form>

      <FormOutput output={output} />
    </>
  );
};

export default FormInput;
