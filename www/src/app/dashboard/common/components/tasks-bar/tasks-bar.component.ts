import { Component, Input, OnInit } from '@angular/core';
import { DashboardTaskItem } from "../../models/dashboard-task-item";
import { animate, style, transition, trigger } from "@angular/animations";

@Component({
  selector: 'app-tasks-bar',
  templateUrl: './tasks-bar.component.html',
  styleUrls: ['./tasks-bar.component.scss'],
  animations: [
    trigger('showGridTrigger', [
      transition(':enter', [
        style({opacity: 0, height: '0'}),
        animate('350ms ease-out', style({opacity: 1, height: '*'})),
      ]),
      transition(':leave', [
        animate('350ms', style({opacity: 0}))
      ])
    ]),
  ]
})

export class TasksBarComponent {
  @Input() totalCounter: number;
  @Input() tasksBar: DashboardTaskItem[];
  @Input() isTasks = true;

  folded = true;
}
