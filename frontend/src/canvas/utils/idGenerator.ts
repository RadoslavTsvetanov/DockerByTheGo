class IdGenerator{
    id = 0
    generateId() {
        return this.id++;
   } 
}

const idGen = new IdGenerator()


export function generateId() {
    return idGen.generateId();
}