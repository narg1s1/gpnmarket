import { Component } from '@angular/core';

@Component({
  selector: 'uxg-example-tabs',
  templateUrl: './uxg-example-tabs.component.html'
})
export class UxgExampleTabsComponent {
  readonly example = `<uxg-tabs class="app-tabs-border">
  <uxg-tab-title #tabTitle1 [active]="true">Dashboard</uxg-tab-title>
  <uxg-tab-title #tabTitle2>Management</uxg-tab-title>
  <uxg-tab-title #tabTitle3>Cloud</uxg-tab-title>
</uxg-tabs>
<br/>
<div *uxgTab="tabTitle1">
  <h3>Lorem Ipsum</h3>
  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore
    magna aliqua. Ut enim ad minim veniam, quis nostrud</p>
</div>
<div *uxgTab="tabTitle2">
  <h3>de Finibus Bonorum et Malorum</h3>
  <p>"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti
    atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt
    in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga.</p>
</div>
<div *uxgTab="tabTitle3">
  <h3>On the other hand</h3>
  <p>On the other hand, we denounce with righteous indignation and dislike men who are so beguiled and demoralized
    by the charms of pleasure of the moment, so blinded by desire, that they cannot foresee the pain and trouble
    that are bound to ensue; and equal blame belongs to those who fail in their duty through weakness of will, which
    is the same as saying through shrinking from toil and pain</p>
</div>`;

}
