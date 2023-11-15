import re
import ast
import json
from sys import stderr
import networkx as nx
from networkx.readwrite import json_graph
from custom_errors import *


""" #################################################################### 
Creates a graph, and a text explanation for a given query execution plan
#################################################################### """

def visualize_ctid(sql_query, res, schema):
    try:
        #ctid always in column 0
        # Extract columns from the SELECT statement
        num_ctid = len(schema)
        # print(f"num_ctid: {num_ctid}")
        
        data_blocks = {}
        index = 0
        prev_index_col = 0
        for tables, column in schema.items():
            # print(f"tables: {tables}")
            data_blocks[tables] = {}
            # print(f"data_blocks[tables] initial: {data_blocks}")
            num_col = len(column)
            # print(f"num_col: {num_col}")

            for entry in res:
                ctid = entry[index]
                # print(f"ctid: {ctid}")
                # print(f"type ctid: {type(ctid)}")
                # print(f"entry: {entry}")
                # print(f"type: {type(entry)}")
                # print(f"len tuple: {len(entry)}")
                ctid_numbers = str_to_tuple(ctid)
                # print(f"ctid_numbers: {ctid_numbers}")
                # print(f"data_blocks[tables]1: {data_blocks[tables]}")

                if ctid_numbers[0] not in data_blocks[tables]:
                    data_blocks[tables][ctid_numbers[0]] = {}
                # print(f"data_blocks[tables]2: {data_blocks[tables]}")
                if ctid_numbers[1] in data_blocks[tables][ctid_numbers[0]]:
                    raise ValueError("Two tuples is occupying the same page")
                else:
                    # print(f"num_ctid + prev_index_col: {num_ctid + prev_index_col}")
                    # print(f"res[num_ctid + prev_index_col: ] : {entry[3:]}")
                    # print(f"to be inserted: {entry[(num_ctid + prev_index_col): (num_ctid + prev_index_col) + (num_col) ]}")
                    # print(f"num_col: {num_col}")
                    data_blocks[tables][ctid_numbers[0]][ctid_numbers[1]] = entry[(num_ctid + prev_index_col): (num_ctid + prev_index_col) + (num_col) ]
            
            # print(f"data_blocks: {data_blocks}")
            prev_index_col = num_col
            index+=1

        print(f"data_blocks: {data_blocks}")
        return data_blocks    
    except CustomError as e:
        raise CustomError(str(e))
    except:
        raise CustomError("Error in extract_columns() - Unable to extract columns.")

    return 0

def visualize_explain_query(plan):
    try:
        plan = json.loads(plan)
        queue = []
        visited = []

        unique_id = 1

        explanation = ""

        graph = nx.DiGraph()

        if "Plan" in plan:
            root = plan["Plan"]
            print(f"root: {root}")
            root["id"] = string_unique_id(unique_id)
            root["depth"] = 0
            root_node = string_unique_id(unique_id)

            # unique_id = chr(ord(unique_id) + 1)
            unique_id += 1
            # unique_id = get_next_unique_id(unique_id)

            queue.append(root)

            graph.add_node(
                root["id"],
                node_type=root["Node Type"],
                plan_rows = root["Plan Rows"],
                cost=root["Startup Cost"] + root["Total Cost"],
                depth=root["depth"],
            )

            while queue:
                curr = queue.pop(0)
                visited.append(curr)
                children = []

                if "Plans" in curr:
                    depth = curr["depth"] + 1

                    for child in curr["Plans"]:
                        if child not in visited:
                            child["id"] = string_unique_id(unique_id)
                            child["depth"] = depth
                            # unique_id = chr(ord(unique_id) + 1)
                            # unique_id = get_next_unique_id(unique_id)
                            unique_id += 1
                            queue.append(child)
                            children.append(child)

                            graph.add_node(
                                child["id"],
                                node_type=child["Node Type"],
                                plan_rows = child["Plan Rows"],
                                cost=child["Startup Cost"] + child["Total Cost"],
                                depth=depth,
                            )

                            graph.add_edge(curr["id"], child["id"])

                    explanation = craft_explanation_string(
                        explanation, curr["Node Type"], children, curr["id"]
                    )

                # If we reach here, we are at a leaf node, add the table itself to the graph
                else:
                    table = {}
                    table["id"] = string_unique_id(unique_id)
                    table["depth"] = curr["depth"] + 1
                    # unique_id = chr(ord(unique_id) + 1)
                    # unique_id = get_next_unique_id(unique_id)
                    unique_id += 1

                    graph.add_node(
                        table["id"],
                        node_type=curr["Relation Name"],
                        cost=0,
                        depth=table["depth"],
                    )

                    graph.add_edge(curr["id"], table["id"])

                    explanation = craft_explanation_string(
                        explanation, curr["Node Type"], curr, curr["id"]
                    )

            # Return graph as JSON
            data = json_graph.node_link_data(graph)

            # Format the explanation to go from leaf to root. We return a list. The last element is an empty string, so pop it first
            explanation = explanation.split(".")
            explanation.pop(-1)
            explanation.reverse()

            return data, explanation
        else:
            return {}
    except CustomError as e:
        raise CustomError(str(e))
    except:
        raise CustomError(
            "Error in visualize_explain_query() - Unable to get the graph and explanation for the query."
        )


""" #################################################################### 
Crafts the explanation string for the graph
#################################################################### """


def craft_explanation_string(explanation, node_type, child_names, curr_name):
    try:
        explanation += node_type + " "

        # Take care of joins and sorts
        if (
            node_type == "Hash"
            or node_type == "Sort"
            or node_type == "Incremental Sort"
            or node_type == "Gather Merge"
            or node_type == "Merge"
            or node_type == "Aggregate"
        ):
            explanation += child_names[0]["id"] + " as " + curr_name + "."
        elif (
            node_type == "Hash Join"
            or node_type == "Nested Loop"
            or node_type == "Merge Join"
        ):

            if node_type == "Nested Loop":
                explanation += "Join "

                explanation += (
                    "between "
                    + child_names[0]["Node Type"]
                    + " "
                    + child_names[0]["id"]
                    + " (outer) and "
                    + child_names[1]["Node Type"]
                    + " "
                    + child_names[1]["id"]
                    + " (inner) as "
                    + curr_name
                    + "."
                )

        else:
            # nodes like Materialize
            try:
                explanation += child_names[0]["id"] + " as " + curr_name + "."
            # Relation nodes
            except:
                explanation += (
                    "on " + child_names["Relation Name"] + " as " + curr_name + "."
                )
        return explanation
    except CustomError as e:
        raise CustomError(str(e))
    except:
        raise CustomError(
            "Error in craft_explanation_string() - Unable to generate text explanation of graph."
        )


""" #################################################################### 
Generates a unique ID (running character sequence) for nodes as a string
#################################################################### """


def string_unique_id(unique_id):
    try:
        return "T" + str(unique_id)
    except CustomError as e:
        raise CustomError(str(e))
    except:
        raise CustomError(
            "Error in string_unique_id() - Unable to generate unique id for QEP nodes."
        )

def str_to_tuple(str):
    try:
        result_tuple = ast.literal_eval(str)
        if isinstance(result_tuple, tuple):
            return result_tuple
        else:
            raise ValueError("The string does not represent a valid tuple.")
    except (ValueError, SyntaxError) as e:
        print(f"Error: {e}")