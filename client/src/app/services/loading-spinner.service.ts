import { Injectable } from '@angular/core';
import { LoadingSpinnerComponent } from '../components/loading-spinner/loading-spinner.component';

@Injectable()
export class LoadingSpinnerService {
    private spinnerCache = new Set<LoadingSpinnerComponent>();

    _register(spinner: LoadingSpinnerComponent): void {
        this.spinnerCache.add(spinner);
    }

    _unregister(spinnerToRemove: LoadingSpinnerComponent): void {
      this.spinnerCache.forEach(spinner => {
        if (spinner === spinnerToRemove) {
          this.spinnerCache.delete(spinner);
        }
      });
    }

    show(spinnerName: string): void {
        this.spinnerCache.forEach(spinner => {
          if (spinner.name === spinnerName) {
            spinner.show = true;
          }
        });
      }
    
    hide(spinnerName: string): void {
        this.spinnerCache.forEach(spinner => {
          if (spinner.name === spinnerName) {
            spinner.show = false;
          }
        });
    }
}  