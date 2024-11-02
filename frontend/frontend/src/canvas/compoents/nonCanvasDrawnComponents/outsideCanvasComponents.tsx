import React, { useEffect } from 'react';
import { actionsManager } from "../../entities/actionManager";
import { Cursor, CursorType } from "../../cursor";
import { undoRedoStack } from "../../canvas";

function setCursorType(type: CursorType) {
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
  <div className="flex gap-4">
    <button type="button" onClick={onClick}>
      <img className="h-10 w-10" src={icon} alt={alt} />
    </button>
  </div>
);

interface BaseMenuProps {
  options: OptionElementProps[];
}

const BaseMenu: React.FC<BaseMenuProps> = ({ options }) => (
  <div>
    {options.map((option, index) => (
      <OptionElement key={index} {...option} />
    ))}
  </div>
);

const UpperMenu: React.FC<BaseMenuProps> = ({ options }) => (
  <BaseMenu options={options} />
);

const UndoRedoMenu: React.FC<BaseMenuProps> = ({ options }) => (
  <BaseMenu options={options} />
);

export const Menu: React.FC = () => {
  const upperMenuOptions = [
    {
      icon: "https://example.com/icon1.png",
      alt: "Circle",
      onClick: () => setCursorType(CursorType.Circle),
    },
    {
      icon: "https://example.com/icon2.png",
      alt: "Rectangle",
      onClick: () => setCursorType(CursorType.Rectangle),
    },
    {
      icon: "https://example.com/icon3.png",
      alt: "TextArea",
      onClick: () => setCursorType(CursorType.TextArea),
    },
    {
      icon: "https://example.com/icon.png",
      alt: "Select",
      onClick: () => setCursorType(CursorType.Select),
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
  ];

  return (
    <div>
      <div id="menuContainer">
        <UpperMenu options={upperMenuOptions} />
      </div>
      <div id="undoRedoMenuContainer">
        <UndoRedoMenu options={undoRedoMenuOptions} />
      </div>
    </div>
  );
};


