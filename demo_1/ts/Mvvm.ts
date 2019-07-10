class Mvvm {
  private $options: Options;
  private $data: object;
  constructor(_options: Options) {
    this.$options = _options;
    this.$data = _options.data;

    observe(this.$data);

    let data = this.$data;
    Object.keys(data).forEach(key => {
      Object.defineProperty(this, key, {
        enumerable: true,
        configurable: true,
        get() {
          return this.$data[key];
        },
        set(newVal) {
          this.$data[key] = newVal;
        }
      });
    });

    new Compile(_options.el, this.$data);
  }
}

class Observe {
  private dep: Dep;
  private data: any;
  constructor(_data: any) {
    this.data = _data;
    this.dep = new Dep();
    this.defineProperty();
  }

  defineProperty() {
    let that = this;
    Object.keys(that.data).forEach(elem => {
      let val: any = that.data[elem];
      observe(val);
      Object.defineProperty(that.data, elem, {
        enumerable: true,
        configurable: true,
        get() {
          (window as any).target && that.dep.depend((window as any).target);
          return val;
        },
        set(newVal: any) {
          if (newVal === val) return;
          val = newVal;
          that.dep.notify();
          observe(val);
        }
      });
    });
  }
}

class Compile {
  private el: Element | null;
  private data: any;
  constructor(_selector: string, _data: any) {
    this.el = document.querySelector(_selector);
    this.data = _data;

    let fragement: DocumentFragment = document.createDocumentFragment();
    let child: ChildNode | null = null;
    while ((child = this.el && this.el.firstChild))
      fragement.appendChild(child);
    this.replace(fragement);
    this.el && this.el.appendChild(fragement);
  }

  replace(frgmt: DocumentFragment | ChildNode) {
    const EXP = /\{\{(.*)\}\}/;
    frgmt.childNodes.forEach((node: ChildNode) => {
      let text: string | null = node.textContent;
      if (node.nodeType === 3 && text && EXP.test(text)) {
        let watcher = new Watcher(this.data, RegExp.$1, (newVal: any) => {
          node.textContent = text && text.replace(EXP, newVal);
        });
        watcher.update();
      }
      if (node.childNodes) this.replace(node);
    });
  }
}

function observe(_data: any): Observe | null {
  if (typeof _data !== "object") return null;
  return new Observe(_data);
}
