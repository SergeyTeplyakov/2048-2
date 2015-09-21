function notNull(a: any): boolean {
    return a !== null && a !== undefined;
}

class Contract {

    public static enabled = true;

    public static requires(predicate: boolean, message: string): void {
        if (Contract.enabled) {
            if (!predicate) {
                throw new Error(`Precondition failed: '${message}'`);
            }
        }
    }

    public static ensures(predicate: boolean, message: string): void {
        if (Contract.enabled) {
            if (!predicate) {
                throw new Error(`Postcondition failed: '${message}'`);
            }
        }
    }

    public static assert(predicate: boolean, message: string): void {
        if (Contract.enabled) {
            if (!predicate) {
                throw new Error(`Assertion failed: '${message}'`);
            }
        }
    }
}