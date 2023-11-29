import * as React from "react";

const Tasks = (props): JSX.Element => {
  console.log("props > ", props.selectedMember);

  return <div>{props.selectedMember}</div>;
};

export default Tasks;
