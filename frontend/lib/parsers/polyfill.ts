if (typeof globalThis.DOMMatrix === "undefined") {
  // @ts-ignore
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1;
    b = 0;
    c = 0;
    d = 1;
    e = 0;
    f = 0;
    static fromMatrix() {
      return new DOMMatrix();
    }
    translate() {
      return this;
    }
    scale() {
      return this;
    }
    multiply() {
      return this;
    }
    transformPoint(p: any) {
      return p;
    }
  };
}
export {};
