import { Toast } from "../models/toast";

export namespace ToastActions {
  export class Push {
    static readonly type = '[Toast] Push';
    constructor(public toast: Toast) {}
  }

  export class Error extends Push {
    constructor(text: string, lifetime: Toast["lifetime"] = 3000, removeOnClick: Toast["removeOnClick"] = true) {
      super({ text, lifetime, removeOnClick, ...{ type: "error" } });
    }
  }

  export class Success extends Push {
    constructor(text: string, lifetime: Toast["lifetime"] = 3000, removeOnClick: Toast["removeOnClick"] = true) {
      super({ text, lifetime, removeOnClick, ...{ type: "success" } });
    }
  }

  export class Warning extends Push {
    constructor(text: string, lifetime: Toast["lifetime"] = 3000, removeOnClick: Toast["removeOnClick"] = true) {
      super({ text, lifetime, removeOnClick, ...{ type: "warning" } });
    }
  }

  export class Info extends Push {
    toast: Toast;
    constructor(text: string, lifetime: Toast["lifetime"] = 3000, removeOnClick: Toast["removeOnClick"] = true) {
      super({ text, lifetime, removeOnClick, ...{ type: "info" } });
    }
  }

  export class Remove {
    static readonly type = '[Toast] Remove';
    constructor(public toast: Toast) {}
  }

  export class Hold {
    static readonly type = '[Toast] Hold';
    constructor(public toast: Toast) {}
  }

  export class Release {
    static readonly type = '[Toast] Release';
    constructor(public toast: Toast) {}
  }
}
