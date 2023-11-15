import { useState, useEffect } from "react";
import DagreGraph from "dagre-d3-react";
import styles from "./QueryVisualizer.module.css";
import Col from "react-bootstrap/Col";
import heuristicsData from "./heuristics.json";
import DiskVisualizer from "./DiskVisualizer";

const QueryVisualizer = (props) => {
  const nodes = [];
  const links = [];

  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [selectedNode, setSelectedNode] = useState(null); // Declare selectedNode state

  // Hide tooltip when either data changes or plan changes.
  useEffect(() => {
    setShowTooltip(false);
  }, [props.output, props.planId]);

  // Loads data for nodes and links into the graph.
  const getData = () => {
    if (
      props.output["error"] === false &&
      props.output["data"].hasOwnProperty(props.planId)
    ) {
      props.output.data[props.planId]["graph"]["nodes"].forEach((node) => {
        const nodeType = node.node_type;
        nodes.push({
          id: node.id,
          // label: `${nodeType}\n`,
          label: `${node.node_type}\nTable: ${node.id}\n`,
          class: `${styles.queryNode}`,
        });
      });

      props.output.data[props.planId]["graph"]["links"].forEach((link) => {
        links.push({
          source: link.source,
          target: link.target,
          class: `${styles.queryLink}`,
        });
      });
    } else {
      return null;
    }
  };

  // Helper function to format node data for tooltip
  const formatTooltipText = (nodeData) => {
    const tableContent = `
      <tr>
        <th>ID</th>
        <th>Cost</th>
        <th>Depth</th>
        <th>Node Type</th>
      </tr>
      <tr>
        <td>${nodeData.id}</td>
        <td>${parseFloat(nodeData.cost).toFixed(2)}</td>
        <td>${nodeData.depth}</td>
        <td>${nodeData.node_type}</td>
      </tr>
    `;
    return tableContent;
  };

  const displayHeuristicsInfo = (nodeType) => {
    const heuristicsInfo = heuristicsData[nodeType];

    if (heuristicsInfo) {
      return (
        <div>
          <h5>{nodeType}</h5>
          <p>{heuristicsInfo.description}</p>
        </div>
      );
    } else {
      return (
        <div>
          <h5>{nodeType}</h5>
          <p>No information available for {nodeType}</p>
        </div>
      );
    }
  };

  // When clicking on a graph's node, show tooltip with extra node data.
  const onNodeClick = (event) => {
    if ("original" in event) {
      const nodeId = event["original"]["id"];
      const node = props.output.data[props.planId]["graph"]["nodes"].find(
        (n) => n.id === nodeId
      );

      if (node) {
        setSelectedNode(node); // Set selectedNode
        const formattedText = formatTooltipText(node);
        setTooltipText(formattedText);
        setShowTooltip(true);
      }
    }
  };

  return getData() !== null ? (
    <div className={styles.container}>
      <div className={styles.graphContainer}>
        <div className={styles.graphWrapper}>
          <DagreGraph
            nodes={nodes}
            links={links}
            config={{
              rankdir: "TB",
              align: "UL",
              ranker: "tight-tree",
            }}
            width="100%"
            height="100%"
            animate={1000}
            shape="rect"
            fitBoundaries={true}
            zoomable
            onNodeClick={onNodeClick}
            // Use the nodeStyle function to apply styles to nodes
            nodeStyle={(node) => ({
              fill: heuristicsData[node.label.split("\n")[0]]
                ? "#007bff"
                : "red",
            })}
          ></DagreGraph>
        </div>
      </div>

      <Col md={6}>
        <div className={styles.tooltipContainer}>
        <div className={styles.explanationWrapper} style={{marginBottom: "3%"}}>
          <h3 style={{ textAlign: "center" }}>QEP Explanations</h3>
          <p style={{ textAlign: "center" }}>
            Text explanation of the QEP for each steps.
          </p>
          <hr />
          {/* Use the parseExplanation prop passed from FormOutput */}
          {props.parseExplanation(props.planId)}
        </div>

        {/* MULAI DISINI */}
        <div
            className={`${styles.graphTooltip} ${
              showTooltip ? "" : styles.hideTooltip
            }`
          }
          style={{marginBottom: "3%"}}
          >
            <h3 style={{ textAlign: "center" }}>Disk Visualization</h3>
            <p style={{ textAlign: "center" }}>
              Comparing accessed rows to total rows in a table.
            </p>
            <hr />
            <DiskVisualizer output={props.output} selectedNode = {selectedNode}/>
          </div>

          <div
            className={`${styles.graphTooltip} ${
              showTooltip ? "" : styles.hideTooltip
            }`}
            style={{marginBottom: "3%"}}
          >
            <h3 style={{ textAlign: "center" }}>Additional Information</h3>
            <p style={{ textAlign: "center" }}>
              Detailed information about each node
            </p>
            <hr />
            <span className={styles.tooltipText}>
              {tooltipText && (
                <table className={styles.tooltipTable}>
                  <tbody dangerouslySetInnerHTML={{ __html: tooltipText }} />
                </table>
              )}
              {selectedNode && displayHeuristicsInfo(selectedNode.node_type)}
            </span>
          </div>
        </div>
      </Col>
    </div>
  ) : (
    <div className={styles.graphLoadingWrapper}>
      <span>No data to show</span>
    </div>
  );
};

export default QueryVisualizer;
