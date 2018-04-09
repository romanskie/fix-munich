import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LoadingSpinnerService } from '../../services/loading-spinner.service';

@Component({
  selector: 'app-loading-spinner',
  templateUrl: './loading-spinner.component.html',
  styleUrls: ['./loading-spinner.component.css']
})
export class LoadingSpinnerComponent implements OnInit {
  @Input() name: string;
  private isShowing = false;
  @Input() get show(): boolean {
    return this.isShowing;
  }

  set show(val: boolean) {
    this.isShowing = val;
    this.showChange.emit(this.isShowing);
  }

  @Output() showChange = new EventEmitter();

  constructor(private loadingSpinnerService: LoadingSpinnerService) { 
  }

  ngOnInit() {
    if (!this.name) throw new Error("Spinner must have a 'name' attribute.");
    this.loadingSpinnerService._register(this);
  }

  ngOnDestroy(): void {
    this.loadingSpinnerService._unregister(this);
  }

}
