const IdGenerator = {
    id: 0,
    generateId() {
        this.id++;
        return this.id;
    }
}


export function generateId() {
    return IdGenerator.generateId();
}