import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { trigger, animate, style, group, animateChild, query, stagger, transition } from '@angular/animations';
import { AuthService } from '../core/auth.service';
import * as _ from 'lodash';

export const routerTransition = trigger('routerAnimation', [
    // route 'enter' transition
    transition(':enter', [

        // css styles at start of transition
        style({ opacity: 0 }),

        // animation and styles at end of transition
        animate('.3s', style({ opacity: 1 }))
    ]),
])

@Component({
    selector: 'app-root',
    animations: [routerTransition],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    showAppInfo: boolean;
    userRoles: Array<string>; // roles of currently logged in uer

    constructor(public router: Router, public authService: AuthService) {
        this.showAppInfo = this.shouldShowAppInfoLayer();
        authService.user.map(user => {
            /// Set an array of user roles, ie ['isAdmin', 'isReader', ...]
            if(user){
                return this.userRoles = _(user.role).pickBy().keys().value();
            }else{
                return this.userRoles = [];
            }
          })
          .subscribe()
    }

    private shouldShowAppInfoLayer(){
        if(!(/Android|iPhone/i.test(window.navigator.userAgent))){
            return true;
        }else{
            return false;
        }
    }

    getRouteAnimation(outlet) {
        return outlet.activatedRouteData.animation;
    }

    goToLogin = () => {
        this.router.navigateByUrl('/login');
    }


    ///// Authorization Logic /////
    isAdmin() {
        const allowed = ['isAdmin']
        return this.matchingRole(allowed)
    }

    /// Helper to determine if any matching roles exist
    private matchingRole(allowedRoles): boolean {
        return !_.isEmpty(_.intersection(allowedRoles, this.userRoles))
    }
}

