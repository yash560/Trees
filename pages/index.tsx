import React, { useState, useEffect } from "react";
import TagView from "@/components/Tags";
import axios from "axios";

type TreeNode = {
  name: string;
  data?: string;
  children?: TreeNode[];
};

const deepClone = (obj: unknown) => {
  return JSON.parse(JSON.stringify(obj));
};

const TreeView: React.FC = () => {
  const [tree, setTree] = useState<TreeNode | null>({
    name: "root",
    children: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTree = async () => {
      try {
        const response = await axios.get<TreeNode[]>("/api/tree");
        const [treeData] = response.data;
        setTree(treeData);
        setLoading(false);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setTree({
              name: "root",
              children: [],
            });
          } else {
            console.error("Failed to load tree data:", err.message);
            setError("Failed to load tree data");
          }
        } else {
          console.error("Unexpected error:", err);
          setError("An unexpected error occurred");
        }
        setLoading(false);
      }
    };

    fetchTree();
  }, []);

  const generateChildName = (
    parentName: string,
    children: TreeNode[] | undefined
  ) => {
    if (!children || children.length === 0) {
      return `${parentName}-c1`;
    }
    const lastChild = children[children.length - 1].name;
    const match = lastChild.match(/-(c)(\d+)$/);
    const nextIndex = match ? parseInt(match[2], 10) + 1 : 1;
    return `${parentName}-c${nextIndex}`;
  };

  const doesNameExist = (node: TreeNode, newName: string): boolean => {
    if (node.name === newName) return true;
    if (node.children) {
      return node.children.some((child) => doesNameExist(child, newName));
    }
    return false;
  };

  const addChild = async (parentName: string) => {
    if (!tree) return;

    const newTree = deepClone(tree);
    let newChild: TreeNode | null = null;

    const addToNode = (node: TreeNode) => {
      if (node.name === parentName) {
        if (!node.children) {
          node.children = [];
        }

        if (node.data) {
          delete node.data;
          newChild = {
            name: generateChildName(node.name, node.children),
            data: "Data",
          };
          node.children = [newChild];
        } else {
          newChild = {
            name: generateChildName(node.name, node.children),
            data: "Data",
          };
          node.children.push(newChild);
        }
      } else if (node.children) {
        node.children.forEach(addToNode);
      }
    };

    addToNode(newTree);
    setTree(newTree);

    if (newChild) {
      try {
        await axios.post("/api/tree", {
          parentName,
          child: newChild,
        });
      } catch (err) {
        console.error("Failed to add child to the tree:", err);
      }
    }
  };

  const updateNode = async (
    nodeName: string,
    updatedFields: Partial<TreeNode>
  ) => {
    if (!tree) return;

    const newTree = deepClone(tree);

    const updateNodeFields = (node: TreeNode) => {
      if (node.name === nodeName) {
        if (updatedFields.name && updatedFields.name !== nodeName) {
          if (doesNameExist(newTree, updatedFields.name)) {
            alert("A node with that name already exists!");
            return;
          }
        }
        Object.assign(node, updatedFields);
      } else if (node.children) {
        node.children.forEach(updateNodeFields);
      }
    };

    updateNodeFields(newTree);
    setTree(newTree);

    try {
      await axios.put("/api/tree", { tree: newTree });
    } catch (err) {
      console.error("Failed to update tree:", err);
    }
  };

  const exportTree = async () => {
    if (!tree) return;

    try {
      const exportedData = JSON.stringify(tree, null, 2);

      const blob = new Blob([exportedData], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = "tree.json";
      document.body.appendChild(link);
      link.click();

      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      alert("Tree exported successfully!");
    } catch (err) {
      console.error("Failed to export tree:", err);
      alert("Failed to export tree. Please check the console for details.");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="py-4 mx-auto">
      {tree && (
        <TagView node={tree} onAddChild={addChild} onUpdateNode={updateNode} />
      )}
      <button
        onClick={exportTree}
        className="hover:scale-105 m-4 active:scale-95 ease-in-out duration-200 text-gray-900 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center me-2 mb-2"
      >
        Export
      </button>
    </div>
  );
};

export default TreeView;
