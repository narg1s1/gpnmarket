import {
  ChangeDetectionStrategy,
  Component,
  Input, OnChanges,
  OnInit,
  SimpleChanges
} from '@angular/core';
import {Title} from "@angular/platform-browser";

/**
 * Title component
 */
@Component({
  selector: 'app-title',
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TitleComponent implements OnInit, OnChanges {

  @Input() titlePage: string;

  constructor(
    public title: Title
  ) {
    this.titlePage = '';
  }

  ngOnInit(): void {
    setTimeout(() => { // Expression has changed after it was checked
      this.setPageTitle(this.titlePage);
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    setTimeout(() => { // Expression has changed after it was checked
      this.setPageTitle(this.titlePage);
    });
  }

  setPageTitle(titlePage) {
    this.title.setTitle(titlePage);
  }
}
