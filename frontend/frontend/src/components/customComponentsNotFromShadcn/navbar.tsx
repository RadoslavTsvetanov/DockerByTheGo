import * as Tabs from "@radix-ui/react-tabs";
import * as Popover from "@radix-ui/react-popover";
import React from "react";
import { Alert } from "~/types/alert";




export const NavBarItem: React.FC<{
  onItemClicked: () => void;
  title: string;
}> = ({ onItemClicked, title }) => {
  return (
    <button
      className="rounded-md px-4 py-2 text-white hover:bg-blue-700 focus:outline-none"
      onClick={onItemClicked}
    >
      {title}
    </button>
  );
};

export const Navbar: React.FC<{
  setSelectedElement: (index: number) => void;
  selectedElement: number;
  items: string[];
}> = ({ setSelectedElement, selectedElement, items }) => {
  return (
    <div className="flex space-x-4 rounded-md bg-gray-800 p-4">
      {items.map((item, index) => (
        <div
          key={item}
          className={`${
            index === selectedElement ? "bg-blue-500" : "bg-gray-700"
          } rounded-md`}
        >
          <NavBarItem
            onItemClicked={() => setSelectedElement(index)}
            title={item}
          />
        </div>
      ))}
    </div>
  );
};

export type subview = {
    name: string,
    elementToDisplay: React.ComponentType
}

export const SubPager: React.FC<{ subviews: subview[] }> = ({ subviews }) => {
    const [selectedElement, setSelectedElement] = React.useState(0); 
  
    return (
        <div>
        <div>
            <Navbar
                setSelectedElement={setSelectedElement}
                selectedElement={selectedElement}
                items={subviews.map(subview => subview.name)}
                />
                {subviews[selectedElement]?.elementToDisplay ||<div> undefined </div>}
        </div>
        <div>
      {subviews.map((Subview, index) => (
        <div key={index} onClick={() => setSelectedElement(index)}><Subview.elementToDisplay  /></div>
      )).filter(subview => subview.key === selectedElement.toString())[0]} // refactor 
    </div>
        </div>
  );
};