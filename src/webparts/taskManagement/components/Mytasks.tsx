import * as React from "react";
import { useState, useEffect } from "react";
import { TreeTable } from "primereact/treetable";
import { Column } from "primereact/column";
import { TreeNode } from "primereact/treenode";
import { NodeService } from "./NodeService";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from "primereact/dialog";
import { Label } from "@fluentui/react";

// import "primereact/resources/themes/lara-light-cyan/theme.css";

// import "primeicons/primeicons.css";
// import "primeicons/primeicons.css";

const arrNodes = [
  {
    key: "0",
    data: {
      name: "Applications",
      size: "100kb",
      type: "Folder",
    },
    children: [
      {
        key: "0-0",
        data: {
          name: "React",
          size: "25kb",
          type: "Folder",
        },
      },
      {
        key: "0-1",
        data: {
          name: "editor.app",
          size: "25kb",
          type: "Application",
        },
      },
      {
        key: "0-2",
        data: {
          name: "settings.app",
          size: "50kb",
          type: "Application",
        },
      },
    ],
  },
];
export default function Mytasks() {
  const [editRowKey, setEditRowKey] = useState(null);
  const [visible, setVisible] = useState(false);
  const [add, setAdd] = useState("");
  const [toggle, setToggle] = useState({
    isEdit: false,
    isadd: false,
    isdelete: false,
  });
  const [selectedParent, setSelectedParent] = useState(null);
  const [newRowParentId, setNewRowParentId] = useState(null);

  const [nodes, setNodes] = useState<TreeNode[]>([
    {
      id: "0",
      data: {
        name: "Applications",
        size: "100kb",
        type: "Folder",
      },
      children: [
        {
          id: "0-0",
          data: {
            name: "React",
            size: "25kb",
            type: "Folder",
          },
        },
        {
          id: "0-1",
          data: {
            name: "editor.app",
            size: "25kb",
            type: "Application",
          },
        },
        {
          id: "0-2",
          data: {
            name: "settings.app",
            size: "50kb",
            type: "Application",
            isedit: false,
          },
        },
      ],
    },
  ]);
  const onEditClick = (rowData) => {
    setAdd("");
    toggle.isEdit = true;
    toggle.isadd = false;
    toggle.isdelete = false;
    setToggle({ ...toggle });

    setEditRowKey(rowData.id === editRowKey ? null : rowData.id);
    console.log(editRowKey, "editrowkey");

    // setisEdit(true);
    // setNodes([...nodes]); // Trigger a re-render by updating the nodes state
  };

  const OnAdd = (rowData) => {
    if (add === rowData.id) {
      setAdd(null);
      setAdd(rowData.id);
      toggle.isEdit = false;
      toggle.isadd = false;
      toggle.isdelete = false;
      setToggle({ ...toggle });
    } else {
      setAdd(rowData.id);
      toggle.isEdit = false;
      toggle.isadd = true;
      toggle.isdelete = false;
      setToggle({ ...toggle });
      setEditRowKey(null);
    }
  };
  const deleteRow = (id) => {
    const updatedNodes = deleteNode(nodes, id);
    setNodes(updatedNodes);
  };

  const deleteNode = (nodes, nodeIdToDelete) => {
    return nodes.filter((node) => {
      if (node.id === nodeIdToDelete) {
        return false;
      } else if (node.children) {
        node.children = deleteNode(node.children, nodeIdToDelete);
      }
      return true;
    });
  };

  const actionBodyTemplate = (rowData, rowIndex) => {
    console.log(rowData);
    console.log(toggle);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {/* {(toggle.isadd == false || toggle.isEdit == false) && ( */}

        {toggle.isadd == false && toggle.isEdit == false && (
          <>
            <Button
              onClick={() => onAddChild(rowData.id)}
              icon="pi pi-plus"
              className="p-button-rounded  p-mr-2"
            ></Button>

            <Button
              onClick={() => onEditClick(rowData)}
              icon="pi pi-pencil"
              className="p-button-rounded  p-mr-2"
            ></Button>
            <Button
              icon="pi pi-trash"
              className="p-button-rounded p-button-danger"
              onClick={() => deleteRow(rowData.id)}
            />
          </>
        )}

        {/* )} */}
        {/* <i className="pi-plus-circle"></i> */}
      </div>
    );
  };
  // const actionTemplate = () => {
  //   return (
  //     (toggle.isEdit || toggle.isadd) && (
  //       <div className="flex flex-wrap gap-2">
  //         <Button type="button" icon="pi pi-check" rounded></Button>
  //         <Button
  //           icon="pi pi-times"
  //           rounded
  //           text
  //           severity="danger"
  //           aria-label="Cancel"
  //           onClick={() => setAdd("")}
  //         />
  //       </div>
  //     )
  //   );
  // };

  // };
  // const onAddChild = (rowData, rowIndex) => {
  //   const newChildId = `${nodes[rowIndex].key}-${nodes[rowIndex].children.length}`;
  //   const newChild = {
  //     key: newChildId,
  //     data: {
  //       name: "",
  //       // Add other fields with empty values
  //       size: "",
  //       type: "",
  //     },
  //   };

  //   const updatedNodes = [...nodes];
  //   updatedNodes[rowIndex].children.push(newChild);
  //   setNodes(updatedNodes);
  // };
  // const onAddChild = (rowData, rowIndex) => {
  //   const newChildId = `${nodes[rowIndex].id}-${
  //     nodes[rowIndex].children.length + 1
  //   }`;
  //   const newChild = {
  //     id: newChildId,
  //     data: {
  //       name: "",
  //       size: "",
  //       type: "",
  //     },
  //   };

  //   const updatedNodes = [...nodes];
  //   updatedNodes[rowIndex].children.push(newChild);
  //   setNodes(updatedNodes);
  //   setAdd(newChildId);
  //   setToggle({
  //     isEdit: false,
  //     isadd: true,
  //     isdelete: false,
  //   });
  // };

  // const onAddChild = (rowData, rowIndex) => {
  //   const updatedNodes = [...nodes];
  //   const parentNode = updatedNodes[rowIndex];

  //   const newChildId = `${parentNode.id}-${parentNode.children.length + 1}`;
  //   const newChild = {
  //     id: newChildId,
  //     data: {
  //       name: "",
  //       size: "",
  //       type: "",
  //     },
  //   };

  //   if (!parentNode.children) {
  //     parentNode.children = [];
  //   }

  //   parentNode.children.push(newChild);

  //   setNodes(updatedNodes);
  //   setAdd(newChildId);
  //   setToggle({
  //     isEdit: false,
  //     isadd: true,
  //     isdelete: false,
  //   });
  // };
  // const onAddChild = (rowData, rowIndex) => {
  //   const updatedNodes = [...nodes];
  //   const parentNode = updatedNodes[rowIndex];

  //   const newChildId = `${parentNode.id}-${parentNode.children.length + 1}`;
  //   const newChild = {
  //     id: newChildId,
  //     data: {
  //       name: "",
  //       size: "",
  //       type: "",
  //     },
  //   };

  //   if (!parentNode.children) {
  //     parentNode.children = [];
  //   }

  //   parentNode.children.push(newChild);

  //   setNodes(updatedNodes);
  //   setAdd(newChildId);
  //   setToggle({
  //     isEdit: false,
  //     isadd: true,
  //     isdelete: false,
  //   });
  // };
  // const onAddChild = (rowData, rowIndex) => {
  //   const updatedNodes = [...nodes];
  //   const parentNode = updatedNodes[rowIndex];

  //   if (parentNode && parentNode.id && Array.isArray(parentNode.children)) {
  //     const newChildId = `${parentNode.id}-${parentNode.children.length + 1}`;
  //     const newChild = {
  //       id: newChildId,
  //       data: {
  //         name: "",
  //         size: "",
  //         type: "",
  //       },
  //     };

  //     parentNode.children.push(newChild);
  //     setNodes(updatedNodes);
  //     setAdd(newChildId);
  //     setToggle({
  //       isEdit: false,
  //       isadd: true,
  //       isdelete: false,
  //     });
  //   } else {
  //     console.error("Invalid parentNode or structure");
  //   }
  // };
  // const onAddChild = (rowData, rowIndex) => {
  //   const updatedNodes = [...nodes];
  //   const parentNode = updatedNodes[rowIndex];

  //   if (
  //     parentNode &&
  //     parentNode.data &&
  //     parentNode.data.id &&
  //     Array.isArray(parentNode.children)
  //   ) {
  //     const newChildId = `${parentNode.data.id}-${
  //       parentNode.children.length + 1
  //     }`;
  //     const newChild = {
  //       id: newChildId,
  //       data: {
  //         name: "",
  //         size: "",
  //         type: "",
  //       },
  //     };

  //     parentNode.children.push(newChild);
  //     setNodes(updatedNodes);
  //     setAdd(newChildId);
  //     setToggle({
  //       isEdit: false,
  //       isadd: true,
  //       isdelete: false,
  //     });
  //   } else {
  //     console.error("Invalid parentNode or structure");
  //   }
  // };
  // const onAddChild = (rowData, rowInd) => {
  //   const updatedNodes = [...nodes];
  //   // const parentNode = updatedNodes[rowIndex];
  //   const parentNode = updatedNodes[rowInd.rowIndex];

  //   const newChildId = `${parentNode.children.length}`;
  //   const newChild = {
  //     id: newChildId,
  //     data: {
  //       name: "",
  //       size: "",
  //       type: "",
  //     },
  //   };

  //   if (!parentNode.children) {
  //     parentNode.children = [];
  //   }

  //   parentNode.children.push(newChild);

  //   setNodes(updatedNodes);
  //   setAdd(newChildId);
  //   setToggle({
  //     isEdit: false,
  //     isadd: true,
  //     isdelete: false,
  //   });
  // };
  // const onAddChild = (parentId) => {
  //   const updatedNodes = nodes.map((node) => {
  //     if (node.id === parentId) {
  //       const newChild = {
  //         id: `${parentId}-${node.children.length}`,
  //         data: {
  //           name: "",
  //           size: "",
  //           type: "",
  //         },
  //       };
  //       return {
  //         ...node,
  //         children: [...node.children, newChild],
  //       };
  //     }
  //     return node;
  //   });

  //   setNodes(updatedNodes);
  //   setAdd(parentId); // Set the newly added child to edit mode
  // };
  // const onAddChild = (parentId) => {
  //   const updatedNodes = nodes.map((node) => {
  //     if (node.id === parentId) {
  //       const newChild = {
  //         id: `${parentId}-${node.children.length}`,
  //         data: {
  //           name: "",
  //           size: "",
  //           type: "",
  //         },
  //       };
  //       // Create a new children array with the added child
  //       const updatedChildren = [...node.children, newChild];
  //       // Return a new node object with the updated children array
  //       return {
  //         ...node,
  //         children: updatedChildren,
  //       };
  //     }
  //     return node;
  //   });

  //   setNodes(updatedNodes);
  //   setEditRowKey(null);
  //   setNewRowParentId(parentId);
  //   toggle.isadd = true;
  //   setToggle({ ...toggle });
  //   setAdd(parentId); // Set the newly added child to edit mode
  // };
  const onAddChild = (parentId) => {
    const updatedNodes = nodes.map((node) => {
      if (node.id === parentId) {
        const newChild = {
          id: `${parentId}-${node.children.length + 1}`, // Adjust the ID creation logic as needed
          data: {
            name: "",
            size: "",
            type: "",
          },
          children: [],
        };
        node.children.push(newChild);
      }
      return node;
    });

    setNodes(updatedNodes);
    setEditRowKey(null); // Reset edit mode for other rows
    setNewRowParentId(parentId); // Set the newly added child to edit mode
  };
  const actionTemplate = (rowData) => {
    return (toggle.isEdit && editRowKey === rowData.id) ||
      (toggle.isadd && add === rowData.id) ? (
      <div className="flex flex-wrap gap-2">
        <Button type="button" icon="pi pi-check" rounded></Button>
        <Button
          icon="pi pi-times"
          rounded
          text
          severity="danger"
          aria-label="Cancel"
          onClick={() => {
            setAdd("");
            setEditRowKey(null);
            setToggle({
              ...toggle,
              isadd: false,
              isEdit: false,
              isdelete: false,
            });
          }}
        />
      </div>
    ) : null;
  };

  // Inside the TreeTable component:
  // <Column body={actionTemplate} headerClassName="w-10rem" />;

  const sizeTemplate = (rowData, field) => {
    console.log(editRowKey);
    console.log(add);

    const data = rowData?.data;

    if (data) {
      if (editRowKey === rowData.id) {
        return (
          <InputText
            type="text"
            value={data[field]}
            // onChange={(e) => onEditorValueChange(rowData, e.target.value)}
          />
        );
      } else if (newRowParentId === rowData.id) {
        return (
          <InputText
            type="text"
            value={""}
            // onChange={(e) => onEditorValueChange(rowData, e.target.value)}
          />
        );
      } else {
        return <span>{data[field]}</span>;
      }
    }
    return null;
  };
  // const sizeTemplate = (rowData, field) => {
  //   const data = rowData?.data;

  //   if (data) {
  //     if (editRowKey === rowData.id || newRowParentId === rowData.id) {
  //       return (
  //         <InputText
  //           type="text"
  //           value={data[field]}
  //           // Implement onChange handler as needed
  //         />
  //       );
  //     } else {
  //       return <span>{data[field]}</span>;
  //     }
  //   }
  //   return null;
  // };
  return (
    <div className="card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          margin: "10px 0px",
        }}
      >
        <Label>My Tasks</Label>
        <Button
          label="New task"
          severity="warning"
          onClick={() => {
            setNodes([
              ...nodes,
              {
                id: `${nodes.length}`,
                data: {
                  name: "",
                  size: "",
                  type: "",
                },
                children: [],
              },
            ]);
            setAdd(`${nodes.length}`);
          }}
        />
      </div>
      <TreeTable
        value={nodes}
        tableStyle={{ minWidth: "100%" }}
        selectionMode="checkbox"
      >
        <Column
          field="name"
          // body={actionBodyTemplate}
          // rowEditor={true}
          header="Name"
          expander
          sortable
          // onCellEditInit={(e) => console.log(e, "e")}
          // style={{ height: "3.5rem" }}
          body={(rowData) => sizeTemplate(rowData, "name")}
          // editor={sizeTemplate}
        ></Column>
        <Column
          headerClassName="w-10rem"
          body={(rowData, rowIndex) => actionBodyTemplate(rowData, rowIndex)}
        />

        <Column
          field="size"
          header="Data"
          sortable
          body={(rowData) => sizeTemplate(rowData, "size")}
          style={{ height: "3.5rem" }}
        ></Column>
        <Column
          field="type"
          header="Type"
          sortable
          body={(rowData) => sizeTemplate(rowData, "type")}
        ></Column>

        <Column body={actionTemplate} headerClassName="w-10rem" />
      </TreeTable>
      <></>
    </div>
  );
}
