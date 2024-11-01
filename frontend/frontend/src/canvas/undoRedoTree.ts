import {
  SelectedElementsManager,
  CanvasElementsManager,
} from "./objectsManager.js";

export class Snapshot {
  private selectedThingsManager: SelectedElementsManager;
  private currentElementsManager: CanvasElementsManager;

  constructor(
    selectedThingsManager: SelectedElementsManager,
    currentElementsManager: CanvasElementsManager
  ) {
    this.selectedThingsManager = selectedThingsManager.clone();
    this.currentElementsManager = currentElementsManager.clone();
  }

  getSnapshotCopy() {
    return {
      selectedThingsManager: this.selectedThingsManager.clone(),
      currentElementsManager: this.currentElementsManager.clone(),
    };
  }
}


export class UndoRedo {
  public snapshots: Snapshot[] = [];
  private undoSnapshots: Snapshot[] = [];
  public currentCanvasObjects: CanvasElementsManager;
  public selectedObjects: SelectedElementsManager;

  constructor(
    selectedThingsManager: SelectedElementsManager,
    currentThingsManager: CanvasElementsManager
  ) {
    this.currentCanvasObjects = currentThingsManager;
    this.selectedObjects = selectedThingsManager;
  }

  private addSnapshot(snapshot: Snapshot): void {
    this.snapshots.push(snapshot);
  }

  takeSnapshot(): void {
    const snapshot = new Snapshot(
      this.selectedObjects,
      this.currentCanvasObjects
    );
    this.addSnapshot(snapshot);
    this.undoSnapshots = [];
  }

  sync(): void {
    if (this.snapshots.length === 0) {
      return;
    }

    const latestSnapshot = this.snapshots[this.snapshots.length - 1];
    const snapshotCopy = latestSnapshot.getSnapshotCopy();

    this.currentCanvasObjects.objects = snapshotCopy.currentElementsManager.objects;
    this.selectedObjects.objects = snapshotCopy.selectedThingsManager.objects;
  }

  undo(): void {
    const latestState = this.snapshots.pop();
    if (latestState === undefined) {
      return;
    }
    this.undoSnapshots.push(latestState);
    this.sync();
  }

  redo(): void {
    const latestUndoneSnapshot = this.undoSnapshots.pop();
    if (latestUndoneSnapshot === undefined) {
      return;
    }
    this.snapshots.push(latestUndoneSnapshot);
    this.sync();
  }
}
