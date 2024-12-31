import React, { useState } from 'react';
import { actionsManager } from "../../entities/actionManager";
import { Cursor, CursorTypes } from "../../entities/cursor";
import { undoRedoStack } from "../../canvas";
import { zoom } from '~/canvas/entities/scale';

function setCursorType(type: CursorTypes) {
  const cursor = Cursor.getInstance();
  cursor.type = type;
}
type cdnImageLink = string; 

interface OptionElementProps {
  icon: cdnImageLink; 
  alt: string;
  onClick: () => void;
}

const OptionElement: React.FC<OptionElementProps> = ({ icon, alt, onClick }) => (
  <div className="w-full">
    <button
      type="button"
      onClick={onClick}
      className="flex items-center justify-center p-2 h-12 w-12 rounded-md bg-slate-700 hover:bg-slate-800 active:bg-slate-900 transition-colors"
    >
      <img className="h-8 w-8" src={icon} alt={alt} />
    </button>
  </div>
);

interface BaseMenuProps {
  options: OptionElementProps[];
}

const BaseMenu: React.FC<BaseMenuProps> = ({ options }) => { 

  const [selected, setSelected] = useState(0);

  return (
    <div className="flex space-x-2 bg-slate-700 p-2 rounded-lg">
      {options.map((option, index) => (
        <div key={index} className={`border-x-2  border-slate-500 rounded-md ${selected === index ? "border-red-600" : "bg-slate-600"}`}>
          <OptionElement {...option} onClick={() => {
            setSelected(index)
            option.onClick()
          }} />
        </div>
      ))}
    </div>
  )
};

const UpperMenu: React.FC<BaseMenuProps> = ({ options }) => (
  <BaseMenu options={options} />
);

const UndoRedoMenu: React.FC<BaseMenuProps> = ({ options }) => (
  <BaseMenu options={options} />
);

export const Menu: React.FC = () => {
const [state, setState] = useState("using it to just trigger a rerender when the user changes the zoom level")

  const upperMenuOptions = [
    {
      icon: "https://example.com/icon1.png",
      alt: "Circle",
      onClick: () => setCursorType(CursorTypes.Circle),
    },
    {
      icon: "https://example.com/icon2.png",
      alt: "Rectangle",
      onClick: () => setCursorType(CursorTypes.Rectangle),
    },
    {
      icon: "https://example.com/icon3.png",
      alt: "TextArea",
      onClick: () => setCursorType(CursorTypes.TextArea),
    },
    {
      icon: "https://example.com/icon.png",
      alt: "Select",
      onClick: () => setCursorType(CursorTypes.Select),
    },
  ];

  const undoRedoMenuOptions = [
    {
      icon: "https://example.com/undo.png",
      alt: "Undo",
      onClick: () => undoRedoStack.undo(),
    },
    {
      icon: "https://example.com/redo.png",
      alt: "Redo",
      onClick: () => undoRedoStack.redo(),
    },
    {
      icon: "",
      alt: `${zoom.getZoomLevel().toString() } %`,
      onClick: () => { zoom.resetZoomLevel(); setState("")} 
    }
  ];

  return (
    <div className="space-y-4 p-4 bg-slate-900 rounded-lg shadow-lg">
      <div id="menuContainer">
        <UpperMenu options={upperMenuOptions} />
      </div>
      <div id="undoRedoMenuContainer">
        <UndoRedoMenu options={undoRedoMenuOptions} />
      </div>
    </div>
  );
};

