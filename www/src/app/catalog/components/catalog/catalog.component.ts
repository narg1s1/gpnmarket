import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.component.html',
  styleUrls: ['./catalog.component.scss']
})
export class CatalogComponent implements OnInit {
  public searchText: string;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.searchText = this.route.snapshot.queryParamMap.get('q');

    if (this.searchText) {
      this.onSearch(this.searchText);
    }
  }

  public onSearch(searchStr: string): void {
    this.router.navigate(['catalog/search'], {queryParams: {q: searchStr}});
  }
}
