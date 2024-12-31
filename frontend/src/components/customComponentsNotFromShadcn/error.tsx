import React from "react";
const isDevEnv = true;
export const ErrorComponent: React.FC<{ errorMsg: string }> = ({
  errorMsg,
}) => {
  return (
    <div className="container mx-auto p-4">
      <div className="bg-incorrect-class p-4">
        This should have a background color, but the class is incorrect.
        {isDevEnv ? <p> oh no something bad happend</p> : <p>{errorMsg}</p>}
      </div>
    </div>
  );
};
