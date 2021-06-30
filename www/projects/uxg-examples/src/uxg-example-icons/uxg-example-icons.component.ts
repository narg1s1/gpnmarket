import { Component } from '@angular/core';
import { UxgIcons } from "uxg";

@Component({
  selector: 'uxg-example-icons',
  templateUrl: './uxg-example-icons.component.html',
  styleUrls: ['./uxg-example-icons.component.scss']
})
export class UxgExampleIconsComponent {
  shapes = Object.keys(UxgIcons);
  ctx = { $implicit: "" };

  getExmample(shape: string) {
    let example = `<uxg-icon shape="${shape}"></uxg-icon>`;

    if (this.hasSolid(shape)) {
      example += `\n<uxg-icon shape="${shape}" class="is-solid"></uxg-icon>`;
    }
    return example;
  }

  hasSolid(shape: string): boolean {
    return this.getSvgDoc(shape).documentElement.classList.contains("has-solid");
  }

  getDefaultSize(shape) {
    const doc = this.getSvgDoc(shape);
    return doc.documentElement.attributes.getNamedItem("viewBox").value.split(" ").pop();
  }

  private getSvgDoc(shape: string): Document {
    return new DOMParser().parseFromString(UxgIcons[shape], "image/svg+xml");
  }
}
