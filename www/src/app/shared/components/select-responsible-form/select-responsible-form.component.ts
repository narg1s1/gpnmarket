import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { RequestPosition } from "../../../request/common/models/request-position";
import { Observable, Subscription } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UserService } from "../../../user/service/user.service";
import { User } from "../../../user/models/user";
import { shareReplay } from "rxjs/operators";
import { searchUsers } from "../../helpers/search";
import { Uuid } from "../../../cart/models/uuid";

@Component({
  selector: 'app-select-responsible-form',
  templateUrl: './select-responsible-form.component.html',
  styleUrls: ['./select-responsible-form.component.scss']
})
export class SelectResponsibleFormComponent implements OnInit, OnDestroy {
  @Input() positions?: RequestPosition[] = [];
  @Input() contragentId: Uuid;
  @Input() isRequest = false;
  @Output() setResponsibleUser = new EventEmitter<User>();
  @Output() close = new EventEmitter<User>();
  subscription = new Subscription();
  isLoading: boolean;
  regularBackofficeUsers$: Observable<User[]>;

  form = new FormGroup({
    user: new FormControl(null, Validators.required)
  });

  readonly searchUsers = searchUsers;
  readonly getUserName = ({ fullName, shortName }: User) => fullName ?? shortName;

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.regularBackofficeUsers$ = this.userService.getRegularBackofficeUsers(this.contragentId).pipe(shareReplay(1));
  }

  submit() {
    this.setResponsibleUser.emit(this.form.get('user').value);
    this.close.emit();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }
}
