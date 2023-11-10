import { useState, useEffect } from "react";
import axios from "axios";
import fs from "fs/promises";
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

  // Example queries folder
  const exampleQueriesFolder = "sample_queries";

  useEffect(() => {
    // Load example queries on component mount
    loadExampleQueries();
  }, []);

  const loadExampleQueries = async () => {
    try {
      const files = await fs.readdir(exampleQueriesFolder);

      const queries = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(
            `${exampleQueriesFolder}/${file}`,
            "utf-8"
          );
          return content.trim(); // Trim whitespace
        })
      );

      setExampleQueries(queries);
    } catch (error) {
      console.error("Error loading example queries:", error);
    }
  };

  const setExampleQuery = (exampleQuery) => {
    setInput({ ...input, query: exampleQuery });
  };

  const setExampleQueries = (queries) => {
    // Set example queries in the state
    console.log("Loaded example queries:", queries);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    setShowLoading(true);
    setOutput((oldState) => {
      return { ...oldState, status: "Generating output...", error: false };
    });

    if (input.query !== "") {
      axios
        .post("/generate", input)
        .then((response) => {
          setShowLoading(false);
          // Handle error gracefully
          if (response.status === false || response.data["error"] === true) {
            setOutput((oldState) => {
              return {
                ...oldState,
                status: response.data["status"],
                error: true,
              };
            });
            setShowError(true);
          } else {
            console.log(response.data);
            setOutput((oldState) => {
              return {
                ...oldState,
                data: response.data["data"],
                bestPlanId: response.data["best_plan_id"],
                status: response.data["status"],
                error: false,
              };
            });
            setShowSuccess(true);
          }
        })
        .catch((error) => {
          setShowLoading(false);
          setOutput((oldState) => {
            return {
              ...oldState,
              status:
                "Error generating output. Please check your query's formatting and/or validity.",
              error: true,
            };
          });
          setShowError(true);
        });
    } else {
      setShowLoading(false);
      setOutput((oldState) => {
        return {
          ...oldState,
          status: "Error generating output. Please input an SQL query.",
          error: true,
        };
      });
      setShowError(true);
    }
  };

  const limitPredicates = (event) => {
    event.target.checked = false;
    setShowPredicateWarning(true);
  };

  // Handles user's adding of predicates, and limits them if it goes above 4 predicates.
  const handleChecked = (event) => {
    setInput((oldState) => {
      const index = oldState.predicates.indexOf(event.target.id);

      if (event.target.checked) {
        if (index <= -1) {
          // If too many, stop user from choosing more.
          if (oldState.predicates.length >= 4) {
            limitPredicates(event);
            return oldState;
          }
          oldState.predicates.push(event.target.id);
        }
      } else {
        if (index > -1) {
          oldState.predicates.splice(index, 1);
        }
      }

      return { ...oldState, predicates: oldState.predicates };
    });
  };

  // Resets the form's state.
  const resetForm = (event) => {
    setInput({
      query: "",
      predicates: [],
    });
    setOutput({
      data: {},
      best_plan_id: 1,
      status: "",
      error: false,
    });
  };

  // Helper function to display selected predicates to the user.
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
      {
        <>
          <div className={styles.toastWrapper}>
            <Toast
              bsPrefix={styles.toastLoading}
              animation={true}
              autohide={false}
              delay={3000}
              onClose={() => {
                setShowLoading(false);
              }}
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
              onClose={() => {
                setShowSuccess(false);
              }}
              show={showSuccess}
            >
              <Toast.Header bsPrefix={styles.toastHeader}>
                Success!
              </Toast.Header>
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
              onClose={() => {
                setShowError(false);
              }}
              show={showError}
            >
              <Toast.Header bsPrefix={styles.toastHeader}>Error!</Toast.Header>
              <Toast.Body bsPrefix={styles.toastBody}>
                {output.status}
              </Toast.Body>
            </Toast>
          </div>
        </>
      }

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
                    your query across multiple lines using the 'Enter' key. We
                    do not support deep nesting of queries at the moment, but
                    one level nesting is fine.
                  </Form.Text>
                </Form.Group>
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
                      // type="submit"
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
