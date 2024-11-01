import { actionsManager } from "./actionManager.js";
import { Cursor, CursorType } from "./cursor.js";
import { undoRedoStack } from "./canvas.js";
type cdnImageLink = string;

function setCursorType(type: CursorType) {
  const cursor = Cursor.getInstance();
  cursor.type = type;
}
setCursorType(CursorType.Rectangle);
setCursorType(CursorType.Idle);

class OptionElement {
  private icon: cdnImageLink;
  private onClicked: () => void;
  private alt: string;

  constructor(icon: cdnImageLink, onClicked: () => void, alt: string) {
    this.icon = icon;
    this.onClicked = onClicked;
    this.alt = alt;
  }

  render(index: number): string {
    return `
      <div class="flex gap-4">
        <button type="button" id="option-button-${index}">
          <img class="h-10 w-10" src="${this.icon}" alt="${this.alt}">
        </button>
      </div>
    `;
  }

  attachEvent(index: number): void {
    const button = document.getElementById(`option-button-${index}`);
    if (button) {
      button.addEventListener("click", this.onClicked);
    }
  }
}

abstract class BaseMenu {
  protected options: OptionElement[];

  constructor(options: OptionElement[]) {
    this.options = options;
  }

  addOption(option: OptionElement): void {
    this.options.push(option);
  }

  render(): string {
    return this.options.map((option, index) => option.render(index)).join("");
  }

  attachEvents(): void {
    this.options.forEach((option, index) => option.attachEvent(index));
  }
}

class UpperMenu extends BaseMenu {
  constructor(options: OptionElement[]) {
    super(options);
  }

  // Additional methods specific to UpperMenu if needed
}

class UndoRedoMenu extends BaseMenu {
  constructor(options: OptionElement[]) {
    super(options);
  }

  // Additional methods specific to UndoRedoMenu if needed
}

// Example usage
export const setUpExternalComponentsOnLoad = () => {
  const menuContainer = document.getElementById("menuContainer");

  const option1 = new OptionElement(
    "https://example.com/icon1.png",
    () => {
      setCursorType(CursorType.Circle);
    },
    "Circle"
  );
  const option2 = new OptionElement(
    "https://example.com/icon2.png",
    () => {
      setCursorType(CursorType.Rectangle);
    },
    "Rectangle"
  );
  const option3 = new OptionElement(
    "https://example.com/icon3.png",
    () => { setCursorType(CursorType.TextArea)},
    "TextArea"
  )
  const option4 = new OptionElement("https://example.com/icon",
    () => { setCursorType(CursorType.Select) },
    "Select"
  )
  const upperMenu = new UpperMenu([option1, option2,option3,option4]);
  if (menuContainer) {
    menuContainer.innerHTML = upperMenu.render();
    upperMenu.attachEvents(); // Attach events after rendering
  }
};

const undoOption = new OptionElement(
  "https://example.com/undo.png",
  () => {
    undoRedoStack.undo()
  },
  "Undo"
);
const redoOption = new OptionElement(
  "https://example.com/redo.png",
  () => {
    undoRedoStack.redo();
  },
  "Redo"
);

const undoRedoMenu = new UndoRedoMenu([undoOption, redoOption]);
const undoRedoMenuContainer = document.getElementById("undoRedoMenuContainer");
if (undoRedoMenuContainer) {
  undoRedoMenuContainer.innerHTML = undoRedoMenu.render();
  undoRedoMenu.attachEvents(); // Attach events after rendering
}
