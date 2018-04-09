import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-login',
  templateUrl: './user-login.component.html',
  styleUrls: ['./user-login.component.css']
})
export class UserLoginComponent implements OnInit {

    loginPassword: string = '';
    loginEmailAddress: string = '';

    constructor(public auth: AuthService, public router: Router) { }

    ngOnInit() {
    }

    login = () => {
        this.auth.emailLogin(this.loginEmailAddress, this.loginPassword);
    }
}
