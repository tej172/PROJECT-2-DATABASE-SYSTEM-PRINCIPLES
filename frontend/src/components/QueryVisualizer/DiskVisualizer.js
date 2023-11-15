import { useState, useEffect } from "react";
import DagreGraph from "dagre-d3-react";
import styles from "./QueryVisualizer.module.css";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row"
import { OverlayTrigger, Button, Tooltip, Container, ProgressBar } from 'react-bootstrap';
import Table from 'react-bootstrap/Table';
import heuristicsData from "./heuristics.json";
import { renderToStaticMarkup } from 'react-dom/server';

import Carousel from 'react-bootstrap/Carousel';
const DiskVisualizer = (props) => {
  let nodes;
  let links;
  let additional_info = {};
  let schema_dict;
  let edges;

  let selectedNode 

  function createGraph(edges) {
    const graph = {};
  
    edges.forEach(({ source, target }) => {
      if (graph[source]) {
        // If source is already a key, push the target to the existing list
        graph[source].push(target);
      } else {
        // If source is not a key, create a new list with the target
        graph[source] = [target];
      }
    });
  
    return graph;
  }

  const getData = () => {
    console.log("am i called?");
    console.log(props.output["data"]);
    console.log("finished printing");

    let data_dict = props.output;

    if (data_dict.hasOwnProperty("data") && data_dict["data"]["0"]) {
      if (data_dict["data"]["0"].hasOwnProperty('graph')){
        nodes = data_dict["data"]["0"]["graph"]["nodes"];
        schema_dict = props.output.schema_dict
        let transformedDict = {};
        Object.values(nodes).forEach(item => {
          transformedDict[item.id] = {};
          for (const key in item) {
            if (key !== 'id') {
              transformedDict[item.id][key] = item[key];
            }
          }
        });

        nodes = transformedDict
        links = data_dict["data"]["0"]["graph"]["links"];
        edges = createGraph(links)
        selectedNode = props.selectedNode
        return 1;
      }
    } else {
      return null;
    }
  };


  const createProgressBar = ({planRows, totalRow, variant}) =>{
    const now = Math.max((41517056 / 100) * 10, planRows*50);
    return(
      <ProgressBar animated variant= {variant} max={41517056} label={planRows} now={now} />
    )

  }


  function multiplyList(numbers) {
    // Use the reduce function to multiply all numbers in the array
    return numbers.reduce((accumulator, currentValue) => accumulator * currentValue, 1);
  }

  const ProgressBarsObject = () => {
    return (
      <div>
        {Object.keys(edges)
        .reverse()
        .map((index) => {
        
        const connectingEdges = edges[index]
        const sourceIndex = index 
        const sourceInfo = nodes[index]
        
        console.log(sourceIndex)
        console.log("print sourceIndex")
        
        console.log(sourceInfo)
        console.log("print sourceInfo")
        console.log(nodes)
        console.log("print nodes")
        

        //for one element only
        if (connectingEdges.length == 1){
          const edge = connectingEdges[0]
          const sourceTarget = edge
          const targetInfo = nodes[sourceTarget]
          console.log(sourceTarget)
          console.log("print sourceTarget")
          console.log(targetInfo)
          console.log("print targetInfo")

          if (!targetInfo.hasOwnProperty("plan_rows")){
            const targetTable = targetInfo.node_type
            const totalRow = schema_dict[targetTable]
            const planRows = sourceInfo.plan_rows
            const variant = "success"
            console.log(targetTable)
            console.log("print targetTable")
            console.log(totalRow)
            console.log("print totalRow")
            console.log(planRows)
            console.log("print planRows")
            
            additional_info[sourceIndex] = {"plan_rows" : sourceInfo.plan_rows, "total_rows": totalRow, "tables":targetTable};
            
            console.log(selectedNode)
            console.log("print selectedNode")
            console.log(typeof(selectedNode))
            console.log("print type(selectedNode)")

            if (sourceIndex == selectedNode.id){
              return (
                <div>
                  <h4>Resulting Table</h4>
                  <hr/>
                  <h4>Table {sourceIndex}</h4>
                  <Table striped bordered hover>
                    <thead>
                      <tr>
                        <th>Total Row</th>
                        <th>Row Accessed</th>
                        <th>Table Accessed</th>
                        <th>Type of Access</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>{totalRow}</td>
                        <td>{planRows}</td>
                        <td>{targetTable}</td>
                        <td>{sourceInfo.node_type}</td>
                      </tr>
                    </tbody>
                  </Table>
              
                  {createProgressBar({planRows, totalRow, variant})}
                </div>
              )
            }
          }
        }else{
          let barDisplayed = []
          let prevRow = []
          connectingEdges.map((edge) => {
            console.log("inside else case")
            console.log(edge)
            console.log("print edge")

            console.log(additional_info)
            console.log("print additional_info")
            
            const planRows = additional_info[edge].plan_rows
            const totalRow = additional_info[edge].total_rows
            const targetTable = additional_info[edge].tables
            const variant = "warning"
            
            prevRow.push(planRows)
            //print out the first
            barDisplayed.push(
              <div>
                <hr/>
                <h4> Table {edge} </h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Total Row</th>
                      <th>Row Accessed</th>
                      <th>Table Accessed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{totalRow}</td>
                      <td>{planRows}</td>
                      <td>{targetTable}</td>
                    </tr>
                  </tbody>
                </Table>
                {createProgressBar({planRows, totalRow, variant})}
                <hr/>
              </div>
            )
          })

          const planRows = sourceInfo.plan_rows
          const totalRow = multiplyList(prevRow)
          const variant = "danger"
          additional_info[sourceIndex] = {"plan_rows" : planRows, "total_rows": totalRow, "tables": "N.A"};

          if (sourceIndex == selectedNode.id){
            return(
              <div>
                <h4>Intermediate Table</h4>
                {barDisplayed}
                <hr/>
                <h4>Resulting Table</h4>
                <hr/>
                <h4> Table {sourceIndex} </h4>
                <Table striped bordered hover>
                  <thead>
                    <tr>
                      <th>Total Row</th>
                      <th>Row Accessed</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>{totalRow}</td>
                      <td>{planRows}</td>
                    </tr>
                  </tbody>
                </Table>
                {createProgressBar({planRows, totalRow, variant})}
  
              </div>
            )
          }

        }
        })}
      </div>
    );
  };
  
  

  // Call getData before returning the JSX
  return (props.selectedNode !== null && getData() !== null) ? (
    <Container>
      {console.log("VERY BEGGINING")}
      {console.log(props.selectedNode)}
      {console.log("print selectedNode")}
      {ProgressBarsObject()}
    </Container>
  ) : (
    <div className={styles.graphLoadingWrapper}>
      <span>No data to show</span>
    </div>
  );
};


export default DiskVisualizer;
