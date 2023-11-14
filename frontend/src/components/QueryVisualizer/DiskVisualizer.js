import { useState, useEffect } from "react";
import DagreGraph from "dagre-d3-react";
import styles from "./QueryVisualizer.module.css";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row"
import { OverlayTrigger, Button, Tooltip } from 'react-bootstrap';
import heuristicsData from "./heuristics.json";

const DiskVisualizer = ({ctid}) => {


  const renderRows = () => {
    const rows = [];
    console.log(ctid)

    for (var key in ctid) {
      var value = ctid[key];
      rows.push(
        <Col key={key}>
          Block {key}
          <ChildComponent tuples = {value}/>
        </Col>
      );
      console.log(key)
    }

    return rows;
  };

  return <>{renderRows()}</>;
};

const ChildComponent = ({ tuples }) => {
    const tooltip = (text) => (
        <Tooltip id="tooltip">
          {text}
        </Tooltip>
    );

    const renderRows = () => {
        const rows = [];
        
        for (var key in tuples) {
          var value = tuples[key];
          rows.push(
            <Col cs = {1} key={key}>
              <OverlayTrigger placement="left" overlay={tooltip(value)}>
                  <Button bsStyle="default">{key}</Button>
              </OverlayTrigger>
            </Col>
          );
          console.log(key)
        }

      
        return rows;
      };
    
    return <>{renderRows()}</>;
};

export default DiskVisualizer;
