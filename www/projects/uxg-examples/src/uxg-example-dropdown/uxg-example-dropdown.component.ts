import { Component } from '@angular/core';
import { FormControl, FormGroup } from "@angular/forms";

@Component({
  selector: 'uxg-example-dropdown',
  templateUrl: './uxg-example-dropdown.component.html'
})
export class UxgExampleDropdownComponent {
  public showCode = false;
  readonly example = `<uxg-dropdown class="app-dropdown" placeholder="Drop me down...">
  <div uxgDropdownItem>Option 1</div>
  <div uxgDropdownItem value="string">Option with string value</div>
  <div uxgDropdownItem [value]="12">Option int value</div>
  <div uxgDropdownItem disabled>Disabled option</div>
</uxg-dropdown>`;

  suggest = null;

  readonly example2 = `<uxg-dropdown-input #ac placeholder="Наименование МТР" (focus)="ac.toggle(true)">
  <div class="app-dropdown-items-header app-ghost-color">ТИП ЖИЛЫ</div>
  <div uxgDropdownItem value="A">А <span class="app-ghost-color">— алюминиевая жила, если буквы нет — жила медная</span></div>
  <div uxgDropdownItem value="Обязательное">АА <span class="app-ghost-color">— алюминиевая жила и свинцовая оболочка</span></div>
  <br/>
  <div class="app-dropdown-items-header app-ghost-color">ЧАСТО ЗАКУПАЛОСЬ</div>
  <div uxgDropdownItem >Кабель КВВГнг(А) 14х1,5</div>
  <div uxgDropdownItem >Кабель ВБШвнг(А)-ХЛ 2х6ок-0,66</div>
</uxg-dropdown-input>`;
}
