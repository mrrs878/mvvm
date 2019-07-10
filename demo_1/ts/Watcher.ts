class Watcher {
  private data: any;
  private getter: Function;
  private cb: Function;
  constructor(_data: any, _exp: string, _cb: Function) {
    this.data = _data;
    this.cb = _cb;
    this.getter = parsePath(_exp);
  }
  get() {
    (window as any).target = this;
    let val = this.getter.call(this.data, this.data);
    (window as any).target = undefined;
    return val;
  }
  update() {
    this.cb(this.get());
  }
}

function parsePath(path: string): Function {
  const keys: string[] = path.split(".");
  return (obj: any) => {
    keys.forEach(elem => {
      elem = elem.replace(/\s*/g, "");
      if (!obj) return;
      obj = obj[elem];
    });
    return obj;
  };
}
