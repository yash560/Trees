import React, { useState } from "react";

type TreeNode = {
  name: string;
  data?: string;
  children?: TreeNode[];
};

type TagViewProps = {
  node: TreeNode;
  onAddChild: (nodeName: string) => void;
  onUpdateNode: (nodeName: string, updatedFields: Partial<TreeNode>) => void;
};

const TagView: React.FC<TagViewProps> = ({
  node,
  onAddChild,
  onUpdateNode,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(node.name);

  const handleToggleCollapse = () => setCollapsed(!collapsed);

  const handleAddChild = () => {
    onAddChild(node.name);
  };

  const handleNameEdit = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleUpdateNode = () => {
    setEditMode(false);
    onUpdateNode(node.name, { name });
  };

  return (
    <div className="ml-4 border-2 my-2 rounded-md mr-2 overflow-hidden border-gray-200">
      <div className="flex bg-blue-300 items-center">
        <button
          onClick={handleToggleCollapse}
          className="text-white bg-gradient-to-r ml-2 hover:scale-105 active:scale-95 ease-in-out duration-200 from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-1 my-2 text-center me-2"
        >
          {collapsed ? ">" : "v"}
        </button>
        {editMode ? (
          <input
            value={name}
            onChange={handleNameEdit}
            onBlur={handleUpdateNode}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleUpdateNode();
            }}
            className="ml-2 border-b-2 border-blue-500 focus:outline-none"
          />
        ) : (
          <span
            className="ml-2 text-lg font-semibold text-black cursor-pointer"
            onClick={() => setEditMode(true)}
          >
            {name}
          </span>
        )}
        <button
          onClick={handleAddChild}
          className="text-white bg-gradient-to-r ml-auto hover:scale-105 active:scale-95 ease-in-out duration-200 from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-1 my-2 text-center me-2"
        >
          Add Child
        </button>
      </div>

      {!collapsed && (
        <div className="p-2">
          {node.data && (
            <input
              type="text"
              value={node.data}
              onChange={(e) =>
                onUpdateNode(node.name, { data: e.target.value })
              }
              className="block w-full px-2 py-1 border border-gray-300 rounded-lg"
            />
          )}

          {node.children && (
            <div className="">
              {node.children.map((child, index) => (
                <TagView
                  key={index}
                  node={child}
                  onAddChild={onAddChild}
                  onUpdateNode={onUpdateNode}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagView;
