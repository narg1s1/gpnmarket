import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Agreement } from "../../../agreements/common/models/Agreement";

@Component({
  selector: 'app-star-rating',
  templateUrl: './star-rating.component.html',
  styleUrls: ['./star-rating.component.scss']
})
export class StarRatingComponent implements OnInit {

  stars: number[] = [1, 2, 3, 4, 5];

  @Input() agreement: Agreement;
  @Output() sendRating = new EventEmitter<number>();
  @Output() close = new EventEmitter();

  rateValue: number;

  constructor() {
  }

  ngOnInit(): void {
  }

  setRating(star) {
    this.rateValue = star;
  }

  onSendRating() {
    this.sendRating.emit(this.rateValue);
  }
}
