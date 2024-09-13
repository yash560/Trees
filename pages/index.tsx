import React, { useState, useEffect } from "react";
import TagView from "./TagView"; // Import the recursive TagView component
import axios from "axios";

const TreeView = () => {
  const [tree, setTree] = useState({
    name: "root",
    children: [
      {
        name: "child1",
        children: [{ name: "child1-child1", data: "c1-c1 Hello" }],
      },
      { name: "child2", data: "c2 World" },
    ],
  });

  // Fetch tree from backend on component load
  useEffect(() => {
    const fetchTree = async () => {
      const response = await axios.get("/api/tree");
      setTree(response.data);
    };
    fetchTree();
  }, []);

  const addChild = (parentName) => {
    const newTree = { ...tree };
    const addToNode = (node) => {
      if (node.name === parentName) {
        if (node.data) {
          delete node.data;
          node.children = [{ name: "New Child", data: "Data" }];
        } else {
          node.children.push({ name: "New Child", data: "Data" });
        }
      } else if (node.children) {
        node.children.forEach(addToNode);
      }
    };
    addToNode(newTree);
    setTree(newTree);
  };

  const updateNode = (nodeName, updatedFields) => {
    const newTree = { ...tree };
    const updateNodeFields = (node) => {
      if (node.name === nodeName) {
        Object.assign(node, updatedFields);
      } else if (node.children) {
        node.children.forEach(updateNodeFields);
      }
    };
    updateNodeFields(newTree);
    setTree(newTree);
  };

  const exportTree = async () => {
    const exportedData = JSON.stringify(tree, null, 2);
    console.log(exportedData);
    await axios.post("/api/tree", tree);
  };

  return (
    <div>
      <TagView node={tree} onAddChild={addChild} onUpdateNode={updateNode} />
      <button onClick={exportTree}>Export</button>
    </div>
  );
};

export default TreeView;
