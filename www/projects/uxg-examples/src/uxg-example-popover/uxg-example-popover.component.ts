import { Component } from '@angular/core';
import { UxgPopoverContentDirection } from "uxg";

@Component({
  selector: 'uxg-example-popover',
  templateUrl: './uxg-example-popover.component.html'
})
export class UxgExamplePopoverComponent {

  PopoverContentDirection = UxgPopoverContentDirection;
  direction = UxgPopoverContentDirection.bottomLeft;

  readonly example = `<uxg-popover>
  <button uxgPopoverTrigger uxgButton outline lg>Click me</button>
  <div *uxgPopoverContent="direction">Sample text</div>
</uxg-popover>`;

  readonly example_1 = `export class FooComponent {
  direction = UxgPopoverContentDirection.bottomLeft;
}`;
}
