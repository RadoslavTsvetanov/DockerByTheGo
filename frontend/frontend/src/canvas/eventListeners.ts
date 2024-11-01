
export class CurrentlyPressedKeys{ // potenitally redice to just an object, also ask if its better to just use an object or do it in a class like this
    private static instance: CurrentlyPressedKeys
    pressedKeys:  Record<string, boolean>= { }; 
    private constructor() {
        return 
    }
    public static getInstance(): CurrentlyPressedKeys {
        if (!CurrentlyPressedKeys.instance) {
            CurrentlyPressedKeys.instance = new CurrentlyPressedKeys();
        }
        return CurrentlyPressedKeys.instance;
    }

    add(key: string) {
        this.pressedKeys[key] = true; 
    }

    remove(key: string) {
        this.pressedKeys[key] = false;
    }
    get() {
        return this.pressedKeys
    }

    checkForKeyPresss(keys: string[]) {
        for (const key of keys) {//+
            if (this.pressedKeys[key] == undefined || this.pressedKeys[key] == false) {
                return false;
            }
        }

        return true;
    }
}



/*
why not just do this
const CurrentlyPressedKeys = {
    pressedKeys: [] as string[],

    add(key: string) {
        if (!this.pressedKeys.includes(key)) {
            this.pressedKeys.push(key);
        }
    },

    get(): string[] {
        return this.pressedKeys;
    }
};

or just create an instance of the above class and only export the instance

*/



export const tttt = 4; // TODO: remove later